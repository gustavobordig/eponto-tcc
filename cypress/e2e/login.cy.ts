import { jwtDeTeste } from '../support/jwt';

// Login em duas etapas, como na API: RealizarLogin devolve os perfis e
// AutenticarPerfil devolve o token (com a role Admin ou User no JWT)
describe('Login', () => {
  const preencher = (email: string, senha: string) => {
    cy.get('input[placeholder="Digite seu email"]').type(email);
    cy.get('input[placeholder="Digite sua senha"]').type(senha);
    cy.contains('button', 'Entrar').click();
  };

  const perfis = (lista: { idPerfil: number; dscPerfil: string }[]) =>
    cy.intercept('POST', '**/api/login/RealizarLogin', {
      body: { sucesso: true, mensagem: 'Login realizado com sucesso.', perfisUsuario: lista },
    }).as('login');

  const autenticar = (idUsuario: number, role: 'Admin' | 'User') =>
    cy.intercept('POST', '**/api/login/AutenticarPerfil', {
      body: { sucesso: true, mensagem: null, idUsuario, token: jwtDeTeste(idUsuario, role) },
    }).as('autenticar');

  beforeEach(() => {
    cy.clearCookies();
    cy.mockApi();
    cy.visit('/');
  });

  it('com um perfil, entra direto e grava a sessão', () => {
    perfis([{ idPerfil: 2, dscPerfil: 'Funcionário' }]);
    autenticar(7, 'User');

    preencher('ana@exemplo.com', 'senha-teste');

    cy.wait('@login').its('request.body').should('deep.equal', { email: 'ana@exemplo.com', senha: 'senha-teste' });
    cy.wait('@autenticar')
      .its('request.body')
      .should('deep.equal', { email: 'ana@exemplo.com', senha: 'senha-teste', idPerfil: 2 });
    cy.location('pathname').should('eq', '/home');
    cy.getCookie('eponto_id').its('value').should('eq', '7');
    cy.getCookie('eponto_perfil').its('value').should('eq', 'funcionario');
    // O link do painel fica no menu do avatar
    cy.get('button[aria-label="Menu da conta"]').click();
    cy.contains('Meu perfil').should('be.visible');
    cy.get('a[href="/dashboard"]').should('not.exist');
  });

  it('com role Admin no token, mostra o link do painel', () => {
    perfis([{ idPerfil: 1, dscPerfil: 'Administrador' }]);
    autenticar(1, 'Admin');

    preencher('rh@exemplo.com', 'senha-teste');

    cy.location('pathname').should('eq', '/home');
    cy.getCookie('eponto_perfil').its('value').should('eq', 'admin');
    cy.get('button[aria-label="Menu da conta"]').click();
    cy.contains('a', 'Ir para o Painel RH').should('have.attr', 'href', '/dashboard');
  });

  it('com mais de um perfil, pede para escolher', () => {
    perfis([
      { idPerfil: 1, dscPerfil: 'Administrador' },
      { idPerfil: 2, dscPerfil: 'Funcionário' },
    ]);
    autenticar(1, 'Admin');

    preencher('rh@exemplo.com', 'senha-teste');

    cy.contains('Escolha o perfil').should('be.visible');
    cy.contains('button', 'Administrador').click();
    cy.wait('@autenticar').its('request.body.idPerfil').should('eq', 1);
    cy.location('pathname').should('eq', '/home');
  });

  it('sem perfil, avisa e não entra', () => {
    perfis([]);
    preencher('ana@exemplo.com', 'senha-teste');
    cy.contains('não tem perfil de acesso').should('be.visible');
    cy.location('pathname').should('eq', '/');
    cy.getCookie('eponto_token').should('be.null');
  });

  it('mostra a mensagem da API quando a senha está errada', () => {
    cy.intercept('POST', '**/api/login/RealizarLogin', {
      statusCode: 401,
      body: { sucesso: false, mensagem: 'Senha incorreta.' },
    });

    preencher('ana@exemplo.com', 'errada');

    cy.contains('Senha incorreta.').should('be.visible');
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
