# Relatório de Boas Práticas de Segurança — Central de Renovação

Gerado com a skill `security-best-practices` (referências Express + React). Stack: backend Express 4.19 (Node/CommonJS) com MongoDB/Mongoose recém-adicionado, frontend React 19 + Vite, autenticação JWT via header `Authorization: Bearer` (sem cookies).

## Resumo executivo

Foi encontrada **1 vulnerabilidade Crítica** introduzida nesta própria sessão, ao migrar o repositório de lembretes para o MongoDB: um usuário autenticado comum (não-admin) consegue sobrescrever o lembrete de renovação de **qualquer outro negócio**, de qualquer vendedor, enviando um objeto em vez de string no campo `negocioId`. Também foi encontrada 1 falha **Alta** (o segredo do JWT cai silenciosamente para uma string vazia se `JWT_SECRET` não estiver configurado — risco real agora que o deploy em produção está sendo preparado) e a ausência de proteção contra força bruta no login. O restante são reforços de defesa em profundidade (helmet, CORS, headers) recomendados antes de expor a aplicação publicamente.

As duas findings mais graves (#1 e #2) já foram corrigidas nesta sessão — ver seção "Já corrigido" no fim.

---

## Críticos

### F1 — Injeção NoSQL / bypass de controle de acesso em `POST /api/lembretes`

- **Severidade:** Crítica
- **Local:** `backend/src/data/repositories/lembreteRepository.mongo.js:6` (`definir`), alimentado por `backend/src/services/lembreteService.js:9-18` (`agendarLembrete`), rota `backend/src/routes/lembretes.js:6`
- **Evidência:**
  ```js
  // lembreteRepository.mongo.js
  async function definir({ negocioId, proprietarioId, novaDataRenovacao, motivo }) {
    const lembrete = { negocioId, proprietarioId, novaDataRenovacao, motivo: motivo || null, criadoEm: ... };
    await Lembrete.findOneAndUpdate({ negocioId }, lembrete, { upsert: true }); // sem $set!
    return lembrete;
  }
  ```
  `negocioId` vem direto de `req.body.negocioId` (JSON, pode ser qualquer tipo) e o middleware `exigirProprioOuAdmin` só valida `proprietarioId` do corpo — nunca `negocioId`.
- **Impacto:** Qualquer proprietário autenticado (não precisa ser admin) pode enviar `{"negocioId": {"$ne": null}, "proprietarioId": "<o proprio id>", "meses": 3}` pra `POST /api/lembretes`. O objeto vira operador Mongo no filtro (`{negocioId: {"$ne": null}}`), casando com um lembrete existente de **qualquer** negócio/vendedor. Como o `update` não usa `$set`, o driver faz *replace* do documento inteiro — o lembrete de outro vendedor é apagado e substituído pelo do atacante.
- **Correção:** validar que `negocioId`/`proprietarioId` são strings não vazias antes de usar como filtro, e usar `$set` em vez de substituição total do documento (defesa em profundidade, mesmo com a validação).
- **Status:** ✅ Corrigido nesta sessão (ver "Já corrigido").

---

## Altos

### F2 — `JWT_SECRET` ausente cai silenciosamente para string vazia

- **Severidade:** Alta
- **Local:** `backend/src/config/env.js:7` (`jwtSecret: process.env.JWT_SECRET || ""`), usado em `authService.js` e `middlewares/autenticacao.js`
- **Evidência:** `jwt.sign({...}, jwtSecret, {...})` e `jwt.verify(token, jwtSecret)` — se a env var não estiver setada, `jwtSecret` é `""`, e o app continua funcionando normalmente, assinando/validando tokens com uma chave HMAC vazia (previsível).
- **Impacto:** Se `JWT_SECRET` for esquecido ao configurar o Heroku (erro plausível justamente agora, no meio da configuração do deploy), qualquer pessoa consegue forjar um token válido — inclusive de admin — assinando o próprio JWT com secret `""`. O app não vai dar erro nenhum, só vai ficar silenciosamente inseguro.
- **Correção:** falhar rápido (throw ao subir o servidor) se `JWT_SECRET` não estiver definido, em vez de aceitar `""`.
- **Status:** ✅ Corrigido nesta sessão (ver "Já corrigido").

### F3 — Sem proteção contra força bruta no login

- **Severidade:** Alta (Média isoladamente, mas sobe porque o app está prestes a ficar acessível publicamente)
- **Local:** `backend/src/routes/auth.js`, `POST /api/auth/login`
- **Evidência:** nenhuma tentativa de rate limit — `npm ls` não tem `express-rate-limit` nem equivalente.
- **Impacto:** Tentativas ilimitadas de senha contra qualquer um dos 11 e-mails de proprietário, sem bloqueio nem atraso.
- **Correção:** adicionar `express-rate-limit` (ex: 10 tentativas / 15 min por IP+e-mail) na rota de login.
- **Status:** ✅ Corrigido nesta sessão.

---

## Médios

### F4 — Nenhum header de segurança (`helmet`) configurado

- **Local:** `backend/src/index.js` — sem `helmet()`, sem `X-Content-Type-Options`, sem proteção de clickjacking.
- **Correção:** adicionar `helmet()` cedo na stack de middlewares.
- **Status:** ✅ Corrigido nesta sessão.

### F5 — CORS totalmente aberto (`app.use(cors())`)

- **Local:** `backend/src/index.js:17`
- **Contexto:** o risco clássico de CSRF não se aplica aqui (autenticação é via header `Authorization`, não cookie), mas qualquer site ainda consegue chamar a API cross-origin.
- **Correção:** restringir a origem ao domínio real do Vercel assim que ele existir (`cors({ origin: [...] })`). Não dá pra fixar isso 100% agora porque a URL do Vercel ainda não foi criada.
- **Status:** ✅ Corrigido parcialmente nesta sessão — CORS agora usa uma allowlist configurável (`CORS_ORIGINS`, padrão `http://localhost:5173`). Falta só adicionar a URL do Vercel na env var depois que ela existir.

### F6 — Token JWT guardado em `localStorage`

- **Local:** `frontend/src/context/ProprietarioContext.jsx:30`
- **Contexto:** não achei nenhum sink de XSS na aplicação hoje (sem `dangerouslySetInnerHTML`, `innerHTML`, `eval`, etc. — grep limpo), então isso é uma nota arquitetural de defesa em profundidade, não uma exploração ativa: se um XSS surgir no futuro, o token fica exposto.
- **Correção:** fora de escopo pra mudar agora (exigiria redesenhar auth pra cookie `HttpOnly` + CSRF); manter em mente.
- **Status:** Informativo, sem ação recomendada agora.

---

## Baixos

- **F7** — `X-Powered-By: Express` não desabilitado — coberto pelo `helmet()` (F4), que já remove esse header por padrão (`hidePoweredBy`). Confirmado no teste ao vivo (header ausente na resposta).
- **F8** — `trust proxy` não configurado — corrigido junto com F3/F4 (`app.set("trust proxy", 1)`), necessário agora que existe rate-limit por IP atrás do proxy do Heroku.
- **F9** — Sem `npm audit` no CI — corrigido nesta sessão.
- **F10** — Outras funções dos repositórios `.mongo.js` (`buscarPorId`, etc.) aceitam IDs sem checar `typeof === "string"` — hoje não são exploráveis (só recebem valor de `req.params`, que o Express sempre entrega como string), mas ficam frágeis se um dia alguém passar a chamá-las com dado de `req.body`. Não corrigido (baixo risco real, fica de nota).

---

## Já corrigido nesta sessão

- **F1**: `lembreteService.agendarLembrete` agora rejeita `negocioId`/`proprietarioId` que não sejam string; `lembreteRepository.mongo.js` passou a usar `$set` em vez de substituir o documento inteiro. Testado com o payload malicioso real (`negocioId: {"$ne": null}`) — bloqueado, e o fluxo legítimo continua funcionando.
- **F2**: adicionada checagem que recusa subir o servidor sem `JWT_SECRET`. Testado: sem a variável, o servidor recusa iniciar; com ela, sobe normal.
- **F3**: adicionado `express-rate-limit` (10 tentativas / 15 min por IP) em `POST /api/auth/login` (`backend/src/middlewares/loginRateLimit.js`). Testado ao vivo: as tentativas 11 e 12 em sequência já voltaram `429`.
- **F4**: adicionado `helmet()` cedo na stack de middlewares. Testado ao vivo — headers (`Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, etc.) aparecem na resposta.
- **F5**: CORS trocado de `cors()` aberto pra `cors({ origin: corsOrigins })`, com `corsOrigins` vindo de `CORS_ORIGINS` (env, separado por vírgula), padrão `http://localhost:5173`. Testado ao vivo: origem desconhecida não recebe `Access-Control-Allow-Origin`; `http://localhost:5173` recebe normalmente. Falta só adicionar a URL do Vercel em `CORS_ORIGINS` assim que ela existir.
- **F7**, **F8**, **F9**: ver acima.

## Pendências

- **F6** (token JWT em `localStorage`) — informativo, sem ação recomendada agora.
- **F10** (validação de tipo nos demais `.mongo.js`) — baixo risco hoje, fica pra quando mexer de novo nesses arquivos.
- Nada mais bloqueando o próximo passo (Atlas/Heroku/Vercel) — falta só configurar `CORS_ORIGINS` no Heroku assim que o domínio do Vercel existir.
