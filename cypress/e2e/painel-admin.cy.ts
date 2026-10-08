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

    it('mostra a data de início das férias cadastradas', () => {
      cy.contains('tr', 'Recesso de fim de ano').should('contain', '22/12/2026');
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
    beforeEach(() => {
      // A listagem devolve o tipo como texto, como a API
      cy.intercept('GET', '**/api/feriado/ListarFeriados', {
        body: {
          sucesso: true,
          mensagem: null,
          listaFeriados: [
            { idFeriado: 1, dscFeriado: 'Natal', datFeriado: '2026-12-25T00:00:00', dscTipoFeriado: 'Feriado Integral' },
            { idFeriado: 2, dscFeriado: 'Quarta de Cinzas', datFeriado: '2027-02-10T00:00:00', dscTipoFeriado: 'Feriado Meio Periodo' },
          ],
        },
      });
      cy.visit('/dashboard/feriados');
    });

    it('mostra o tipo de cada feriado', () => {
      cy.contains('tr', 'Natal').should('contain', 'Integral');
      cy.contains('tr', 'Quarta de Cinzas').should('contain', 'Meio Período');
    });

    it('edita cadastrando o novo e excluindo o antigo (a API não tem rota de atualização)', () => {
      cy.intercept('POST', '**/api/feriado/CadastrarFeriado', { body: { sucesso: true, mensagem: null } }).as('cadastrar');
      cy.intercept('DELETE', '**/api/feriado/DeletarFeriado/*', { body: { sucesso: true, mensagem: null } }).as('excluir');

      cy.contains('tr', 'Quarta de Cinzas').contains('Editar').click();
      cy.get('input[type="date"]').should('have.value', '2027-02-10');
      cy.contains('button', 'Salvar').click();

      cy.wait('@cadastrar').its('request.body').should('deep.equal', {
        dscFeriado: 'Quarta de Cinzas',
        datFeriado: '2027-02-10',
        indTipoFeriado: 2,
      });
      cy.wait('@excluir').its('request.url').should('match', /DeletarFeriado\/2$/);
    });
  });

  describe('Feedback', () => {
    it('responde com o solicitante como destinatário, o admin como autor e a avaliação de 0 a 4', () => {
      cy.intercept('GET', '**/api/Feedback/ListarSolicitacao', {
        body: {
          sucesso: true,
          mensagem: null,
          solicitacoesFeedback: [
            {
              idSolicitacaoFeedback: 7, idUsuarioSolicitacao: 5, nomeUsuarioSolicitacao: 'Ana Souza',
              idResponsavelFeedback: 1, nomeResponsavelFeedback: 'Bruno Lima', status: 0,
              dataSolicitacao: '2026-09-30T10:00:00', mensagemSolicitacao: 'Quero um retorno do trimestre.',
            },
          ],
        },
      });
      cy.intercept('POST', '**/api/Feedback/InserirFeedback', { body: { sucesso: true, mensagem: null } }).as('inserir');
      cy.intercept('PUT', '**/api/Feedback/AtualizarSolicitacao/*').as('atualizarStatus');
      cy.visit('/dashboard/feedback');

      cy.contains('tr', 'Ana Souza').contains('button', 'Responder').click();
      cy.get('textarea').type('Bom trimestre, siga assim nas entregas.');
      cy.contains('button', 'Enviar Feedback').click();

      cy.wait('@inserir').its('request.body').should('deep.include', {
        idUsuarioFeedback: 5,
        idAutorFeedback: 1,
        idSolicitacaoFeedback: 7,
        avaliacao: 4, // 5 estrelas = Excelente (4) na API
      });
      // A API já marca a solicitação como respondida ao gravar o feedback
      cy.get('@atualizarStatus.all').should('have.length', 0);
    });
  });

  describe('Ausências', () => {
    it('mostra aprovar/reprovar só na pendente (status 0) e aprova', () => {
      cy.intercept('GET', '**/api/Usuario/Listar', { fixture: 'usuarios.json' });
      cy.intercept('GET', '**/api/SolicitacaoAusencia/ListarSolicitacaoAusencia', {
        body: {
          sucesso: true,
          mensagem: null,
          solicitacoes: [
            { idSolicitacaoAusencia: 9, idUsuario: 1, mensagemSolicitacao: 'Consulta médica', dataInicioAusencia: '2026-10-10T00:00:00', dataFimAusencia: '2026-10-10T00:00:00', statusSolicitacao: 0, dataSolicitacao: '2026-10-05T00:00:00' },
            { idSolicitacaoAusencia: 8, idUsuario: 2, mensagemSolicitacao: 'Mudança', dataInicioAusencia: '2026-09-01T00:00:00', dataFimAusencia: '2026-09-01T00:00:00', statusSolicitacao: 1, dataSolicitacao: '2026-08-20T00:00:00' },
          ],
        },
      });
      cy.intercept('PUT', '**/api/SolicitacaoAusencia/ResponderSolicitacao/*', { body: { sucesso: true, mensagem: null } }).as('responder');
      cy.visit('/dashboard/solicitacoes-ausencia');

      cy.contains('tr', 'Ana Souza').should('contain', 'Pendente').and('contain', 'Aprovar');
      cy.contains('tr', 'Bruno Lima').should('contain', 'Aprovada').and('not.contain', 'Reprovar');

      cy.contains('tr', 'Ana Souza').contains('button', 'Aprovar').click();
      cy.get('.fixed.inset-0').contains('button', 'Aprovar').click();
      cy.wait('@responder').its('request.url').should('include', 'ResponderSolicitacao/9').and('include', 'aprovar=true');
    });
  });
});
