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

Variáveis `NEXT_PUBLIC_` vão para o código que roda no navegador. Não coloque
nada secreto nelas.

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
| `login.cy.ts` | Login em duas etapas, escolha de perfil, cookies da sessão, erro da API |
| `cargos.cy.ts` | Validações do cadastro e da edição, e as chamadas de criar, editar e excluir |
| `painel-admin.cy.ts` | Usuários, férias, feriados, resposta de feedback e aprovação de ausências |
| `funcionario.cy.ts` | Contrato no perfil, status das ausências, pedido de feedback ao chefe |

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

O login tem duas etapas, como a API: `RealizarLogin` confere e-mail e senha e
devolve os perfis do usuário; com um perfil só, o front entra direto, e com mais
de um, pede para escolher. `AutenticarPerfil` devolve o token, e o perfil da
sessão (`admin` ou `funcionario`) vem da role do JWT (`Admin` ou `User`).

Os cookies podem ser editados no navegador. O front só decide a navegação, e
quem protege os dados é a API, que valida o token e a role. O que ainda falta
do lado dela está em
[docs/arquitetura.md](docs/arquitetura.md#pendências-na-api-net).

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
