# Central de Renovação e Reativação Comercial

**Valor imediato:** organizar a carteira por proprietário, antecipar renovações e transformar leads antigos em novas oportunidades de venda.

> Projeto separado do sistema financeiro da WTG Corretora — não tem ligação de código com ele. Puxa os dados direto da API do Pipedrive.

---

## Status atual

Já em funcionamento local, com dados reais da conta Pipedrive da WTG (não é mais só uma ideia no papel):

- Backend (Node.js/Express) e frontend (React/Vite) rodando e navegáveis.
- Sincronização real com o Pipedrive (`ingestao/sincronizar_pipedrive.py`) — busca a carteira inteira, todas as seguradoras cadastradas (não só um recorte fixo), aplica as regras de negócio descritas abaixo e alimenta o app.
- Repositório no GitHub: `github.com/YagoTorelly/central-renov-wtg` (privado).

**Ainda falta:**
- Login com senha de verdade (hoje é só escolher o usuário na tela, sem autenticação).
- Sincronização automática agendada (GitHub Actions + runner) — por enquanto é rodada manual.
- Telas de "Detalhes do cliente" e parte da Administração (duplicidades já funciona, redistribuição e relatórios ainda não).
- Envio de WhatsApp/e-mail pela interface.

## Ideia central

Uma camada comercial sobre os negócios da corretora, com duas funções principais:

1. Mostrar os clientes e contratos ativos de cada proprietário.
2. Identificar pessoas ou empresas que podem ser reativadas ou receber oferta de outro produto.

## Login por proprietário

Cada proprietário acessa só sua própria carteira e suas oportunidades. Ao entrar, visualiza:

- quantidade de clientes;
- contratos próximos da renovação;
- leads parados;
- oportunidades de venda cruzada;
- contatos realizados;
- negócios recuperados.

O **administrador** pode:

- visualizar todos os proprietários;
- filtrar a carteira de cada um;
- redistribuir oportunidades;
- acompanhar contatos e resultados;
- identificar clientes duplicados;
- acessar relatórios consolidados;
- entrar na visão de cada proprietário individualmente.

## Aba "Meus Clientes"

Pessoas e empresas com pelo menos um negócio ganho vinculado ao proprietário. Cada cliente em formato de cartão ou tabela:

| Cliente | Tipo | Produto | Início | Vigência | Renovação | Contato |
|---|---|---|---|---|---|---|
| João Silva | Pessoa | Saúde | 10/08/2025 | 12 meses | 10/06/2026 | WhatsApp |
| Empresa XPTO | Empresa | Empresarial | 15/01/2026 | 24 meses | 15/11/2027 | Telefone |

**Informações por cliente:**
- nome da pessoa ou razão social;
- CPF ou CNPJ;
- telefone / WhatsApp / e-mail;
- proprietário responsável;
- produto contratado;
- data de início;
- quantidade de meses do contrato;
- data estimada de renovação;
- status do contrato;
- último contato;
- próxima ação comercial.

### Como classificamos pessoa x empresa

Olhamos o que está vinculado no negócio no Pipedrive: se tem organização vinculada, o cliente é "empresa" (usa o CNPJ dela); só quando não tem organização, mas tem uma pessoa vinculada, o cliente é "pessoa" (usa o CPF dela). Organização sempre tem prioridade sobre pessoa de contato.

### De onde vem Inicio, Vigencia e Renovacao

- **Início**: campo "Data de Vigência / Período" do Pipedrive. Se não estiver preenchido, usa a data em que o negócio foi marcado como "Ganho" (fallback, confirmado em 2026-08-10).
- **Vigência**: campo "Tempo de Contrato" do Pipedrive (12, 24 ou 30 meses). Se não estiver preenchido, assume 12 meses pro produto principal (Saúde PME) - 24 meses se for Porto Seguro. Pros demais produtos sem esse campo preenchido, não calculamos renovação (mostra sem alerta em vez de arriscar uma data errada).
- **Renovação**: calculada 2 meses antes de completar o prazo (10 meses de um contrato de 12, ou 22 meses de um contrato de 24) - é o gatilho pra começar a trabalhar a renovação, não a data em que a apólice de fato vence.

O sistema destaca: faltam 90 dias / 60 dias / 30 dias / renovação atrasada - contando pra essa data de gatilho.

### Regra inegociavel: negocio cancelado nunca conta como cliente ativo

Se a "Situação" do negócio no Pipedrive estiver marcada como "Cancelado", o negócio é descartado inteiramente - não aparece em nenhuma tela, mesmo que o status geral do negócio no Pipedrive seja "Ganho". Um negócio sem a Situação preenchida (comum em boa parte da carteira) nao é tratado como cancelado.

## Aba "Leads Parados"

Reúne oportunidades que ainda podem gerar venda. Negócio marcado como "Perdido" no Pipedrive é descartado (decisão confirmada em 2026-08-13 - não entra em nenhuma tela, nem aqui). Um lead entra nessa aba quando atender pelo menos uma condição:

- possui negócio aberto sem movimentação há X tempo;
- recebeu proposta mas não respondeu;
- não possui pessoa nem empresa corretamente vinculada;
- possui cadastro mas nunca teve negócio ganho;
- já é cliente da corretora, mas não possui determinado produto;
- teve contrato encerrado e não renovou;
- pertence a outro proprietário, mas já tem relacionamento com a corretora.

**Exemplo de venda cruzada:** cliente tem seguro saúde com o proprietário A, nenhum seguro vida, e um lead antigo de vida com o proprietário B. O sistema reconhece que a pessoa já é cliente e mostra: *"Cliente ativo em Saúde. Oportunidade parada em Vida."* — o contato deixa de ser frio.

### Classificação dos leads (pontuação)

**Lead quente:** já é cliente da corretora; tem telefone/WhatsApp; contrato próximo do vencimento; respondeu antes; tem outros produtos ativos.

**Lead morno:** cadastro completo; negócio antigo; nunca teve negócio ganho; tem e-mail ou telefone válido.

**Lead frio:** sem telefone; sem e-mail; cadastro incompleto; negócio muito antigo; dados possivelmente duplicados.

A tela ordena por maior chance de conversão primeiro.

## Duplicidade — ponto crítico do projeto

Não depender só do nome (pode estar escrito de formas diferentes). Como é dividido por proprietário, o mesmo cliente pode ter Saúde ganho com o proprietário A e nunca ter tido Vida com o proprietário B, mesmo já sendo cliente nosso — por isso a checagem de duplicidade precisa cruzar proprietários.

**Pessoas** (prioridade): CPF → telefone normalizado → e-mail → nome+sobrenome → data de nascimento.

**Empresas** (prioridade): CNPJ → telefone → e-mail → razão social → nome fantasia.

**MVP implementado:** match exato de CPF/CNPJ (`backend/src/domain/duplicidade.js`). A pontuação por telefone/nome/e-mail fica pra depois de validar a ideia com os proprietários.

Em vez de excluir/juntar automaticamente, o administrador recebe uma tela de "Possíveis duplicidades" (cadastro A, cadastro B, dados coincidentes, proprietários envolvidos) com opções: "mesma pessoa" / "pessoas diferentes" / "unificar cadastro".

## Contato direto pela interface

Por cliente/lead, botões de WhatsApp, Ligar, E-mail (ainda não implementado na interface):

- WhatsApp abre mensagem pré-preenchida (ex: reativação de lead parado, ou aviso de renovação próxima), editável antes de enviar. Só disponível se o número tiver WhatsApp cadastrado.
- Ligar: no celular abre o discador direto; no computador integra com telefonia ou só mostra o número.
- E-mail: modelo pronto, editável antes de enviar.

## Registro de atividades

Cada contato gera histórico: WhatsApp aberto / ligação realizada / e-mail enviado / cliente respondeu / sem interesse / retorno agendado / nova oportunidade criada / venda realizada.

Assim o administrador acompanha se os proprietários estão de fato trabalhando as oportunidades, não só vendo uma lista parada.

## Fluxos

**Renovação:** importa negócio ganho → identifica início + prazo (com os fallbacks acima) → calcula data de renovação (2 meses de antecedência) → cria alerta 90/60/30 dias antes → proprietário contata → registra resultado → cria nova oportunidade de renovação.

**Lead parado:** identifica negócio sem movimentação → verifica pessoa/empresa vinculada → pesquisa negócios ganhos da mesma pessoa/empresa → detecta possível duplicidade → classifica o lead (quente/morno/frio) → mostra melhor canal de contato → proprietário aborda → registra resultado.

## Telas do MVP

1. **Dashboard** — clientes ativos, renovações próximas, leads parados, contatos realizados, oportunidades recuperadas. *(pronto)*
2. **Meus Clientes** — busca, filtros, contratos, renovação, botões de contato. *(pronto, falta os botões de contato)*
3. **Leads Parados** — motivo do lead estar parado, último contato, produto, relacionamento existente com a corretora, classificação quente/morno/frio, botão de reativar. *(pronto, falta os botões de contato)*
4. **Detalhes do cliente** — dados cadastrais, pessoas/empresas vinculadas, negócios ganhos/perdidos, contratos, histórico de contatos, oportunidades possíveis. *(pendente)*
5. **Administração** — todos os proprietários, visualização individual, duplicidades, desempenho, regras de distribuição, permissões. *(duplicidades pronto, resto pendente)*

## Cuidados importantes

Proprietário do cliente diferente de proprietário do negócio. Uma pessoa pode ter negócio de Saúde com o proprietário A, Vida com B, Empresarial com C. O proprietário deve estar ligado ao negócio, não obrigatoriamente ao cadastro principal do cliente. O cadastro da pessoa/empresa deve ser único sempre que possível.

Privacidade entre proprietários (LGPD): um proprietário pode ver "Cliente já possui relacionamento com a corretora em outro produto", mas não deve ver automaticamente valores, comissão, documentos, observações internas ou dados sensíveis do outro negócio. O administrador tem visão completa.

## Estrutura técnica

Node.js/Express (backend) + React/Vite (frontend), mesmo padrão de organização do sistema_financeiro — reaproveita conhecimento já validado no time. Decisão tomada e implementada.

## MVP recomendado (sem envio automático de WhatsApp)

- login por proprietário;
- importação de pessoas, empresas e negócios (via sincronização com o Pipedrive);
- aba Meus Clientes;
- aba Leads Parados;
- cálculo das renovações;
- identificação básica de duplicidades (CPF/CNPJ exato);
- botão pra abrir WhatsApp;
- botão de ligação;
- registro manual do resultado;
- painel administrativo.

Depois de validar o uso: mensagens automáticas, integração completa com CRM, lead scoring com IA, sugestões de venda cruzada, distribuição automática, relatórios de conversão.

## Estrutura do projeto

```
central_renov/
├── IDEIA.md
├── ingestao/
│   ├── verificar_pipedrive.py     script antigo, so verifica CPF/CNPJ (herdado do sistema_financeiro)
│   ├── sincronizar_pipedrive.py   sincronizacao real que alimenta a Central
│   └── .env                       PIPEDRIVE_API_TOKEN, CRON_SECRET
├── backend/                       Node.js/Express
│   ├── .env                       PORT, DATA_SOURCE, CRON_SECRET
│   └── src/
│       ├── config/
│       ├── data/
│       │   ├── mock/              fixtures pra teste sem depender do Pipedrive
│       │   ├── cache/             dados reais gravados pela sincronizacao (gitignored)
│       │   └── repositories/      troca mock / pipedrive-cache / banco real num so lugar
│       ├── domain/                logica pura: renovacao.js, leadScoring.js, duplicidade.js
│       ├── utils/
│       ├── services/
│       ├── controllers/
│       ├── routes/                inclui /api/sync/pipedrive (recebe a sincronizacao)
│       └── middlewares/           inclui autenticacao da sincronizacao (CRON_SECRET)
└── frontend/                      Vite + React
    └── src/
        ├── api/, context/, hooks/, data/, utils/
        ├── components/layout/, components/ui/
        └── pages/                 Login, Dashboard, MeusClientes, LeadsParados, Admin
```

A troca de fonte de dados (mock / dados reais do Pipedrive / banco definitivo no futuro) acontece só em `backend/src/data/repositories/index.js` (variável `DATA_SOURCE`) — o resto do backend não muda.

## Sincronização com o Pipedrive

`ingestao/sincronizar_pipedrive.py` busca a carteira inteira: todas as seguradoras cadastradas no Pipedrive (não um recorte fixo), negócio aberto ou ganho (perdido é descartado - decisão confirmada em 2026-08-13), aplicando as regras descritas na seção "Meus Clientes" (fallbacks de início/vigência, corte de cancelados e de "endosso", duplicidade exata, renovação com antecedência). Envia o resultado pro backend via `POST /api/sync/pipedrive`, autenticado por um segredo compartilhado (`CRON_SECRET`), que grava em `backend/src/data/cache/`.

Hoje é rodado manualmente. O próximo passo é automatizar via GitHub Actions com um runner dedicado, no mesmo padrão já usado nas integrações do sistema_financeiro.
