# Testes e2e

Rodam contra o app (`npm run build && npm start`) com a API simulada: nada é
gravado e não é preciso ter a API .NET rodando.

```bash
npm run test:e2e                                   # todos
npx cypress run --spec cypress/e2e/login.cy.ts     # um só
npm run test:e2e:open                              # modo interativo
```

## Comandos

| Comando | O que faz |
|---------|-----------|
| `cy.mockApi()` | Toda rota `/api/**` responde `{ sucesso: true, mensagem: null }`. Chame no `beforeEach` e registre depois as respostas específicas: o `cy.intercept` mais recente vale. |
| `cy.loginAs(perfil)` | Grava os cookies da sessão (`eponto_token`, `eponto_id`, `eponto_perfil`) com `'admin'` ou `'funcionario'`. Chame antes do `cy.visit`. |
| `cy.loginAsAdmin()` | Atalho para `cy.loginAs('admin')`. |

## Padrão de um teste

```ts
beforeEach(() => {
  cy.mockApi();
  cy.intercept('GET', '**/api/Cargo/Listar', { fixture: 'cargos.json' }).as('cargos');
  cy.loginAsAdmin();
  cy.visit('/dashboard/cargos');
});

it('exclui pelo id', () => {
  cy.intercept('PUT', '**/api/Cargo/Deletar/*', { body: { sucesso: true } }).as('deletar');
  // ...interação na tela...
  cy.wait('@deletar').its('request.url').should('match', /Deletar\/1$/);
});
```

As fixtures ficam em `cypress/fixtures/`, no mesmo formato de resposta da API
(`{ sucesso, mensagem, <lista> }`).
