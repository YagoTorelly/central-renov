# Central de Renovação e Reativação Comercial

**Valor imediato:** organizar a carteira por proprietário, antecipar renovações e transformar leads antigos em novas oportunidades de venda.

> Projeto separado do sistema financeiro da WTG Corretora — não tem ligação de código com ele. Reaproveita só o script de consulta ao Pipedrive (`ingestao/verificar_pipedrive.py`) pra levantar os clientes/negócios reais.

---

## Ideia central

Uma camada comercial sobre os negócios da corretora, com duas funções principais:

1. Mostrar os clientes e contratos ativos de cada proprietário.
2. Identificar pessoas ou empresas que podem ser reativadas ou receber oferta de outro produto.

## Login por proprietário

Cada proprietário acessa só sua própria carteira e suas oportunidades (login com senha). Ao entrar, visualiza:

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
| João Silva | Pessoa | Saúde | 10/08/2025 | 12 meses | 10/08/2026 | WhatsApp |
| Empresa XPTO | Empresa | Empresarial | 15/01/2026 | 24 meses | 15/01/2028 | Telefone |

**Informações por cliente:**
- nome da pessoa ou razão social;
- CPF ou CNPJ;
- telefone / WhatsApp / e-mail;
- proprietário responsável;
- produto contratado;
- data de início;
- **tempo pra iniciar o contrato** (carência entre negócio ganho e início efetivo da vigência — a confirmar se entra no cálculo de renovação ou é só informativo);
- quantidade de meses do contrato (normalmente 12 ou 24);
- data estimada de renovação;
- status do contrato;
- último contato;
- próxima ação comercial.

**Cálculo automático da renovação:**
```
Data de renovação = data de início + meses de vigência
```
Exemplo: início 10/08/2025, vigência 12 meses → renovação 10/08/2026.

O sistema destaca: faltam 90 dias / 60 dias / 30 dias / renovação atrasada.

## Aba "Leads Parados"

Não é só negócio perdido — reúne oportunidades que ainda podem gerar venda. Um lead entra nessa aba quando atender pelo menos uma condição:

- possui negócio aberto sem movimentação há X tempo;
- possui negócio perdido;
- recebeu proposta mas não respondeu;
- não possui pessoa nem empresa corretamente vinculada;
- possui cadastro mas nunca teve negócio ganho;
- já é cliente da corretora, mas não possui determinado produto;
- teve contrato encerrado e não renovou;
- pertence a outro proprietário, mas já tem relacionamento com a corretora.

**Exemplo de venda cruzada:** cliente tem seguro saúde com o proprietário A, nenhum seguro vida, e um lead antigo de vida com o proprietário B. O sistema reconhece que a pessoa já é cliente e mostra: *"Cliente ativo em Saúde. Oportunidade parada em Vida."* — o contato deixa de ser frio.

### Classificação dos leads (pontuação)

**Lead quente:** já é cliente da corretora; tem telefone/WhatsApp; negócio perdido recente; contrato próximo do vencimento; respondeu antes; tem outros produtos ativos.

**Lead morno:** cadastro completo; negócio antigo; nunca teve negócio ganho; tem e-mail ou telefone válido.

**Lead frio:** sem telefone; sem e-mail; cadastro incompleto; negócio muito antigo; dados possivelmente duplicados.

A tela ordena por maior chance de conversão primeiro.

## Duplicidade — ponto crítico do projeto

Não depender só do nome (pode estar escrito de formas diferentes). Como é dividido por proprietário, o mesmo cliente pode ter Saúde ganho com o proprietário A e nunca ter tido Vida com o proprietário B, mesmo já sendo cliente nosso — por isso a checagem de duplicidade precisa cruzar proprietários.

**Pessoas** (prioridade): CPF → telefone normalizado → e-mail → nome+sobrenome → data de nascimento.

**Empresas** (prioridade): CNPJ → telefone → e-mail → razão social → nome fantasia.

**Índice de confiança:**
- 100%: mesmo CPF ou CNPJ;
- 90%: mesmo telefone e nome semelhante;
- 80%: mesmo e-mail;
- 60%: nome semelhante, sem documento;
- abaixo: exigir validação manual.

Em vez de excluir/juntar automaticamente, o administrador recebe uma tela de "Possíveis duplicidades" (cadastro A, cadastro B, dados coincidentes, proprietários envolvidos) com opções: "mesma pessoa" / "pessoas diferentes" / "unificar cadastro".

> Nota de escopo (sugestão p/ MVP): começar só com match exato de CPF/CNPJ, sem a pontuação por telefone/nome/e-mail ainda. Já implementado no scaffold atual (backend/src/domain/duplicidade.js).

## Contato direto pela interface

Por cliente/lead, botões de WhatsApp, Ligar, E-mail:

- WhatsApp abre mensagem pré-preenchida (ex: reativação de lead parado, ou aviso de renovação próxima), editável antes de enviar. Só disponível se o número tiver WhatsApp cadastrado.
- Ligar: no celular abre o discador direto; no computador integra com telefonia ou só mostra o número.
- E-mail: modelo pronto, editável antes de enviar.

## Registro de atividades

Cada contato gera histórico: WhatsApp aberto / ligação realizada / e-mail enviado / cliente respondeu / sem interesse / retorno agendado / nova oportunidade criada / venda realizada.

Exemplo:

| Data | Proprietário | Cliente | Ação | Resultado |
|---|---|---|---|---|
| 20/07/2026 | Carlos | João Silva | WhatsApp | Retorno agendado |
| 21/07/2026 | Ana | Empresa XPTO | Ligação | Sem resposta |

Assim o administrador acompanha se os proprietários estão de fato trabalhando as oportunidades, não só vendo uma lista parada.

## Fluxos

Renovação: importa negócio ganho → identifica início + prazo → calcula data de renovação → cria alerta 90/60/30 dias antes → proprietário contata → registra resultado → cria nova oportunidade de renovação.

Lead parado: identifica negócio sem movimentação → verifica pessoa/empresa vinculada → pesquisa negócios ganhos da mesma pessoa/empresa → detecta possível duplicidade → classifica o lead (quente/morno/frio) → mostra melhor canal de contato → proprietário aborda → registra resultado.

## Telas do MVP

1. Dashboard — clientes ativos, renovações próximas, leads parados, contatos realizados, oportunidades recuperadas.
2. Meus Clientes — busca, filtros, contratos, renovação, botões de contato.
3. Leads Parados — motivo do lead estar parado, último contato, produto, relacionamento existente com a corretora, classificação quente/morno/frio, botão de reativar.
4. Detalhes do cliente — dados cadastrais, pessoas/empresas vinculadas, negócios ganhos/perdidos, contratos, histórico de contatos, oportunidades possíveis.
5. Administração — todos os proprietários, visualização individual, duplicidades, desempenho, regras de distribuição, permissões.

## Cuidados importantes

Proprietário do cliente diferente de proprietário do negócio. Uma pessoa pode ter negócio de Saúde com o proprietário A, Vida com B, Empresarial com C. O proprietário deve estar ligado ao negócio, não obrigatoriamente ao cadastro principal do cliente. O cadastro da pessoa/empresa deve ser único sempre que possível.

Privacidade entre proprietários (LGPD): um proprietário pode ver "Cliente já possui relacionamento com a corretora em outro produto", mas não deve ver automaticamente valores, comissão, documentos, observações internas ou dados sensíveis do outro negócio. O administrador tem visão completa.

## Estrutura técnica — opções

Rápida e econômica: Bubble/FlutterFlow/Retool (frontend) + Supabase (banco + auth) + n8n/Make (automação) + WhatsApp via link direto inicialmente + Resend/SendGrid (e-mail) + Metabase ou dashboard interno (relatórios). Permite validar o produto antes de investir em desenvolvimento completo.

Robusta: Next.js (frontend) + Node.js/NestJS (backend) + PostgreSQL + Auth0/Clerk/Supabase Auth + n8n (automação) + WhatsApp API oficial da Meta + Vercel+Supabase / AWS / Azure (infra).

Escolhida pro scaffold atual: Node.js/Express (backend) + React/Vite (frontend), mesmo padrão de organização do sistema_financeiro. Reaproveita conhecimento já validado no time. Dados mock até a validação da lógica; troca pra banco real é um único ponto de mudança (backend/src/data/repositories/index.js).

## MVP recomendado (sem envio automático de WhatsApp)

- login por proprietário;
- importação de pessoas, empresas e negócios (via script do Pipedrive);
- aba Meus Clientes;
- aba Leads Parados;
- cálculo das renovações;
- identificação básica de duplicidades (CPF/CNPJ exato);
- botão pra abrir WhatsApp;
- botão de ligação;
- registro manual do resultado;
- painel administrativo.

Depois de validar o uso: mensagens automáticas, integração completa com CRM, lead scoring com IA, sugestões de venda cruzada, distribuição automática, relatórios de conversão.

## Estrutura do projeto (scaffold atual)

```
central_renov/
├── IDEIA.md
├── ingestao/                  script de sync com o Pipedrive (Python)
│   ├── verificar_pipedrive.py
│   └── .env                   PIPEDRIVE_API_TOKEN
├── backend/                   Node.js/Express, mesmo padrão do sistema_financeiro
│   ├── .env                   PORT, DATA_SOURCE=mock
│   └── src/
│       ├── config/            leitura centralizada de env
│       ├── data/
│       │   ├── mock/          fixtures json (proprietarios, pessoasEmpresas, negocios, atividades)
│       │   └── repositories/  interface única, troca mock/banco real num só lugar
│       ├── domain/            lógica pura: renovacao.js, leadScoring.js, duplicidade.js
│       ├── utils/             helpers genéricos (ex: normalizarDocumento)
│       ├── services/          orquestra repository + domain pra cada tela
│       ├── controllers/
│       ├── routes/            /api/dashboard, /api/clientes, /api/leads, /api/atividades, /api/admin
│       └── middlewares/
└── frontend/                  Vite + React
    └── src/
        ├── api/                conexão com o backend (fetch)
        ├── context/            ProprietarioContext, estado global (usuário logado)
        ├── hooks/              useProprietarioAtual
        ├── data/               rótulos/textos estáticos da interface
        ├── utils/              formatarDataBR etc.
        ├── components/
        │   ├── layout/         Layout.jsx (nav + shell)
        │   └── ui/             Badge.jsx e outros componentes reutilizáveis
        └── pages/              Login, Dashboard, MeusClientes, LeadsParados, Admin
```

A troca de dados mock para banco real acontece só em backend/src/data/repositories/index.js (variável DATA_SOURCE), o resto do backend (domain/services/controllers) não muda.

## Fonte de dados

ingestao/verificar_pipedrive.py — busca negócios/organizações/pessoas direto da API do Pipedrive, já filtrando por seguradora/produto/status. Reaproveitado do sistema financeiro (backend/src/integrations/_ferramentas/verificar_pipedrive.py). Usa o .env da própria pasta ingestao/ (PIPEDRIVE_API_TOKEN). Hoje é um script manual (gera Excel); quando a Central conectar num banco real, esse job deve virar uma sincronização idempotente (upsert por deal_id) em vez de rodar sob demanda.
