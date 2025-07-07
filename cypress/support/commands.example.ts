// Exemplo de como configurar o comando de login
// Copie este arquivo para commands.ts e ajuste conforme necessário

Cypress.Commands.add('loginAsAdmin', () => {
  // Opção 1: Login via formulário
  cy.visit('/dashboard');
  
  // Preencher credenciais de admin
  cy.get('#email').type('admin@exemplo.com');
  cy.get('#password').type('senha123');
  cy.get('form').submit();
  
  // Verificar se o login foi bem-sucedido
  cy.url().should('include', '/dashboard');
  
  // Opção 2: Login via localStorage (se você armazena o token)
  // cy.window().then((win) => {
  //   win.localStorage.setItem('token', 'seu-token-aqui');
  // });
  
  // Opção 3: Login via cookie (se você usa cookies)
  // cy.setCookie('auth-token', 'seu-token-aqui');
});

// Exemplo de comando para limpar dados de teste
Cypress.Commands.add('cleanupTestData', () => {
  // Limpar cargos de teste criados durante os testes
  cy.visit('/dashboard/cargos');
  cy.get('table tbody tr').each(($row) => {
    const cargoName = $row.find('td').first().text();
    if (cargoName.includes('Teste') || cargoName.includes('Completo')) {
      cy.wrap($row).find('button').last().click();
      cy.get('[role="dialog"] button').contains('Confirmar').click();
      cy.contains('Cargo excluído com sucesso!').should('be.visible');
    }
  });
});

// Exemplo de comando para verificar se está logado
Cypress.Commands.add('ensureLoggedIn', () => {
  cy.visit('/dashboard');
  cy.url().then((url) => {
    if (url.includes('/login') || url.includes('/')) {
      cy.loginAsAdmin();
    }
  });
}); 