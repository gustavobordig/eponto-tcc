# Revisão de arquitetura — ePonto (front)

Front em Next.js 15 (App Router) que consome a API .NET descrita em [`api.md`](../api.md). Este documento registra o diagnóstico e o plano em fases.

## Como está hoje

```text
app/                              rotas (App Router); as páginas só compõem a feature
  (pages)/(authenticated)/        telas do funcionário + _components/ (NavBar, MobileNav)
  (pages)/(authenticatedAdmin)/   painel admin (dashboard/*, adicionar-*)
features/<domínio>/               ponto, bancoHoras, ferias, feriados, calendario, feedback,
                                  ausencias, cargos, jornadas, usuarios, auth, analytics
  api.ts                          rotas da API e tipos do contrato
  hooks/                          busca e ações de cada tela (useFeriasAdmin, useFeedbackAdmin…)
  components/                     UI do domínio (components/admin/ para o painel)
  lib/, validations.ts, status.ts regras do domínio
shared/
  lib/                            api (axios), session, token, toast, format, cn
  ui/                             Button, Input, Table, modais, Calendario, DemoBadge…
  ui/primitives/                  componentes shadcn (button, card, input, select)
  types/                          ApiResponse<T> e tipos de UI (Column, validação)
middleware.ts                     protege as rotas no servidor
```

Regra de dependência: `app` importa de `features` e `shared`, e `features` importa de `shared`. Uma feature só importa outra para usar o `api.ts` dela (por exemplo, `ausencias` usa `usuarios/api` para os nomes).

Fluxo de dados: as páginas são `"use client"` e pegam os dados de um hook da feature (`useX`), que chama o `api.ts` e trata erro e toast. A sessão fica nos cookies `eponto_token`, `eponto_id` e `eponto_perfil`, que o `middleware.ts` lê para proteger as rotas. O cliente axios (`shared/lib/api.ts`) envia `Authorization: Bearer <token>` e, se a API responder 401 fora do login, limpa a sessão e volta para o login.

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

### Estrutura

- ~~Componentes em três lugares e páginas gigantes.~~ Organizado por feature na fase 4. Ainda passam de 300 linhas: `adicionar-usuario` (410), `feedback` do funcionário (369), `perfil` (364), `home` (350) e `solicitacoes-ausencia` (348).
- ~~Mocks em "Minhas solicitações" e "Solicitações de ausência".~~ Agora usam a API. Continuam com dados de exemplo, marcados na tela com o selo "Dados de exemplo": a página de **Estatísticas** e o gráfico de **Pontualidade** da home. A API tem `BancoHoras/HorasTrabalhadasMes/{id}` e `BancoHoras/HorasExtrasMes/{id}`, mas o formato da resposta não está documentado.
- ~~Barra de navegação cortada.~~ Resolvido na fase 4.
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

### Fase 4 — organização por feature ✅ (branch `refactor/arquitetura-fase-4`)

- Tudo foi movido para `features/` e `shared/`, com os imports reescritos por script (que resolve cada import para o arquivo real). Também:
  - `utils/timeUtils` foi dividido entre `features/ponto/lib/horarios` e `shared/lib/format`;
  - o `ValidationResult` passou a ter uma definição só;
  - saíram três arquivos sem uso.
- Páginas divididas em hook mais componentes:
  - feedback do admin: 709 → ~50 linhas;
  - férias do admin: 472 → ~150;
  - usuários, os dois calendários e as duas telas de ausência.
- As três telas de calendário passaram a usar o mesmo `shared/ui/Calendario`.
- "Minhas solicitações" e "Solicitações de ausência" usam a API. Os nomes dos solicitantes vêm de uma chamada só, e não de uma por solicitação.
- Os gráficos com dados fixos ganharam o selo "Dados de exemplo", e o título "Analitycs" virou "Estatísticas".
- A barra de navegação completa aparece a partir de 1280px; abaixo disso, o menu mobile. Saiu também o link vazio para `/home`.

Bugs encontrados testando no navegador com respostas da API simuladas:

- **O modal de edição abria sozinho e não fechava** em usuários, cargos, jornadas, feriados e ajustes de ponto. A `Table` chamava `handleEdit` durante a renderização. Agora `handleEdit` só roda no clique, e ações próprias da linha usam `renderActions`.
- **"Salvar" ficava sempre desabilitado** em usuários, jornadas e ajustes de ponto: o `EditModal` exigia ao menos uma regra de validação. Junto com o bug anterior, essas edições não funcionavam desde jul/2025.
- **Editar usuário trocava a data de nascimento por hoje.** A edição agora parte do usuário carregado. Cargo, jornada e status viraram selects, em vez de digitar o ID.

Para a próxima rodada: dividir as páginas que ainda passam de 300 linhas (lista acima) e ligar Estatísticas e Pontualidade à API quando o formato das rotas de banco de horas for confirmado.

### Fase 5 — documentação e testes

README de verdade (setup, variáveis, scripts, arquitetura) e Cypress no CI com a API mockada por `cy.intercept`.
