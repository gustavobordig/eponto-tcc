describe('Autenticação Administrativa', () => {
  beforeEach(() => {
    // Limpar qualquer autenticação anterior
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('deve solicitar autenticação administrativa ao acessar página de cargos', () => {
    cy.visit('/dashboard/cargos');
    
    // Verificar se aparece o formulário de autenticação administrativa
    cy.get('input[placeholder="Digite a senha para acessar a área administrativa"]').should('be.visible');
    cy.get('button').contains('Entrar').should('be.visible');
  });

  it('deve solicitar autenticação administrativa ao acessar adicionar cargo', () => {
    cy.visit('/adicionar-cargo');
    
    // Verificar se aparece o formulário de autenticação administrativa
    cy.get('input[placeholder="Digite a senha para acessar a área administrativa"]').should('be.visible');
    cy.get('button').contains('Entrar').should('be.visible');
  });

  it('deve fazer autenticação administrativa com senha correta', () => {
    cy.visit('/dashboard/cargos');
    
    // Digitar a senha administrativa
    cy.get('input[placeholder="Digite a senha para acessar a área administrativa"]').type('123');
    
    // Clicar no botão de entrar
    cy.get('button').contains('Entrar').click();
    
    // Verificar se foi autenticado e está na página de cargos
    cy.url().should('include', '/dashboard/cargos');
    cy.contains('Cargos').should('be.visible');
  });

  it('deve mostrar erro com senha administrativa incorreta', () => {
    cy.visit('/dashboard/cargos');
    
    // Digitar senha incorreta
    cy.get('input[placeholder="Digite a senha para acessar a área administrativa"]').type('senhaerrada');
    
    // Clicar no botão de entrar
    cy.get('button').contains('Entrar').click();
    
    // Verificar se permanece na página de autenticação
    cy.get('input[placeholder="Digite a senha para acessar a área administrativa"]').should('be.visible');
  });

  it('deve permitir acesso após autenticação administrativa bem-sucedida', () => {
    // Fazer autenticação administrativa
    cy.visit('/dashboard/cargos');
    cy.get('input[placeholder="Digite a senha para acessar a área administrativa"]').type('123');
    cy.get('button').contains('Entrar').click();
    
    // Verificar se está na página de cargos
    cy.url().should('include', '/dashboard/cargos');
    
    // Tentar acessar adicionar cargo sem nova autenticação
    cy.visit('/adicionar-cargo');
    
    // Verificar se não pede autenticação novamente
    cy.get('input[placeholder="Digite a senha para acessar a área administrativa"]').should('not.exist');
    cy.get('#nome').should('be.visible');
  });

  it('deve usar o comando ensureAdminAuth corretamente', () => {
    cy.visit('/dashboard/cargos');
    
    // Usar o comando personalizado
    cy.ensureAdminAuth();
    
    // Verificar se está autenticado
    cy.url().should('include', '/dashboard/cargos');
    cy.contains('Cargos').should('be.visible');
  });
}); 