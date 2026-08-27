# Integração do módulo “Leads Novos” ao Central de Renovação

> Especificação arquitetural e funcional — versão 1.0 — 26/08/2026

## 1. Finalidade
Este documento define como o Gerenciador de Leads será incorporado ao Central de Renovação.
Ele é a referência obrigatória para frontend, backend, banco, testes e implantação.
Não haverá uma segunda tela de login para Leads Novos.
O Central continuará sendo a porta de entrada única da operação.

## 2. Resultado esperado
O usuário entra no Central com o login atual.
Após autenticação, o sistema identifica seu proprietário estável.
O sistema resolve se ele possui acesso ao módulo de leads.
A navbar mostra Leads Novos somente para usuários autorizados.
Um badge mostra a quantidade de leads novos no escopo do usuário.
Administradores veem a operação global.
Vendedores veem somente a carteira própria.

## 3. Usuários autorizados

| Usuário | Papel | Escopo |
|---|---|---|
| Yago | leads_admin | Global |
| André Melo | leads_admin | Global |
| Renato Oliveira | leads_seller | Próprios leads |
| Sandra Cristina | leads_seller | Próprios leads |
| Jessica Almeida | leads_seller | Próprios leads |
| Nelma Castro | leads_seller | Próprios leads |

Os demais proprietários do Central continuam somente no módulo de renovação.
Eles não verão a aba, o badge ou a página de Leads Novos.

## 4. Objetivos funcionais
1. Reutilizar o JWT existente.
2. Reutilizar o contexto de proprietário.
3. Reutilizar o Layout e a navbar.
4. Adicionar a rota /leads-novos.
5. Exibir contador de leads sem primeiro contato.
6. Aplicar escopo de vendedor no backend.
7. Exibir visão global para administradores.
8. Registrar comentários e tentativas.
9. Permitir status comercial manual.
10. Preservar histórico e auditoria.
11. Permitir simulação local para admins.
12. Permitir arquivamento lógico para admins.
13. Preservar FIFO.

## 5. Fora do escopo
- Google Sheets real.
- n8n em produção.
- WhatsApp.
- e-mail real.
- aplicativo mobile.
- websocket obrigatório.
- novo provedor de autenticação.
- nova tela de login.
- troca do MongoDB do Central.
- transferência de leads por vendedor.
- reordenação manual por vendedor.

## 6. Princípios arquiteturais
### 6.1 Sessão única
O Central emite o JWT.
O frontend mantém o token no contexto atual.
As chamadas de leads enviam Authorization: Bearer <token>.
O Gerenciador não armazena uma sessão paralela.

### 6.2 Segurança no servidor
Esconder um botão não é autorização.
Cada endpoint valida o JWT.
Cada endpoint resolve o vínculo do proprietário.
Cada endpoint aplica o papel efetivo.
Cada consulta aplica o escopo antes de retornar dados.

### 6.3 Supabase protegido
O browser nunca recebe a service role key.
O backend mantém URL e chave em variáveis de ambiente.
O backend normaliza erros do Supabase.
SQL, tokens e stack traces não são enviados ao cliente.

### 6.4 Domínio de fila
O frontend não escolhe vendedor.
O frontend não incrementa cursor.
O backend consulta a ordem oficial.
A transação do Supabase mantém a consistência FIFO.

## 7. Visão de arquitetura
```text
Navegador
  -> React/Vite do Central
  -> JWT do Central
  -> Express /api/leads-novos
  -> guard de autenticação e escopo
  -> serviço de leads
  -> cliente administrativo Supabase
  -> PostgreSQL do Gerenciador
```

## 8. Responsabilidades do frontend
- Renderizar a navbar.
- Consultar o contexto de acesso.
- Renderizar o badge.
- Renderizar fila e tabela.
- Enviar comentários.
- Enviar status.
- Exibir loading.
- Exibir erros recuperáveis.
- Atualizar dados depois de mutações.
- Manter foco e labels acessíveis.

Não cabe ao frontend decidir permissões.
Não cabe ao frontend escolher o próximo vendedor.
Não cabe ao frontend acessar tabelas diretamente.

## 9. Responsabilidades do backend
- Validar token.
- Resolver proprietário.
- Resolver vínculo.
- Aplicar papel.
- Aplicar filtro de carteira.
- Consultar Supabase.
- Chamar serviços de domínio.
- Retornar DTOs estáveis.
- Gerar requestId.
- Registrar logs sem segredo.

Controllers devem permanecer finos.
Regras de negócio devem ficar em serviços.
Consultas devem ficar em repositórios.

## 10. Vínculo de identidade
O Central e o Supabase possuem IDs diferentes.
O vínculo não usará somente nome.
O vínculo não dependerá de texto de e-mail.
O vínculo usará IDs estáveis.

```text
central_owner_id: string único
leads_profile_id: uuid único
leads_role: leads_admin | leads_seller
enabled: boolean
created_at: timestamp
updated_at: timestamp
```

### Exemplo
```json
{
  "centralOwnerId": "jessica-almeida",
  "leadsProfileId": "uuid-jessica",
  "leadsRole": "leads_seller",
  "enabled": true
}
```

Desabilitar um vínculo remove acesso sem apagar histórico.
Mudar o nome exibido não altera a autorização.
Mudar o e-mail não altera a autorização.

## 11. Matriz de permissões
| Recurso | Admin | Vendedor | Sem vínculo |
|---|---:|---:|---:|
| Item na navbar | Sim | Sim | Não |
| Badge global | Sim | Não | Não |
| Badge próprio | Sim | Sim | Não |
| Todos os leads | Sim | Não | Não |
| Leads próprios | Sim | Sim | Não |
| Fila global | Sim | Posição própria | Não |
| Histórico global | Sim | Escopo permitido | Não |
| Tentativa | Sim | Próprio lead | Não |
| Status | Sim | Próprio lead | Não |
| Simulação | Sim | Não | Não |
| Arquivamento | Sim | Não | Não |
| Usuários do módulo | Sim | Não | Não |

## 12. Definição de lead novo
Um lead novo está ativo.
Um lead novo possui atribuição atual.
Um lead novo está no escopo do usuário.
Um lead novo possui status comercial undefined.
Um lead novo possui zero tentativas.
Lead arquivado não é novo.
Lead negotiation não é novo.
Lead won não é novo.
Lead disqualified não é novo.
Lead atrasado pode continuar novo.

| Ativo | Status | Tentativas | Conta |
|---:|---|---:|---:|
| Sim | undefined | 0 | Sim |
| Sim | undefined | 1 | Não |
| Sim | negotiation | 0 | Não |
| Sim | won | 0 | Não |
| Não | undefined | 0 | Não |

## 13. Navbar
A nova entrada se chamará Leads Novos.
A entrada reutiliza o componente NavLink.
A entrada terá rota /leads-novos.
A entrada terá ícone compatível com o Central.
A entrada será renderizada somente após access.canAccessLeads.
O badge será numérico.
O badge será ocultado quando o valor for zero.
O badge será atualizado ao carregar o Layout.
O badge será atualizado após tentativa.
O badge será atualizado após simulação.
O badge será atualizado após arquivamento.
O badge será atualizado ao voltar para a rota.

## 14. Rotas frontend
`/leads-novos` ficará dentro da rota protegida.
Usuário sem sessão será redirecionado para login.
Usuário sem vínculo receberá estado de acesso restrito.
O módulo não deverá quebrar as rotas de renovação.
A rota não deverá renderizar dados antes da autorização.

## 15. Endpoint de acesso
```http
GET /api/leads-novos/access
Authorization: Bearer <jwt>
```

```json
{
  "canAccessLeads": true,
  "isAdmin": false,
  "leadsRole": "leads_seller",
  "unreadCount": 6
}
```

Usuário sem vínculo recebe HTTP 403.

## 16. Endpoint de resumo
```http
GET /api/leads-novos/summary
```

```json
{
  "scope": "owner",
  "totalLeads": 7,
  "newLeads": 6,
  "overdueLeads": 1,
  "inNegotiation": 0,
  "won": 0,
  "disqualified": 0,
  "updatedAt": "2026-08-26T12:00:00.000Z"
}
```

Admin recebe scope global.
Vendedor recebe scope owner.

## 17. Endpoint de fila
```http
GET /api/leads-novos/queue
```

Resposta contém a ordem oficial.
Resposta contém estado de pausa.
Resposta contém ativos por vendedor.
Resposta contém atrasados.
Resposta contém créditos.
Resposta contém leads autorizados.
Vendedor recebe somente sua posição.

## 18. Endpoint de histórico
```http
GET /api/leads-novos/history?limit=50&cursor=<cursor>
```

Limit mínimo é 1.
Limit máximo é 100.
Cursor é opaco.
Admin recebe histórico global.
Vendedor recebe histórico permitido.

## 19. Endpoint de tentativa
```http
POST /api/leads-novos/:leadId/attempt
Content-Type: application/json
```

```json
{
  "comment": "Cliente pediu retorno amanhã.",
  "commercialStatus": "negotiation"
}
```

Comentário é obrigatório.
Status deve pertencer ao enum.
Lead deve estar no escopo.
Não existe limite diário.
Não existe limite de cinco tentativas.
Cada tentativa possui ID único.
O próximo prazo é calculado pelo serviço.
Histórico é gravado na operação.

## 20. Endpoint de simulação
```http
POST /api/leads-novos/simulate
```

```json
{ "quantity": 6 }
```

Somente admin pode simular.
Quantidade aceita de 1 a 10.
Cada lead recebe identidade própria.
Distribuição usa FIFO.
Cursor é persistido.
Resposta informa criados.
Resposta informa distribuídos.

## 21. Endpoint de arquivamento
```http
POST /api/leads-novos/:leadId/archive
```

Somente admin pode arquivar.
Arquivamento é lógico.
Histórico permanece.
Atribuição ativa é encerrada.
Lead não aparece entre ativos.
Lead não aparece no badge.

## 22. Estados comerciais
| Valor | Rótulo | Cor | Regra |
|---|---|---|---|
| undefined | Indefinido | Vermelho | Nenhum contato |
| negotiation | Negociação | Amarelo | Contato iniciado |
| won | Ganho | Verde | Seguro pago |
| disqualified | Desqualificado | Cinza | Fora do escopo |

Estados são alterados manualmente.
O sistema não marca ganho automaticamente.
O sistema não desqualifica por silêncio.
O sistema não usa status para escolher vendedor.

## 23. Fluxo de carregamento
1. Usuário autentica no Central.
2. Central emite JWT.
3. Contexto armazena token.
4. Layout chama access.
5. Backend valida token.
6. Backend resolve vínculo.
7. Backend calcula contador.
8. Layout mostra a entrada.
9. Usuário abre Leads Novos.
10. Frontend chama summary e queue.
11. Backend aplica escopo.
12. Supabase retorna dados.
13. Frontend renderiza operação.

## 24. Fluxo de tentativa
1. Usuário abre lead.
2. Usuário abre modal.
3. Sistema mostra status atual.
4. Usuário seleciona status.
5. Usuário escreve comentário.
6. Frontend valida campos.
7. Backend valida propriedade.
8. Serviço cria tentativa.
9. Serviço atualiza status.
10. Serviço calcula prazo.
11. Serviço grava auditoria.
12. Frontend atualiza linha.
13. Frontend atualiza badge.
14. Histórico mostra o evento.

## 25. Escopo e filtros
Vendedor não pode enviar ownerId para ampliar escopo.
Vendedor não pode consultar ID de outro proprietário.
Vendedor não pode registrar tentativa em lead alheio.
Vendedor não pode arquivar lead.
Admin pode filtrar por proprietário.
Filtros são parametrizados.
Escopo é aplicado antes da serialização.

## 26. Erros
```json
{
  "erro": {
    "code": "LEADS_ACCESS_DENIED",
    "message": "Você não possui acesso ao módulo de Leads Novos.",
    "requestId": "req-123"
  }
}
```

| HTTP | Código |
|---:|---|
| 401 | AUTH_REQUIRED |
| 403 | LEADS_ACCESS_DENIED |
| 403 | LEADS_ADMIN_REQUIRED |
| 404 | LEAD_NOT_FOUND |
| 409 | LEAD_CONFLICT |
| 422 | LEAD_VALIDATION_ERROR |
| 503 | LEADS_PROVIDER_UNAVAILABLE |

## 27. Indisponibilidade
Dashboard de renovação continua carregando.
Leads mostra erro recuperável.
Usuário pode tentar novamente.
Backend gera requestId.
Credenciais não aparecem.
Mensagem: Não foi possível carregar os Leads Novos agora.

## 28. Segurança
- Validar assinatura JWT.
- Validar expiração.
- Revalidar papel efetivo.
- Não confiar em isAdmin do browser.
- Não aceitar perfil Supabase arbitrário.
- Parametrizar consultas.
- Limitar paginação.
- Limitar comentários.
- Limitar simulação.
- Auditar ações administrativas.
- Não registrar tokens.

## 29. Observabilidade
Cada requisição possui requestId.
Eventos: leads_access_checked.
Eventos: leads_summary_loaded.
Eventos: leads_queue_loaded.
Eventos: lead_attempt_registered.
Eventos: lead_status_changed.
Eventos: leads_simulated.
Eventos: lead_archived.
Eventos: leads_provider_error.
Logs contêm rota, duração e status.
Logs não contêm senha ou comentário completo.

## 30. Migração
1. Criar configuração de vínculo.
2. Mapear Yago e André como admins.
3. Mapear quatro vendedores.
4. Implementar resolução.
5. Implementar guard.
6. Implementar serviço summary.
7. Implementar serviço queue.
8. Criar endpoints de leitura.
9. Adicionar rota React.
10. Adicionar navbar.
11. Adicionar badge.
12. Adicionar tentativa.
13. Adicionar histórico.
14. Adicionar simulação.
15. Adicionar arquivamento.
16. Desativar login antigo de leads.
17. Rodar validação completa.

## 31. Rollback
Remover a entrada da navbar.
Desabilitar vínculos.
Manter dados do Supabase.
Manter histórico.
Não apagar leads em rollback de frontend.

## 32. Testes de autorização
- Yago recebe leads_admin.
- André recebe leads_admin.
- Renato recebe leads_seller.
- Sandra recebe leads_seller.
- Jessica recebe leads_seller.
- Nelma recebe leads_seller.
- Outro proprietário recebe 403.
- Token expirado recebe 401.
- Vínculo desativado recebe 403.

## 33. Testes de escopo
- Vendedor vê seus leads.
- Vendedor não altera ownerId.
- Vendedor não acessa lead alheio.
- Admin vê todos.
- Arquivado não aparece ativo.
- Histórico respeita escopo.

## 34. Testes de contador
- undefined com zero tentativas conta.
- undefined com uma tentativa não conta.
- negotiation não conta.
- won não conta.
- disqualified não conta.
- Arquivado não conta.
- Admin recebe soma global.
- Vendedor recebe soma própria.

## 35. Testes de mutação
- Comentário vazio falha com 422.
- Status inválido falha com 422.
- Tentativa válida cria histórico.
- Tentativa não bloqueia por dia útil.
- Tentativa não bloqueia após cinco.
- Prazo seguinte é retornado.
- Simulação exige admin.
- Arquivamento exige admin.
- FIFO avança cursor.

## 36. Testes frontend
- Aba aparece para seis autorizados.
- Aba não aparece para outros.
- Badge reflete API.
- Loading aparece.
- Erro possui retry.
- Rota sem acesso não renderiza dados.
- Não existe segundo login.

## 37. Critérios de aceite
1. Login único pelo Central.
2. Yago vê visão global.
3. André vê visão global.
4. Renato vê própria carteira.
5. Sandra vê própria carteira.
6. Jessica vê própria carteira.
7. Nelma vê própria carteira.
8. Outros não veem a aba.
9. Contador usa zero tentativas.
10. Tentativa cria histórico.
11. Tentativa atualiza prazo.
12. Status é manual.
13. Badge diminui após primeiro contato.
14. Simulação respeita FIFO.
15. Arquivamento preserva histórico.
16. Browser não acessa service role.
17. Supabase indisponível não derruba renovação.
18. Typecheck passa.
19. Lint passa.
20. Testes passam.
21. Build passa.

## 38. Exemplo completo
Yago autentica no Central.
Backend resolve leads_admin.
Navbar exibe Leads Novos.
Contador global retorna 12.
Yago simula seis leads.
Fila distribui pelo cursor FIFO.
Jessica entra no Central.
Jessica recebe somente a própria carteira.
Jessica registra comentário.
Status muda para negotiation.
Badge dela diminui.
Histórico registra texto e horário.
André abre visão global.
André visualiza a mesma operação.

## 39. Decisões protegidas
- Não criar segundo login.
- Não autorizar somente no React.
- Não usar nome como chave.
- Não expor service role.
- Não duplicar FIFO no frontend.
- Não reintroduzir limite diário.
- Não reintroduzir limite de cinco tentativas.
- Não apagar histórico ao arquivar.
- Não liberar dados de outro vendedor.
- Não liberar todos automaticamente.

## 40. Próxima etapa
Após aprovação, criar o plano de implementação.
O plano deve separar identidade, backend, endpoints, navbar, contador, ações, histórico, simulação, arquivamento e validação.
Cada tarefa deve possuir arquivos explícitos.
Cada tarefa deve possuir testes.
Cada tarefa deve possuir critérios verificáveis.

## 41. Integração com a planilha Google Sheets

A planilha oficial será a origem de entrada dos leads.

O sistema terá acesso somente de leitura à planilha.

O sistema nunca escreverá, moverá, excluirá ou reorganizará células.

Identificador da planilha configurada:

```text
1HRCb1ciy_i4-3jEbiOd7xsCy-XqZp2fzY6kbshbf8qM
```

A aba inicial será a aba correspondente ao `gid=0`.

O nome da aba deverá permanecer configurável por ambiente.

O intervalo lido deverá incluir todas as colunas necessárias ao contrato.

As informações comerciais destinadas aos vendedores estão nas colunas M, N, O e P.

O adapter deverá preservar o número original da linha.

O número da linha não será usado como identidade do lead.

## 42. Credencial Google

A conta de serviço do Google já possui permissão de leitor.

O arquivo JSON será configurado durante a instalação do segundo computador.

O arquivo não será commitado.

O arquivo não será copiado para o frontend.

O arquivo não será enviado ao navegador.

O arquivo será montado como segredo no container do backend/worker.

Opção recomendada de configuração:

```text
GOOGLE_APPLICATION_CREDENTIALS=/run/secrets/google-sheets-service-account.json
```

Alternativamente, o conteúdo poderá ser recebido por variável protegida:

```text
GOOGLE_SERVICE_ACCOUNT_JSON=<conteúdo-json-protegido>
```

O processo deverá falhar com mensagem clara se nenhuma credencial existir.

A mensagem de erro não deverá incluir o conteúdo da chave.

## 43. Regra explícita do mockup

A linha 2 da planilha é um mockup e não pode entrar na fila.

O adapter deverá ignorar a linha antes da normalização final.

Critério oficial:

```text
se qualquer célula entre M e P contiver
"<test lead: dummy data"
então a linha é MOCKUP e não é importada
```

A comparação deverá ignorar diferenças de maiúsculas/minúsculas.

A comparação deverá aceitar espaços extras ao redor do texto.

A comparação deverá ser feita após conversão segura para string.

Exemplo que deve ser ignorado:

```text
M: <test lead: dummy data for cpf>
N: <test lead: dummy data for name>
O: <test lead: dummy data for phone>
P: test@meta.com
```

Exemplo que pode ser importado:

```text
M: 903403659166
N: Maria Silva
O: 11999990000
P: maria@empresa.com
```

O sistema deverá registrar a quantidade de linhas ignoradas por mockup.

Linhas ignoradas por mockup não geram lead.

Linhas ignoradas por mockup não geram atribuição.

Linhas ignoradas por mockup não geram evento de fila.

Linhas ignoradas por mockup podem aparecer no relatório técnico da importação.

## 44. Normalização de linhas

Cada linha será convertida para um payload canônico.

O payload deverá conter `sourceRow`.

O payload deverá conter `sourceLeadId`.

O payload deverá conter `rowHash`.

O payload deverá conter os campos M–P normalizados.

O payload deverá conter a data original de entrada.

O payload deverá conter campanha.

O payload deverá conter dados necessários à validação mínima.

Campos vazios deverão ser representados como `null`.

Espaços externos deverão ser removidos.

Telefones deverão ser normalizados sem perder o valor original auditável.

E-mails deverão ser normalizados para comparação sem alterar a apresentação.

Documentos deverão ser normalizados para comparação e validação.

## 45. Idempotência da importação

Uma mesma linha processada duas vezes não pode criar dois leads.

A identidade primária da origem será `sourceLeadId` quando disponível.

O `rowHash` identificará alterações no conteúdo da linha.

O adapter enviará a importação ao comando idempotente do backend.

O backend deverá tratar repetição como atualização ou no-op.

O backend não deverá criar nova atribuição em reprocessamento idêntico.

O histórico deverá distinguir importação nova de atualização.

Falha parcial não deverá atribuir somente parte de uma operação transacional.

## 46. Frequência e execução

Na máquina 24/7, o worker deverá executar sincronização periódica.

Intervalo inicial recomendado: cinco minutos.

O intervalo deverá ser configurável.

O worker deverá impedir duas execuções simultâneas.

O worker deverá possuir timeout de leitura.

O worker deverá registrar início e fim da execução.

O worker deverá registrar duração.

O worker deverá registrar quantidade lida.

O worker deverá registrar quantidade ignorada.

O worker deverá registrar quantidade importada.

O worker deverá registrar quantidade atualizada.

O worker deverá registrar quantidade com erro.

## 47. Pipeline de ingestão

```text
Google Sheets
  -> autenticação de leitura
  -> leitura do intervalo
  -> identificação de linhas mockup
  -> normalização
  -> validação mínima
  -> cálculo de row_hash
  -> comando idempotente de ingestão
  -> deduplicação
  -> distribuição FIFO
  -> auditoria
```

Linhas mockup saem do pipeline antes da validação de lead.

Linhas inválidas tornam-se pendências administrativas.

Linhas válidas entram no comando idempotente.

A escolha do vendedor permanece no domínio FIFO.

O adapter não manterá cursor de fila.

## 48. Implantação no segundo computador

O segundo computador será o host local 24/7.

Ele deverá manter Docker Desktop ou Docker Engine ativo.

Os containers deverão reiniciar automaticamente.

O host deverá possuir conexão de internet estável.

O host deverá possuir horário correto via sincronização NTP.

O host deverá possuir backup da configuração de segredos.

O host não deverá armazenar segredos em imagem Docker.

O host deverá expor somente as portas necessárias.

O frontend poderá ser servido pelo container web.

O backend poderá ser servido pelo container API.

O worker poderá ser um processo separado.

O Supabase local deverá possuir volume persistente.

## 49. Composição Docker recomendada

```yaml
services:
  supabase:
    restart: unless-stopped
  api:
    restart: unless-stopped
    secrets:
      - google_sheets_service_account
  worker:
    restart: unless-stopped
    secrets:
      - google_sheets_service_account
  web:
    restart: unless-stopped
secrets:
  google_sheets_service_account:
    file: ./secrets/google-sheets-service-account.json
```

O arquivo de segredo deverá ter permissões mínimas possíveis.

O arquivo deverá ser ignorado pelo Git.

O compose deverá definir healthchecks.

O worker só deverá processar quando API e Supabase estiverem saudáveis.

## 50. Operação contínua

Healthcheck do Supabase será obrigatório.

Healthcheck da API será obrigatório.

Healthcheck do worker será obrigatório.

Falha do worker deverá permitir reinício automático.

Falha de uma leitura da planilha não deverá apagar leads existentes.

Uma execução com erro deverá permanecer auditável.

O sistema deverá permitir reprocessamento seguro.

O host deverá manter logs rotacionados.

O host deverá alertar quando o worker ficar sem executar.

## 51. Checklist de instalação

1. Instalar Docker.
2. Clonar o repositório.
3. Criar pasta local de segredos.
4. Copiar JSON da conta de serviço.
5. Compartilhar planilha com o e-mail da conta.
6. Configurar ID da planilha.
7. Configurar gid da aba.
8. Configurar intervalo.
9. Configurar variáveis do Supabase.
10. Executar migrations.
11. Executar seed inicial se necessário.
12. Subir containers.
13. Conferir healthchecks.
14. Executar sincronização manual.
15. Confirmar mockup ignorado.
16. Confirmar lead real distribuído.
17. Ativar reinício automático.
18. Registrar procedimento operacional.

## 52. Testes Google Sheets

- credencial válida lê planilha;
- credencial ausente falha sem vazar segredo;
- planilha sem permissão retorna erro orientado;
- gid configurável seleciona aba correta;
- linha 2 mockup é ignorada;
- marcador em M ignora linha;
- marcador em N ignora linha;
- marcador em O ignora linha;
- marcador em P ignora linha;
- marcador em caixa alta também ignora;
- espaços extras não impedem exclusão;
- linha real é normalizada;
- repetição não duplica lead;
- alteração atualiza origem;
- erro parcial não cria atribuição incompleta;
- métrica informa linhas ignoradas.

## 53. Critérios de aceite adicionais

1. A planilha é lida sem escrita.
2. A linha 2 não aparece na fila.
3. O texto mockup em M–P é reconhecido.
4. Um lead real é importado uma única vez.
5. Repetir o worker é seguro.
6. O lead importado usa FIFO.
7. O cursor não fica no adapter.
8. O segredo não aparece no Git.
9. O segredo não aparece no browser.
10. Containers reiniciam após falha.
11. Supabase mantém volume persistente.
12. API continua protegendo proprietários.
13. Contador reflete o lead novo importado.
14. Histórico registra a importação.
15. Logs permitem diagnosticar falhas.

## 54. Próxima etapa de execução

Depois da aprovação desta extensão, criar o plano de implementação.

O plano deverá separar adapter Google Sheets, contrato de linha, filtro de mockup, idempotência, worker, Docker, segredo, endpoint interno e testes.
