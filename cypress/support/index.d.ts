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
     * Responde { sucesso: true } para qualquer rota da API; registre depois as respostas específicas
     * @example cy.mockApi(); cy.intercept('GET', '**' + '/api/Cargo/Listar', { fixture: 'cargos.json' })
     */
    mockApi(): Chainable<void>
  }
} 