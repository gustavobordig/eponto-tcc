# Revisão de arquitetura — ePonto (front)

Front em Next.js 15 (App Router) que consome a API .NET descrita em [`api.md`](api.md). Este documento registra o diagnóstico e o plano em fases.

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
| S1 | ~~Senha `123` fixa no front para o painel admin.~~ Removida na fase 3. Desde a fase 6, o perfil vem da role do JWT, e a API bloqueia as rotas de cadastro com `Roles = "Admin"`. Algumas ações de admin ainda estão abertas na API (ver [pendências](#pendências-na-api-net)). | API |
| S2 | ~~O token nunca era enviado.~~ Desde a fase 2 vai no header `Authorization`, e a API o valida. Falta ela usar o usuário do token, e não o `idUsuario` da URL: hoje, trocando o número, dá para ver os dados de outra pessoa (ver [pendências](#pendências-na-api-net)). | API |
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
- ~~O README ainda era o padrão do `create-next-app`.~~ Resolvido na fase 5.

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
- O perfil passou a vir da role do JWT. Na fase 3, sem o código da API, também havia uma lista temporária de e-mails em `NEXT_PUBLIC_ADMIN_EMAILS`; ela saiu na fase 6, porque a API já manda a role no token.
- Se a API falhar ao carregar o usuário, o layout mostra um aviso em vez de mandar para o login, porque isso criaria um loop com o middleware. Sessão inválida (401) continua encerrada pelo interceptor.
- Cypress: `cy.loginAs(perfil)` grava a sessão por cookie, e `admin-auth.cy.ts` passou a testar as regras do middleware, sem depender da API.

**Limite:** os cookies podem ser editados no navegador. O front só decide a navegação; quem protege os dados é a API.

A lista do que a API precisava fazer foi revista com o código dela na fase 6: veja [Pendências na API .NET](#pendências-na-api-net).

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

### Fase 5 — documentação e testes ✅ (branch `refactor/arquitetura-fase-5`)

- O README deixou de ser o padrão do `create-next-app`. Agora explica como rodar, as variáveis de ambiente, as verificações do CI, os testes, a organização, a sessão e o acesso, e os dados de exemplo. `api.md` e `VALIDACOES_USUARIO.md` foram para `docs/`.
- Os testes e2e não dependem mais da API:
  - `cy.mockApi()` responde `{ sucesso: true }` para `/api/**`, e cada teste registra as respostas que importam, com fixtures em `cypress/fixtures/`;
  - os testes que criavam e excluíam cargos de verdade passaram a conferir o que é enviado à API.
- Novo `painel-admin.cy.ts` cobre os bugs corrigidos nas fases 2 e 4, para não voltarem:
  - a edição de usuário mantém a data de nascimento e o "Salvar" fica habilitado;
  - o modal não abre sozinho;
  - o calendário de férias mostra os eventos;
  - a coluna "Tipo" dos feriados está certa.
- `login.cy.ts` testa os cookies da sessão, o perfil admin vindo da API e a mensagem de erro.
- O CI ganhou o job `e2e` (`cypress-io/github-action`): faz o build, sobe o app, roda o Cypress e guarda os screenshots quando um teste falha.

### Fase 6 — alinhar o front com a API real ✅ (branch `refactor/arquitetura-fase-6`)

Com o código da API (`KaduScorsoni/EPonto`) em mãos, o contrato foi conferido rota por rota. A API já tinha bem mais do que o `api.md` dizia:
- JWT validado em quase todas as rotas;
- `Roles = "Admin"` nas de cadastro;
- CORS aceitando `Authorization`;
- perfis de usuário.

O front estava desalinhado em vários pontos, e alguns quebravam fluxos inteiros:

- **Login em duas etapas.** O `RealizarLogin` passou a devolver só os perfis, e o token vem do `AutenticarPerfil`. O front esperava o token na primeira resposta, então gravava uma sessão sem token. Agora:
  - com um perfil, o front entra direto;
  - com mais de um, pede para escolher;
  - o perfil da sessão vem da role do JWT (`Admin` ou `User`).
- **Ausências.** A API usa `0 pendente, 1 aprovada, 2 reprovada`, e o front usava 1, 2 e 3. O admin só via Aprovar/Reprovar nas já aprovadas, que a API recusa; nunca dava para aprovar uma pendente.
- **Feedback.** Três problemas, todos corrigidos:
  - o front gravava o admin como destinatário e não mandava o autor. Agora vai `idUsuarioFeedback` = solicitante e `idAutorFeedback` = admin;
  - a avaliação na API é de 0 a 4 (`FeedbackAvaliacao`), e o front mandava de 1 a 5. Na tela continua de 1 a 5 estrelas;
  - saiu a chamada extra a `AtualizarSolicitacao`, porque a API já marca a solicitação como respondida ao gravar o feedback. Essa chamada era recusada e, se passasse, apagaria a mensagem e o responsável da solicitação.
- **Pedido de feedback.** Ia sempre para o usuário de id 29, fixo no código. Agora vai para o chefe do usuário (`idChefe`); o 29 ficou só como último recurso.
- **Férias.** O cadastro ia para `/api/feriado/CadastrarFerias`, que não existe; o certo é `/api/Ferias/CadastrarFerias`. A coluna de início lia `datInicioFerias`, mas a API manda `datIncioFerias`.
- **Feriados.** Dois problemas:
  - a listagem devolve o tipo como texto (`dscTipoFeriado`). A coluna Tipo e o select da edição liam `indTipoFeriado`, que não vem;
  - a API não tem rota de atualização, e a edição chamava o cadastro, criando um feriado duplicado. Agora cadastra o novo e exclui o antigo. A data também passou a chegar no formato do campo (`yyyy-MM-dd`).
- **Contrato no perfil.** O card buscava a lista inteira de cargos e de jornadas, que são rotas só de admin (funcionário recebia 403). Agora usa `/api/Usuario/Contrato/{id}`.
- **Perfil e usuários.** A API não grava `SENHA` nem `IND_ATIVO` na atualização de usuário. O campo de nova senha do perfil (que nem aceitava digitação) virou um link para o fluxo com código por e-mail, e o select de status saiu da edição de usuário (inativar é pelo Excluir).
- Tipos alinhados com os modelos da API: `idUsuario` no registro de ponto, jornada sem os campos que só existiam no `api.md`, e o calendário recebendo `ano`.

Testes: `login.cy.ts` cobre as duas etapas e a escolha de perfil. O novo `funcionario.cy.ts` e o `painel-admin.cy.ts` cobrem os pontos acima.

### Pendências na API .NET

Encontradas lendo o código da API em out/2026. Ficam com quem mantém a API.

**Urgente (segurança)**

1. **Troca de senha sem código.** `POST /api/login/AlteraSenhaLogin` é pública e atualiza a senha de qualquer e-mail sem conferir o código de recuperação. Qualquer pessoa pode tomar qualquer conta, inclusive de admin. A rota precisa exigir o código válido (e ele precisa expirar e ter limite de tentativas).
2. **Credenciais no repositório público.** O `appsettings.json` versionado tem a senha dos dois bancos, a chave do JWT e o segredo do Cloudinary, e o `LoginService.cs` tem a senha de app do Gmail. Como o repositório é público, todas precisam ser **trocadas** (não basta apagar do código, o histórico do git continua com elas) e passar a vir de variáveis de ambiente.

**Autorização**

3. Rotas com `[Authorize]` sem `Roles = "Admin"` que fazem ação de admin:
   - `RegistroPonto/ValidarSolicitacao` (qualquer funcionário aprova o próprio ajuste);
   - `Usuario/Atualizar/{id}` (qualquer um edita qualquer usuário);
   - `BancoHoras/Processar`;
   - `SolicitacaoAusencia/Deletar` e `Feedback/Deletar`.
4. Listagens gerais abertas a qualquer usuário logado: `RegistroPonto/Listar`, `ListarSolicitacoesAlteracao`, `SolicitacaoAusencia/ListarSolicitacaoAusencia`, `Feedback/ListarSolicitacao` e `ListarFeedback`, `Relatorio/RelatorioHorasExtras`.
5. Rotas com `{idUsuario}` na URL (banco de horas, registros, férias, ausências, feedbacks, `Usuario/{id}` e `Contrato/{id}`) não conferem se é o próprio usuário. Basta trocar o número para ver os dados de outra pessoa. O id deveria vir da claim `sub` do token, ou a rota deveria exigir admin quando o id for de outra pessoa.

**Contrato**

6. O enum `StatusFeedback` tem os nomes trocados (`Finalizado = 0`, `Pendente = 1`), mas o banco usa 0 para pendente e 1 para respondida.
7. Atualizar usuário não grava `SENHA` nem `IND_ATIVO`, embora o service calcule o hash da senha.
8. Feriado não tem rota de atualização; férias usa `DatIncioFerias` (com erro de digitação) em cadastro e listagem.

