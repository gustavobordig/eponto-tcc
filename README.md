# ePonto

Front do ePonto, sistema de ponto eletrônico do nosso TCC, em Next.js 15 (App
Router), React 19, TypeScript e Tailwind. Ele consome a API .NET do projeto,
cujas rotas estão em [docs/api.md](docs/api.md).

Tem duas áreas:

- **Funcionário**: bater ponto, histórico e banco de horas, calendário, pedidos
  de férias e de ausência, e feedback.
- **Painel admin** (`/dashboard`): usuários, cargos, jornadas, feriados, férias,
  aprovação de ajustes e ausências, e feedbacks.

## Rodando localmente

```bash
npm ci
cp .env.example .env.local   # NEXT_PUBLIC_API_URL: API que o front vai usar
npm run dev                   # http://localhost:3000
```

| Variável | Para quê |
|----------|----------|
| `NEXT_PUBLIC_API_URL` | Endereço da API .NET. Sem ela, o front usa `https://localhost:7283`. |
| `NEXT_PUBLIC_ADMIN_EMAILS` | **Temporária.** E-mails, separados por vírgula, que entram como admin enquanto a API não devolve o perfil no login (veja [Sessão e acesso](#sessão-e-acesso)). |

As duas são `NEXT_PUBLIC_`, então vão para o código que roda no navegador. Não
coloque nada secreto nelas.

## Verificações (as mesmas do CI)

```bash
npm run lint        # next lint em app/, features/ e shared/
npm run build
npm run typecheck   # tsc do app e do Cypress; rode depois do build
```

O `typecheck` precisa do `next-env.d.ts`, que o `build` (ou o `dev`) gera.

O CI ([.github/workflows/ci.yml](.github/workflows/ci.yml)) roda essas três
verificações e os testes e2e a cada push na `master` e a cada PR.

## Testes e2e (Cypress)

Os testes não dependem da API: `cy.mockApi()` responde `{ sucesso: true }` para
qualquer rota `/api/**`, e cada teste registra com `cy.intercept` as respostas
que importam (as fixtures ficam em `cypress/fixtures/`). Assim dá para conferir
o que o front envia à API sem gravar nada.

```bash
npm run build && npm start   # num terminal
npm run test:e2e             # em outro (ou test:e2e:open para o modo interativo)
```

| Spec | O que cobre |
|------|-------------|
| `admin-auth.cy.ts` | Proteção das rotas pelo middleware (sem sessão, funcionário, admin) |
| `login.cy.ts` | Login, cookies da sessão, perfil admin, erro da API |
| `cargos.cy.ts` | Validações do cadastro e da edição, e as chamadas de criar, editar e excluir |
| `painel-admin.cy.ts` | Edição de usuário, aprovação e calendário de férias, tipos de feriado |

A sessão nos testes vem de `cy.loginAs('admin' | 'funcionario')`, que grava os
mesmos cookies do login.

## Organização

```text
app/                  rotas; as páginas só montam a tela com o que vem da feature
features/<domínio>/   ponto, ferias, feedback, usuarios, cargos, jornadas…
  api.ts              rotas da API e tipos do contrato
  hooks/              busca e ações de cada tela (useFeriasAdmin, useUsuariosAdmin…)
  components/         UI do domínio (components/admin/ para o painel)
shared/
  lib/                cliente HTTP, sessão, toast, formatação
  ui/                 Button, Table, modais, Calendario…
  types/              ApiResponse<T> e tipos de UI
middleware.ts         protege as rotas no servidor
```

`app` importa de `features` e `shared`, e `features` importa de `shared`. Uma
feature só usa outra pelo `api.ts` dela. O histórico dessa organização e os
bugs encontrados no caminho estão em
[docs/arquitetura.md](docs/arquitetura.md).

## Sessão e acesso

O login grava a sessão em três cookies: `eponto_token`, `eponto_id` e
`eponto_perfil`. Eles expiram junto com o token quando ele é um JWT com `exp`,
ou em 8h. O `middleware.ts` usa esses cookies para:

- mandar para o login quem abre uma tela sem sessão (ou com o token vencido);
- mandar para `/home` quem não é admin e abre `/dashboard` ou `/adicionar-*`.

O cliente HTTP envia `Authorization: Bearer <token>` em toda chamada. Se a API
responder 401, a sessão é encerrada.

O perfil é decidido no login, nesta ordem:

1. campo `perfil` da resposta (`"admin"` ou `"funcionario"`);
2. claim de role do JWT;
3. e-mail em `NEXT_PUBLIC_ADMIN_EMAILS`, até a API mandar o perfil.

Os cookies podem ser editados no navegador. O front só decide a navegação, e
quem protege os dados é a API. O que falta do lado dela (validar o token, usar
o usuário do token e restringir as rotas de admin) está em
[docs/arquitetura.md](docs/arquitetura.md#o-que-a-api-net-precisa-fazer).

## Dados de exemplo

A página de **Estatísticas** e o gráfico de **Pontualidade** da home ainda
usam dados fixos, e aparecem com o selo "Dados de exemplo". Os dados ficam em
`features/analytics/demoData.ts` e `features/ponto/demoData.ts`.

## Contrato da API

[docs/api.md](docs/api.md) descreve as rotas, mas em alguns pontos não bate com
o que a API devolve hoje (nomes de campos de feriado e jornada, por exemplo).
Nesses casos, os tipos em `features/*/api.ts` seguem o que as telas usam.

As regras do cadastro de usuário estão em
[docs/validacoes-usuario.md](docs/validacoes-usuario.md).
