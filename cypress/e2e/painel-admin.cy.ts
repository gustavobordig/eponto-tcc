// Painel admin com a API simulada. Cobre bugs já corrigidos para não voltarem.
describe('Painel admin', () => {
  beforeEach(() => {
    cy.mockApi();
    cy.loginAsAdmin();
  });

  describe('Usuários', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/api/Usuario/Listar', { fixture: 'usuarios.json' }).as('usuarios');
      cy.intercept('GET', '**/api/Cargo/Listar', { fixture: 'cargos.json' });
      cy.intercept('GET', '**/api/JornadaTrabalho/Listar', { fixture: 'jornadas.json' });
      cy.visit('/dashboard');
      cy.wait('@usuarios');
    });

    it('lista com os nomes de cargo e jornada, buscando os usuários uma vez só', () => {
      cy.get('table tbody tr').first().should('contain', 'Ana Souza').and('contain', 'Analista').and('contain', 'Meio período');
      cy.get('@usuarios.all').should('have.length', 1);
      cy.contains('Editar Usuário').should('not.exist');
    });

    it('salva a edição mantendo a data de nascimento', () => {
      cy.intercept('PUT', '**/api/Usuario/Atualizar/*', { body: { sucesso: true, mensagem: null } }).as('atualizar');
      cy.get('table tbody tr').first().contains('Editar').click();

      cy.get('select').first().select('Gerente');
      cy.contains('button', 'Salvar').should('not.be.disabled').click();

      cy.wait('@atualizar').then(({ request }) => {
        expect(request.url).to.match(/Atualizar\/1$/);
        expect(request.body).to.deep.include({
          idUsuario: 1,
          idCargo: 2,
          idJornada: 2,
          dataNascimento: '1990-05-10T00:00:00',
        });
      });
      cy.contains('Editar Usuário').should('not.exist');
    });

    it('fecha o modal no Cancelar', () => {
      cy.get('table tbody tr').first().contains('Editar').click();
      cy.contains('Editar Usuário').should('be.visible');
      cy.contains('button', 'Cancelar').click();
      cy.contains('Editar Usuário').should('not.exist');
    });
  });

  describe('Férias', () => {
    beforeEach(() => {
      // Fixa a data para o calendário abrir sempre em outubro de 2026
      cy.clock(new Date(2026, 9, 8).getTime(), ['Date']);
      cy.intercept('GET', '**/api/Ferias/ListarFerias', { fixture: 'ferias.json' });
      cy.intercept('GET', '**/api/Ferias/ListarSolicitacoesFerias', { fixture: 'solicitacoesFerias.json' });
      cy.visit('/dashboard/ferias');
    });

    it('só mostra aprovar/reprovar nas solicitações pendentes', () => {
      cy.contains('tr', 'Ana Souza').should('contain', 'Pendente').and('contain', 'Aprovar');
      cy.contains('tr', 'Bruno Lima').should('contain', 'Aprovado').and('not.contain', 'Reprovar');
    });

    it('reprova enviando a situação 2', () => {
      cy.intercept('POST', '**/api/Ferias/AtualizaSolicitacaoFerias*', { body: { sucesso: true, mensagem: null } }).as('decidir');
      cy.contains('tr', 'Ana Souza').contains('Reprovar').click();
      cy.contains('Confirmar Reprovação').should('be.visible');
      cy.contains('Funcionário: Ana Souza').should('be.visible');
      cy.get('.fixed.inset-0').contains('button', 'Reprovar').click();

      cy.wait('@decidir').its('request.url').should('include', 'idSolicitacao=4').and('include', 'indSituacao=2');
      cy.contains('Confirmar Reprovação').should('not.exist');
    });

    it('mostra as férias cadastradas no calendário', () => {
      cy.contains('button', 'Calendário').click();
      cy.contains('.rbc-toolbar button', 'Próximo').click();
      cy.contains('.rbc-toolbar button', 'Próximo').click();
      cy.get('.rbc-toolbar-label').should('contain', 'dezembro');
      cy.contains('.rbc-event', 'Início - Recesso de fim de ano').should('exist');
    });
  });

  describe('Feriados', () => {
    it('mostra o tipo de cada feriado', () => {
      cy.intercept('GET', '**/api/feriado/ListarFeriados', {
        body: {
          sucesso: true,
          mensagem: null,
          listaFeriados: [
            { idFeriado: 1, dscFeriado: 'Natal', datFeriado: '2026-12-25T00:00:00', indTipoFeriado: 1 },
            { idFeriado: 2, dscFeriado: 'Quarta de Cinzas', datFeriado: '2027-02-10T00:00:00', indTipoFeriado: 2 },
          ],
        },
      });
      cy.visit('/dashboard/feriados');
      cy.contains('tr', 'Natal').should('contain', 'Integral');
      cy.contains('tr', 'Quarta de Cinzas').should('contain', 'Meio Período');
    });
  });
});
