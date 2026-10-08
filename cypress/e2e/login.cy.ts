describe('Login', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('deve fazer login com credenciais válidas', () => {
    // Usar seletores baseados na estrutura real do formulário
    cy.get('input[type="text"], input[type="email"]').first().type('admin@exemplo.com');
    cy.get('input[type="password"]').first().type('senha123');
    
    // Clicar no botão de login
    cy.get('button').contains('Entrar').click();
    
    // Verificar se foi redirecionado para a página home
    cy.url().should('include', '/home');
  });

  it('deve mostrar erro com credenciais inválidas', () => {
    cy.get('input[type="text"], input[type="email"]').first().type('email@invalido.com');
    cy.get('input[type="password"]').first().type('senhaerrada');
    
    cy.get('button').contains('Entrar').click();
    
    // Verificar se permanece na página de login ou mostra erro
    cy.url().should('not.include', '/home');
  });

  it('deve validar campos obrigatórios', () => {
    // Tentar fazer login sem preencher os campos
    cy.get('button').contains('Entrar').click();
    
    // Verificar se permanece na página de login
    cy.url().should('not.include', '/home');
  });

  it('depois do login, voltar para a tela de login leva para a home', () => {
    cy.get('input[type="text"], input[type="email"]').first().type('admin@exemplo.com');
    cy.get('input[type="password"]').first().type('senha123');
    cy.get('button').contains('Entrar').click();
    cy.url().should('include', '/home');

    cy.visit('/');
    cy.location('pathname').should('eq', '/home');
  });
});
