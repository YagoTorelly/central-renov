# Integração Leads Novos + Google Sheets + Docker — Plano de Implementação

> **Para agentes:** executar as tarefas em ordem, validando cada etapa antes de seguir.

**Objetivo:** incorporar o Gerenciador de Leads ao Central de Renovação com autenticação única, contador na navbar, ingestão real da planilha Google Sheets e operação contínua via Docker.

**Arquitetura:** o frontend Vite do Central consumirá endpoints Express autenticados pelo JWT existente. O backend fará a ponte segura com o Supabase do Gerenciador e com a API Google Sheets; o worker de ingestão será idempotente e ignorará linhas de mockup antes da fila FIFO.

**Tecnologias:** React/Vite, Express, JWT, Supabase/PostgreSQL, Google Sheets API, Docker Compose, Node.js.

**Especificação:** `docs/superpowers/specs/2026-08-26-integracao-leads-novos-design.md`

## Restrições globais

- Yago e André Melo são administradores de Leads Novos.
- Renato, Sandra, Jessica e Nelma são vendedores.
- Outros proprietários não possuem acesso ao módulo.
- Leads Novos significa status `undefined` e zero tentativas.
- Google Sheets é somente leitura.
- Linhas contendo `<test lead: dummy data` em M–P são ignoradas.
- Não reintroduzir limite diário ou limite de cinco tentativas.
- Segredos não entram no Git nem no frontend.
- Fila FIFO permanece no domínio do Gerenciador.

### Tarefa 1: vínculo de identidade e autorização

**Arquivos:**
- Criar: `backend/src/services/leadsAccessService.js`
- Criar: `backend/src/middlewares/leadsAccess.js`
- Modificar: `backend/src/data/mock/proprietarios.json` ou configuração equivalente
- Testar: `backend/test/leads-access.test.js`

- [ ] Mapear IDs estáveis do Central para os seis perfis.
- [ ] Implementar `resolveLeadsAccess(proprietarioId)`.
- [ ] Implementar middleware de acesso e admin.
- [ ] Retornar 403 para usuários sem vínculo.
- [ ] Testar os seis usuários, token inválido e vínculo desativado.

### Tarefa 2: cliente Supabase no backend

**Arquivos:**
- Criar: `backend/src/integrations/leadsSupabaseClient.js`
- Criar: `backend/src/services/leadsService.js`
- Modificar: `backend/src/config/env.js`
- Testar: `backend/test/leads-service.test.js`

- [ ] Ler URL e chave server-only do ambiente.
- [ ] Encapsular GET/POST/PATCH em cliente único.
- [ ] Aplicar escopo do perfil vendedor.
- [ ] Normalizar erros para códigos da especificação.
- [ ] Não retornar credenciais ou SQL.
- [ ] Testar indisponibilidade com erro 503.

### Tarefa 3: endpoints de leitura

**Arquivos:**
- Criar: `backend/src/routes/leadsNovos.js`
- Criar: `backend/src/controllers/leadsNovosController.js`
- Modificar: `backend/src/index.js`
- Testar: `backend/test/leads-routes.test.js`

- [ ] Implementar GET `/api/leads-novos/access`.
- [ ] Implementar GET `/api/leads-novos/summary`.
- [ ] Implementar GET `/api/leads-novos/queue`.
- [ ] Implementar GET `/api/leads-novos/history`.
- [ ] Aplicar middleware antes do controller.
- [ ] Validar paginação e filtros.
- [ ] Testar escopo admin versus vendedor.

### Tarefa 4: rota e navbar no frontend

**Arquivos:**
- Criar: `frontend/src/pages/LeadsNovos.jsx`
- Modificar: `frontend/src/App.jsx`
- Modificar: `frontend/src/components/layout/Layout.jsx`
- Modificar: `frontend/src/api/index.js`
- Testar: `frontend/src/pages/LeadsNovos.test.jsx`

- [ ] Adicionar rota protegida `/leads-novos`.
- [ ] Consultar `/access` no layout.
- [ ] Renderizar item somente para usuários autorizados.
- [ ] Exibir badge quando `unreadCount > 0`.
- [ ] Preservar todos os itens atuais da navbar.
- [ ] Redirecionar acesso negado para dashboard.

### Tarefa 5: dashboard integrado

**Arquivos:**
- Criar/modificar: `frontend/src/components/leads/LeadsSummary.jsx`
- Criar/modificar: `frontend/src/components/leads/LeadsQueue.jsx`
- Criar/modificar: `frontend/src/components/leads/LeadsTable.jsx`
- Modificar: `frontend/src/pages/LeadsNovos.jsx`
- Modificar: `frontend/src/index.css`

- [ ] Renderizar resumo, fila e leads.
- [ ] Mostrar status com cores canônicas.
- [ ] Mostrar prazo e tentativas.
- [ ] Ocultar dados de colegas para vendedor.
- [ ] Implementar loading, vazio e erro recuperável.
- [ ] Validar desktop e acessibilidade.

### Tarefa 6: tentativa, comentário e status

**Arquivos:**
- Criar/modificar: `frontend/src/components/leads/AttemptModal.jsx`
- Modificar: `frontend/src/api/index.js`
- Modificar: `backend/src/routes/leadsNovos.js`
- Modificar: `backend/src/services/leadsService.js`
- Testar: `backend/test/leads-mutations.test.js`

- [ ] Implementar POST de tentativa.
- [ ] Exigir comentário.
- [ ] Permitir status undefined, negotiation, won e disqualified.
- [ ] Não bloquear por dia útil.
- [ ] Não bloquear após cinco tentativas.
- [ ] Atualizar badge após a primeira tentativa.
- [ ] Registrar histórico.

### Tarefa 7: simulação e arquivamento

**Arquivos:**
- Modificar: `backend/src/services/leadsService.js`
- Modificar: `frontend/src/pages/LeadsNovos.jsx`
- Criar/modificar: `frontend/src/components/leads/ArchiveButton.jsx`
- Testar: `backend/test/leads-admin-actions.test.js`

- [ ] Implementar POST de simulação apenas para admin.
- [ ] Validar quantidade de 1 a 10.
- [ ] Implementar arquivamento lógico apenas para admin.
- [ ] Exigir confirmação com atraso de cinco segundos.
- [ ] Preservar histórico.
- [ ] Atualizar resumo e contador.

### Tarefa 8: adapter Google Sheets

**Arquivos:**
- Criar: `backend/src/integrations/googleSheetsClient.js`
- Criar: `backend/src/services/sheetsLeadAdapter.js`
- Criar: `backend/src/services/sheetsMockupFilter.js`
- Testar: `backend/test/google-sheets-adapter.test.js`

- [ ] Ler spreadsheet ID e gid do ambiente.
- [ ] Usar credencial de conta de serviço somente no servidor.
- [ ] Ler intervalo configurável.
- [ ] Normalizar colunas M, N, O e P.
- [ ] Preservar número original da linha.
- [ ] Ignorar marcador mockup em qualquer coluna M–P.
- [ ] Comparar marcador sem diferenciar maiúsculas/minúsculas.
- [ ] Registrar linhas ignoradas.
- [ ] Nunca escrever na planilha.

### Tarefa 9: ingestão idempotente e worker

**Arquivos:**
- Criar: `backend/src/services/leadsImportService.js`
- Criar: `backend/src/workers/googleSheetsWorker.js`
- Criar: `backend/src/routes/internalLeadImport.js`
- Testar: `backend/test/leads-import.test.js`

- [ ] Calcular row hash.
- [ ] Usar source lead ID como identidade primária.
- [ ] Repetir leitura sem duplicar lead.
- [ ] Criar/atualizar source record.
- [ ] Acionar distribuição FIFO somente para linhas válidas.
- [ ] Impedir duas execuções simultâneas.
- [ ] Permitir execução manual.
- [ ] Registrar métricas da execução.

### Tarefa 10: Docker Compose 24/7

**Arquivos:**
- Criar: `docker-compose.production-local.yml`
- Criar: `backend/Dockerfile`
- Criar: `frontend/Dockerfile`
- Criar: `.dockerignore`
- Criar: `secrets/.gitkeep`
- Modificar: `.gitignore`

- [ ] Definir serviços web, api, worker e Supabase conforme ambiente local.
- [ ] Configurar `restart: unless-stopped`.
- [ ] Configurar healthchecks.
- [ ] Montar JSON Google como segredo.
- [ ] Persistir volume do Supabase.
- [ ] Não embutir segredos nas imagens.
- [ ] Documentar portas e firewall.

### Tarefa 11: instalação no segundo computador

**Arquivos:**
- Criar: `docs/operacao/segundo-computador.md`
- Criar: `scripts/install-local-host.ps1`
- Criar: `scripts/healthcheck-local.ps1`

- [ ] Documentar pré-requisitos de virtualização, WSL2 e Docker.
- [ ] Documentar instalação do JSON Google.
- [ ] Documentar compartilhamento como leitor.
- [ ] Documentar inicialização e parada.
- [ ] Documentar backup de volumes e segredos.
- [ ] Documentar diagnóstico de containers.
- [ ] Documentar atualização segura.

### Tarefa 12: validação final

**Arquivos:**
- Modificar testes existentes conforme necessário.
- Criar: `docs/operacao/checklist-release-leads.md`

- [ ] Executar testes backend.
- [ ] Executar lint frontend/backend.
- [ ] Executar build frontend.
- [ ] Executar teste de integração com planilha.
- [ ] Confirmar linha 2 ignorada.
- [ ] Confirmar lead real distribuído FIFO.
- [ ] Confirmar contador por usuário.
- [ ] Confirmar 403 para proprietários sem acesso.
- [ ] Confirmar restart dos containers.
- [ ] Registrar evidências e rollback.

## Comandos de validação

```powershell
npm --prefix backend test
npm --prefix frontend run lint
npm --prefix frontend run build
docker compose -f docker-compose.production-local.yml config
docker compose -f docker-compose.production-local.yml up -d
docker compose -f docker-compose.production-local.yml ps
```

## Critério de conclusão

A integração somente será considerada pronta quando a planilha for lida sem escrita, a linha 2 for ignorada, o lead real entrar na fila FIFO, os seis usuários possuírem o escopo correto, o contador aparecer na navbar e os containers permanecerem saudáveis após reinício do host.

