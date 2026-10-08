# Revisão de arquitetura — ePonto (front)

Front em Next.js 15 (App Router) que consome a API .NET descrita em [`api.md`](../api.md). Este documento registra o diagnóstico e o plano em fases.

## Como está hoje

```text
app/
  (pages)/(authenticated)/        telas do funcionário (home, perfil, histórico, calendário…)
  (pages)/(authenticatedAdmin)/   painel admin (dashboard/*, adicionar-*)
  components/{atoms,molecules,organisms}/
  contexts/FeedbackContext.tsx
components/{ui,dashboard}/        shadcn + gráficos do analytics
services/*.ts                     um objeto por recurso da API, com os tipos do contrato
lib/session.ts                    sessão (cookies, JWT, perfil) e mapa de rotas, usado pelo app e pelo middleware
middleware.ts                     protege as rotas no servidor
utils/                            toast, sessão no navegador, datas, validações
types/                            ApiResponse<T> e tipos de UI (Column, validação)
```

Fluxo de dados: toda página é `"use client"`, busca dados no `useEffect` chamando `services/*` e guarda o resultado em `useState`. A sessão fica nos cookies `eponto_token`, `eponto_id` e `eponto_perfil`, que o `middleware.ts` lê para proteger as rotas. O cliente axios (`services/api.ts`) envia `Authorization: Bearer <token>` e, se a API responder 401 fora do login, limpa a sessão e volta para o login.

## Diagnóstico

### Segurança e acesso

| # | Problema | Onde |
|---|----------|------|
| S1 | ~~Senha `123` fixa no front para o painel admin.~~ Removida na fase 3: o painel abre pelo perfil da sessão. Falta a API devolver esse perfil e bloquear as rotas de admin (ver abaixo). | API |
| S2 | ~~O token nunca era enviado.~~ Desde a fase 2 vai no header `Authorization`. Falta a API validar o token e usar o usuário dele, e não o `idUsuario` da URL: hoje, trocando o número, dá para ver os dados de outra pessoa. | API |
| S3 | ~~As rotas não checavam a sessão.~~ Resolvido na fase 3 com o `middleware.ts`. | — |
| S4 | ~~A home baixava os registros de todos os usuários e filtrava no navegador.~~ Resolvido na fase 2: usa `ObterRegistrosUsuario`. | — |

### Build e higiene (resolvido na fase 1)

- O build de produção não passava: imports de `utils/feriadoValidations` e `utils/jornadaValidations` apontavam para caminhos que não existiam mais.
- 21 erros de TypeScript e 48 erros de lint.
- **Bug:** o botão "Cancelar" dos modais de confirmação (logout, perfil, aprovar/reprovar ausência) recebia `onClose`, mas o componente espera `onCancel`. Clicar quebrava a tela.
- **Bug:** a tela "Esqueci minha senha" usava o `toast` do `sonner`, que não tinha `<Toaster>` montado, então nenhuma mensagem aparecia. No admin, havia dois `<Toaster>` e cada toast aparecia duplicado.
- O layout passava um callback para a página de feedback por `window.registerFeedbackRefresh`.
- Havia 37 `console.log` de debug (alguns com payloads da API), 9 arquivos que ninguém importava, uma rota `app/api/users` com "banco em memória" que não era usada e dois `next.config` (o `.js` tinha a opção inválida `swcMinify`).
- Não havia CI.

### Estrutura (pendente)

- **Componentes em três lugares** (`app/components`, `components/ui`, `components/dashboard`). O atomic design não está sendo seguido: modais de 250 linhas aparecem como "atoms".
- **Páginas gigantes** misturam fetch, estado, regra de negócio e UI. Por exemplo, `dashboard/feedback` tem 733 linhas e `solicitacoes-ausencia` tem 475.
- **Mocks em produção**: o analytics usa `lib/mockData.ts`, e a home usa `mockMonthlyData`. "Minhas solicitações" e "Solicitações de ausência" (admin) mostram sempre a mesma lista fictícia, com a chamada real comentada.
- **Barra de navegação**: com 7 itens (8 com "Painel admin"), os últimos ficam cortados em telas estreitas (no teste, com 800px de largura).
- O README ainda é o padrão do `create-next-app`.

## Plano

### Fase 1 — build verde e higiene ✅ (branch `refactor/arquitetura-fase-1`)

Fazer o build passar, zerar os erros de tipo e de lint, corrigir os bugs acima, remover código morto, unificar os toasts e criar o CI (lint, build e typecheck). O comportamento das telas não muda, fora os bugs corrigidos.

### Fase 2 — camada de API ✅ (branch `refactor/arquitetura-fase-2`)

- O axios passou a mandar o token, e uma resposta 401 encerra a sessão. O logout agora limpa também o id e os dados do usuário (antes ficavam no navegador).
- Todos os services são `.ts`, no formato de objeto por recurso, e tipados com `ApiResponse<T>`. As páginas importam os tipos dos services em vez de redeclarar. `timeRecord`, `timeRecordAdjustment` e `ajuste` viraram um único `registroPonto`, e as funções sem uso saíram.
- `types/` e `app/types/` foram juntados. A `Table` ficou genérica (`Column<T>`).
- `services/` e `utils/` entraram no lint, e `no-explicit-any` voltou a ser erro, com zero ocorrências.

Bugs corrigidos no caminho:

- A home considerava "hoje" em UTC, então depois das 21h os pontos do dia sumiam.
- O histórico buscava os saldos diários uma vez por dia da lista (N+1). Agora é uma chamada só.
- O calendário de férias do admin estava sempre vazio: a função esperava dias do calendário e recebia a lista de férias.
- A coluna "Tipo" dos feriados mostrava sempre "Meio Período", porque o `render` tratava a linha inteira como número.

Para conferir com a API ligada:

- O CORS da API precisa aceitar o header `Authorization`. Sem isso, as chamadas falham no preflight.
- O `api.md` não bate com o que as telas usam, por exemplo em feriado (`nomeFeriado` contra `dscFeriado`) e jornada (`cargaHoraria`/`horaInicio` contra `qtdHorasDiarias`). Os tipos seguem as telas; o card de jornada do perfil lê `cargaHoraria`, `horaInicio` e `horaFim`.

### Fase 3 — autenticação e acesso ✅ no front (branch `refactor/arquitetura-fase-3`)

- A sessão saiu do `localStorage` e foi para cookies (`lib/session.ts` + `utils/token.ts`). Eles expiram junto com o token quando ele é um JWT com `exp`, ou em 8h. As chaves antigas do `localStorage` são limpas no login e no logout.
- O `middleware.ts` protege as rotas:
  - sem sessão (ou com o token vencido), as rotas do funcionário e do admin voltam para o login;
  - sem perfil admin, `/dashboard/*` e `/adicionar-*` voltam para `/home`;
  - quem já está logado e abre o login vai para `/home`.
- A senha `123` e o `AdminAuthForm` saíram. Quem tem perfil admin vê "Painel admin" na barra e entra no painel sem segunda senha.
- O perfil é decidido no login, nesta ordem:
  1. campo `perfil` da resposta do login;
  2. claim de role do JWT (`role`, `roles`, `perfil` ou a claim de role padrão do .NET);
  3. temporariamente, os e-mails em `NEXT_PUBLIC_ADMIN_EMAILS` (`.env.example`).
- Se a API falhar ao carregar o usuário, o layout mostra um aviso em vez de mandar para o login, porque isso criaria um loop com o middleware. Sessão inválida (401) continua encerrada pelo interceptor.
- Cypress: `cy.loginAs(perfil)` grava a sessão por cookie, e `admin-auth.cy.ts` passou a testar as regras do middleware, sem depender da API.

**Limite:** os cookies podem ser editados no navegador. O front só decide a navegação; quem protege os dados é a API.

#### O que a API .NET precisa fazer

1. **Devolver o perfil no login.** O caminho mais simples é um campo na resposta de `POST /api/login/RealizarLogin`:
   ```json
   { "sucesso": true, "mensagem": null, "idUsuario": 1, "token": "…", "perfil": "admin" }
   ```
   Valores: `"admin"` ou `"funcionario"`. Também funciona colocar no JWT uma claim `ClaimTypes.Role` com `Admin`; o front lê as duas.
2. **Validar o JWT em todas as rotas**, menos login e recuperação de senha (`[Authorize]` + `AddAuthentication().AddJwtBearer(...)`), com `exp` no token.
3. **Usar o usuário do token**, e não o `idUsuario` da URL ou do corpo, nas rotas do próprio funcionário (registros de ponto, banco de horas, férias, solicitações, perfil).
4. **Restringir as rotas de admin** (`[Authorize(Roles = "Admin")]`): cadastro de usuários, cargos, jornadas, feriados, férias, aprovação de ajustes e de ausências, listagens gerais.
5. **CORS** aceitando o header `Authorization` (`AllowAnyHeader()` ou `.WithHeaders("Authorization", "Content-Type")`).

Quando o item 1 estiver no ar, apague `NEXT_PUBLIC_ADMIN_EMAILS` e o trecho correspondente em `lib/session.ts` e `services/auth.ts`.

### Fase 4 — organização por feature

```text
features/
  ponto/       components/  hooks/usePontosDoDia.ts  services.ts  types.ts
  ferias/
  feedback/
  ausencias/
  cadastros/   (cargos, jornadas, feriados, usuários)
shared/
  ui/          (Button, Input, Modal, Table — um só lugar)
  lib/         (api, toast, datas, validações)
```

As páginas em `app/` ficam finas: só compõem os componentes da feature. Cada página grande vira um hook de dados mais componentes menores. Os mocks saem, ou ficam atrás de um modo demo explícito.

### Fase 5 — documentação e testes

README de verdade (setup, variáveis, scripts, arquitetura) e Cypress no CI com a API mockada por `cy.intercept`.
