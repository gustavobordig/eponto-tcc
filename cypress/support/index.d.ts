/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to login as admin
     * @example cy.loginAsAdmin()
     */
    loginAsAdmin(): Chainable<Element>
    
    /**
     * Custom command to ensure admin authentication if needed
     * @example cy.ensureAdminAuth()
     */
    ensureAdminAuth(): Chainable<Element>
    
    /**
     * Custom command to create a test cargo
     * @example cy.createTestCargo('Desenvolvedor', '5000', 'Ensino Superior')
     */
    createTestCargo(nome: string, salario: string, formacaoMinima?: string): Chainable<Element>
    
    /**
     * Custom command to delete a cargo by name
     * @example cy.deleteCargoByName('Desenvolvedor Teste')
     */
    deleteCargoByName(nome: string): Chainable<Element>
  }
} 