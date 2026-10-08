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
services/*.tsx                    um arquivo por recurso da API (axios)
utils/                            toast, token, datas, validações
types/ e app/types/               tipos compartilhados (duplicados)
```

Fluxo de dados: toda página é `"use client"`, busca dados no `useEffect` chamando `services/*` e guarda o resultado em `useState`. A sessão é o par `@App:token` / `@App:id` no `localStorage`.

## Diagnóstico

### Segurança e acesso (pendente)

| # | Problema | Onde |
|---|----------|------|
| S1 | A senha do painel admin (`123`) está fixa no código do cliente, e o acesso fica liberado por `localStorage.adminAuthenticated = 'true'`. Qualquer pessoa entra no painel. | `app/components/atoms/AdminAuthForm`, `(authenticatedAdmin)/layout.tsx` |
| S2 | O token do login é salvo, mas nunca é enviado: o axios não tem header `Authorization`. A identidade do usuário é só o `idUsuario` no `localStorage`; trocando o número, você vê os dados de outra pessoa. | `services/api.tsx`, `utils/token.ts` |
| S3 | As rotas autenticadas não checam se existe sessão. Sem id, o layout chama `/api/Usuario/0`. | `(authenticated)/layout.tsx` |
| S4 | A home baixa **todos** os registros de ponto de **todos** os usuários (`/RegistroPonto/Listar`) e filtra no navegador. Já existe `ObterRegistrosUsuario`. | `(authenticated)/home/page.tsx` |

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
- **Tipos duplicados**: `types/index.ts` e `app/types/index.ts` definem `Column` de formas diferentes. Vários services e páginas redeclaram o envelope `{ sucesso, mensagem, ... }`.
- **Services sem padrão**: alguns são objetos (`userService`), outros funções soltas (`listCargos`). São `.tsx` sem JSX, e cada um tem um `try/catch` que só repassa o erro. Muitas respostas não têm tipo.
- **Páginas gigantes** misturam fetch, estado, regra de negócio e UI. Por exemplo, `dashboard/feedback` tem 733 linhas e `solicitacoes-ausencia` tem 475.
- **Mocks em produção**: o analytics usa `lib/mockData.ts`, e a home usa `mockMonthlyData`.
- O README ainda é o padrão do `create-next-app`.

## Plano

### Fase 1 — build verde e higiene ✅ (branch `refactor/arquitetura-fase-1`)

Fazer o build passar, zerar os erros de tipo e de lint, corrigir os bugs acima, remover código morto, unificar os toasts e criar o CI (lint, build e typecheck). O comportamento das telas não muda, fora os bugs corrigidos.

### Fase 2 — camada de API

1. Criar um interceptor no axios que envie `Authorization: Bearer <token>`. Em resposta 401, ele limpa a sessão e volta para o login.
2. Criar um tipo `ApiResponse<T>` único em `types/api.ts` e tipar todos os services, que passam de `.tsx` para `.ts`, num formato só (objeto por recurso). Depois disso, `no-explicit-any` volta a ser erro.
3. Trocar o "lista tudo e filtra no navegador" pelos endpoints por usuário (S4).
4. Juntar `types/` e `app/types/`.

### Fase 3 — autenticação e acesso (depende da API)

1. Guardar a sessão em cookie e proteger `/home`, `/perfil` etc. e `/dashboard/*` com `middleware.ts`.
2. Liberar o acesso admin pelo perfil do usuário que vem da API, não por senha no front (S1).
3. A API precisa validar o JWT e usar o usuário do token, não o `idUsuario` da URL (S2). Isso é no back.

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
