// Proteção de rotas feita pelo middleware; não depende da API
describe('Acesso às rotas', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('sem sessão, manda as rotas do funcionário para o login', () => {
    cy.visit('/home');
    cy.location('pathname').should('eq', '/');
  });

  it('sem sessão, manda o painel admin para o login', () => {
    cy.visit('/dashboard/cargos');
    cy.location('pathname').should('eq', '/');

    cy.visit('/adicionar-cargo');
    cy.location('pathname').should('eq', '/');
  });

  it('funcionário não entra no painel admin', () => {
    cy.loginAs('funcionario');
    cy.visit('/dashboard/cargos');
    cy.location('pathname').should('eq', '/home');
  });

  it('admin entra no painel', () => {
    cy.loginAsAdmin();
    cy.visit('/dashboard/cargos');
    cy.location('pathname').should('eq', '/dashboard/cargos');
    cy.contains('Cargos').should('be.visible');

    cy.visit('/adicionar-cargo');
    cy.location('pathname').should('eq', '/adicionar-cargo');
    cy.get('#nome').should('be.visible');
  });

  it('com sessão, a tela de login leva para a home', () => {
    cy.loginAs('funcionario');
    cy.visit('/');
    cy.location('pathname').should('eq', '/home');
  });

  it('não existe mais senha fixa para o painel', () => {
    cy.loginAsAdmin();
    cy.visit('/dashboard');
    cy.get('input[placeholder="Digite a senha para acessar a área administrativa"]').should('not.exist');
  });
});
