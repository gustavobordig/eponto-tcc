/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login as admin
       * @example cy.loginAsAdmin()
       */
      loginAsAdmin(): Chainable<Element>
      
      /**
       * Custom command to create a test cargo
       * @example cy.createTestCargo('Desenvolvedor', '5000')
       */
      createTestCargo(nome: string, salario: string, formacaoMinima?: string): Chainable<Element>
      
      /**
       * Custom command to delete a cargo by name
       * @example cy.deleteCargoByName('Desenvolvedor Teste')
       */
      deleteCargoByName(nome: string): Chainable<Element>
    }
  }
}

// Comando para fazer login como admin
Cypress.Commands.add('loginAsAdmin', () => {
  // Primeiro, verificar se já está logado
  cy.visit('/dashboard/cargos');
  cy.url().then((url) => {
    // Se não estiver na página de cargos (provavelmente redirecionado para login)
    if (!url.includes('/dashboard/cargos')) {
      // Fazer login
      cy.visit('/');
      
      // Usar seletores baseados na estrutura real do formulário
      // O componente Input não tem IDs específicos, então vamos usar atributos ou posição
      cy.get('input[type="text"], input[type="email"]').first().type('admin@exemplo.com');
      cy.get('input[type="password"]').first().type('senha123');
      
      // Clicar no botão de login
      cy.get('button').contains('Entrar').click();
      
      // Verificar se o login foi bem-sucedido
      cy.url().should('include', '/home');
      
      // Navegar para a página de cargos
      cy.visit('/dashboard/cargos');
    }
  });
});

// Comando para verificar e fazer seleção de perfil admin se necessário
Cypress.Commands.add('ensureAdminAuth', () => {
  // Verificar se está na página de seleção de perfil
  cy.get('body').then(($body) => {
    if ($body.find('text:contains("Quem está usando?")').length > 0) {
      // Se encontrar a página de seleção de perfil, clicar no perfil admin
      cy.contains('Administrador').click();
      
      // Aguardar um pouco para o redirecionamento processar
      cy.wait(1000);
    }
  });
});

// Comando para criar um cargo de teste
Cypress.Commands.add('createTestCargo', (nome: string, salario: string, formacaoMinima?: string) => {
  cy.visit('/adicionar-cargo');
  
  // Verificar se precisa fazer autenticação administrativa
  cy.ensureAdminAuth();
  
  // Adicionar data formatada única ao nome para evitar conflitos
  const agora = new Date();
  const dia = agora.getDate().toString().padStart(2, '0');
  const mes = (agora.getMonth() + 1).toString().padStart(2, '0');
  const hora = agora.getHours().toString().padStart(2, '0');
  const minuto = agora.getMinutes().toString().padStart(2, '0');
  const dataFormatada = `${dia}-${mes} ${hora}:${minuto}`;
  const nomeUnico = `${nome} ${dataFormatada}`;
  
  cy.get('#nome').type(nomeUnico);
  cy.get('#formacaoMinima').type(formacaoMinima || 'Ensino Superior');
  cy.get('#salario').type(salario);
  cy.get('form').submit();
  cy.url().should('include', '/dashboard/cargos');
  cy.contains('Cargo cadastrado com sucesso!').should('be.visible');
});

// Comando para deletar um cargo pelo nome
Cypress.Commands.add('deleteCargoByName', (nome: string) => {
  cy.visit('/dashboard/cargos');
  
  // Verificar se precisa fazer autenticação administrativa
  cy.ensureAdminAuth();
  
  cy.get('table tbody tr').contains(nome).parent().find('button').last().click();
  cy.get('[role="dialog"] button').contains('Confirmar').click();
  cy.contains('Cargo excluído com sucesso!').should('be.visible');
});