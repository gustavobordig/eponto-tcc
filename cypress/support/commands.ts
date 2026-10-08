import { Perfil, SESSION_COOKIES } from '../../lib/session';

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
// // Sessão simulada por cookie (o mesmo formato que o login grava).
// Os testes de CRUD ainda precisam da API rodando.
Cypress.Commands.add('loginAs', (perfil: Perfil) => {
  cy.setCookie(SESSION_COOKIES.token, 'token-de-teste');
  cy.setCookie(SESSION_COOKIES.id, '1');
  cy.setCookie(SESSION_COOKIES.perfil, perfil);
});

Cypress.Commands.add('loginAsAdmin', () => {
  cy.loginAs('admin');
});

// Comando para criar um cargo de teste
Cypress.Commands.add('createTestCargo', (nome: string, salario: string, formacaoMinima?: string) => {
  cy.visit('/adicionar-cargo');
  
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
  
  cy.get('table tbody tr').contains(nome).parent().find('button').last().click();
  cy.get('[role="dialog"] button').contains('Confirmar').click();
  cy.contains('Cargo excluído com sucesso!').should('be.visible');
});