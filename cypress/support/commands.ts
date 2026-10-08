import { Perfil, SESSION_COOKIES } from '../../shared/lib/session';

// Sessão simulada por cookie, no mesmo formato que o login grava
Cypress.Commands.add('loginAs', (perfil: Perfil) => {
  cy.setCookie(SESSION_COOKIES.token, 'token-de-teste');
  cy.setCookie(SESSION_COOKIES.id, '1');
  cy.setCookie(SESSION_COOKIES.perfil, perfil);
});

Cypress.Commands.add('loginAsAdmin', () => {
  cy.loginAs('admin');
});

// A API não roda nos testes: toda rota /api/** responde { sucesso: true } e
// cada teste registra depois as respostas que importam (as mais recentes valem).
Cypress.Commands.add('mockApi', () => {
  cy.intercept({ url: '**/api/**' }, { body: { sucesso: true, mensagem: null } }).as('api');
});
