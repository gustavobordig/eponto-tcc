/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Grava os cookies de sessão com o perfil informado
     * @example cy.loginAs('funcionario')
     */
    loginAs(perfil: 'admin' | 'funcionario'): Chainable<void>

    /**
     * Sessão de admin por cookie
     * @example cy.loginAsAdmin()
     */
    loginAsAdmin(): Chainable<void>
    
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