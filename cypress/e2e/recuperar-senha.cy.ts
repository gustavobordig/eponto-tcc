// Recuperação de senha: a API só troca a senha com o código recebido por e-mail
describe('Recuperar senha', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.mockApi();
    cy.visit('/forgot-password');
  });

  it('envia o código junto com a nova senha', () => {
    cy.intercept('POST', '**/api/login/RecuperarSenha', { body: true }).as('recuperar');
    cy.intercept('POST', '**/api/login/ValidaCodigoRecuperacao', { body: true }).as('validar');
    cy.intercept('POST', '**/api/login/AlteraSenhaLogin', { body: true }).as('alterar');

    cy.get('input[placeholder="Seu email"]').type('ana@exemplo.com');
    cy.contains('button', 'Solicitar Recuperação').click();
    cy.wait('@recuperar').its('request.body').should('deep.equal', { email: 'ana@exemplo.com' });

    cy.get('input[placeholder="Código de recuperação"]').type('123456');
    cy.contains('button', 'Validar Código').click();
    cy.wait('@validar');

    cy.get('input[placeholder="Nova senha"]').type('nova-senha');
    cy.contains('button', 'Alterar Senha').click();
    cy.wait('@alterar')
      .its('request.body')
      .should('deep.equal', { email: 'ana@exemplo.com', senha: 'nova-senha', codigo: 123456 });
    cy.location('pathname').should('eq', '/');
  });

  it('avisa quando o código é inválido ou expirou', () => {
    cy.intercept('POST', '**/api/login/RecuperarSenha', { body: true });
    cy.intercept('POST', '**/api/login/ValidaCodigoRecuperacao', { statusCode: 400, body: false });

    cy.get('input[placeholder="Seu email"]').type('ana@exemplo.com');
    cy.contains('button', 'Solicitar Recuperação').click();
    cy.get('input[placeholder="Código de recuperação"]').type('000000');
    cy.contains('button', 'Validar Código').click();

    cy.contains('Código inválido ou expirado').should('be.visible');
  });

  it('volta para a tela de login', () => {
    cy.contains('button', 'Voltar para o login').click();
    cy.location('pathname').should('eq', '/');
  });
});
