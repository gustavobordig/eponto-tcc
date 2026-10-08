// Login com a API simulada: confere a sessão gravada em cookie e o redirecionamento
describe('Login', () => {
  const preencher = (email: string, senha: string) => {
    cy.get('input[placeholder="Digite seu email"]').type(email);
    cy.get('input[placeholder="Digite sua senha"]').type(senha);
    cy.contains('button', 'Entrar').click();
  };

  beforeEach(() => {
    cy.clearCookies();
    cy.mockApi();
    cy.visit('/');
  });

  it('entra, grava a sessão e vai para a home', () => {
    cy.intercept('POST', '**/api/login/realizarLogin', {
      body: { sucesso: true, mensagem: null, idUsuario: 7, token: 'token-e2e' },
    }).as('login');

    preencher('ana@exemplo.com', 'senha-teste');

    cy.wait('@login').its('request.body').should('deep.equal', { email: 'ana@exemplo.com', senha: 'senha-teste' });
    cy.location('pathname').should('eq', '/home');
    cy.getCookie('eponto_token').its('value').should('eq', 'token-e2e');
    cy.getCookie('eponto_id').its('value').should('eq', '7');
    cy.getCookie('eponto_perfil').its('value').should('eq', 'funcionario');
    cy.get('a[href="/dashboard"]').should('not.exist');
  });

  it('com perfil admin vindo da API, mostra o link do painel', () => {
    cy.intercept('POST', '**/api/login/realizarLogin', {
      body: { sucesso: true, mensagem: null, idUsuario: 1, token: 'token-admin', perfil: 'admin' },
    });

    preencher('rh@exemplo.com', 'senha-teste');

    cy.location('pathname').should('eq', '/home');
    cy.getCookie('eponto_perfil').its('value').should('eq', 'admin');
    cy.get('a[href="/dashboard"]').should('exist');
  });

  it('mostra a mensagem da API quando o login falha e não sai da tela', () => {
    cy.intercept('POST', '**/api/login/realizarLogin', {
      statusCode: 401,
      body: { sucesso: false, mensagem: 'Usuário ou senha inválidos' },
    });

    preencher('ana@exemplo.com', 'errada');

    cy.contains('Usuário ou senha inválidos').should('be.visible');
    cy.location('pathname').should('eq', '/');
    cy.getCookie('eponto_token').should('be.null');
  });

  it('não envia o formulário com os campos vazios', () => {
    cy.contains('button', 'Entrar').should('be.disabled');
    cy.get('input[placeholder="Digite seu email"]').type('ana@exemplo.com');
    cy.contains('button', 'Entrar').should('be.disabled');
    cy.location('pathname').should('eq', '/');
  });

  it('com sessão, voltar para a tela de login leva para a home', () => {
    cy.loginAs('funcionario');
    cy.visit('/');
    cy.location('pathname').should('eq', '/home');
  });
});
