// Área do funcionário com a API simulada, usando só rotas liberadas para quem não é admin
describe('Área do funcionário', () => {
  beforeEach(() => {
    cy.mockApi();
    // As listas de cargos e jornadas são só de admin na API: aqui respondem 403
    cy.intercept('GET', '**/api/Cargo/Listar', { statusCode: 403, body: { sucesso: false } }).as('cargosAdmin');
    cy.intercept('GET', '**/api/JornadaTrabalho/Listar', { statusCode: 403, body: { sucesso: false } }).as('jornadasAdmin');
    cy.intercept('GET', '**/api/Usuario/1', {
      body: {
        sucesso: true,
        mensagem: null,
        usuarios: null,
        usuario: {
          idUsuario: 1, nome: 'Ana Souza', email: 'ana@exemplo.com', telefone: 11999990000, idCargo: 1, idJornada: 2,
          indAtivo: 1, dataNascimento: '1990-05-10T00:00:00', senha: '', idChefe: 4,
        },
      },
    });
    cy.loginAs('funcionario');
  });

  it('mostra o contrato pela rota do próprio usuário, sem chamar rotas de admin', () => {
    cy.intercept('GET', '**/api/Usuario/Contrato/1', {
      body: {
        sucesso: true,
        mensagem: null,
        contrato: {
          idUsuario: 1, nome: 'Ana Souza', indAtivo: 1, dataCadastro: '2024-03-01T00:00:00', dataNascimento: '1990-05-10T00:00:00',
          email: 'ana@exemplo.com', telefone: 11999990000, nomeCargo: 'Analista', salario: 5000, qtdHorasDiarias: 8,
        },
      },
    }).as('contrato');
    cy.visit('/perfil');

    cy.wait('@contrato');
    cy.contains('Informações Contratuais').should('be.visible');
    cy.contains('Analista').should('be.visible');
    cy.contains('8h/dia').should('be.visible');
    cy.contains('40h/semana').should('be.visible');
    cy.contains('01/03/2024').should('be.visible');
    cy.get('@cargosAdmin.all').should('have.length', 0);
    cy.get('@jornadasAdmin.all').should('have.length', 0);
  });

  it('mostra o status das ausências como na API (0 pendente, 1 aprovada, 2 reprovada)', () => {
    cy.intercept('GET', '**/api/SolicitacaoAusencia/ListarSolicitacoesAusenciaUsuario/1', {
      body: {
        sucesso: true,
        mensagem: null,
        solicitacoes: [0, 1, 2].map((status) => ({
          idSolicitacaoAusencia: status + 1, idUsuario: 1, mensagemSolicitacao: `Pedido ${status}`,
          dataInicioAusencia: '2026-10-10T00:00:00', dataFimAusencia: '2026-10-10T00:00:00',
          statusSolicitacao: status, dataSolicitacao: '2026-10-05T00:00:00',
        })),
      },
    });
    cy.visit('/minhas-solicitacoes');

    cy.get('tbody tr').eq(0).should('contain', 'Pendente');
    cy.get('tbody tr').eq(1).should('contain', 'Aprovada');
    cy.get('tbody tr').eq(2).should('contain', 'Reprovada');
  });

  it('vê a resposta do feedback pela rota dos próprios feedbacks', () => {
    cy.intercept('GET', '**/api/Feedback/ListarSolicitacoesUsuario/1', {
      body: {
        sucesso: true,
        mensagem: null,
        solicitacoesFeedback: [
          {
            idSolicitacaoFeedback: 7, idUsuarioSolicitacao: 1, nomeUsuarioSolicitacao: 'Ana Souza', idResponsavelFeedback: 4,
            nomeResponsavelFeedback: 'Bruno Lima', status: 1, dataSolicitacao: '2026-09-30T10:00:00', mensagemSolicitacao: 'Quero um retorno do trimestre.',
          },
        ],
      },
    });
    cy.intercept('GET', '**/api/Feedback/ListarFeedbacksUsuario/1', {
      body: {
        sucesso: true,
        mensagem: null,
        feedbacks: [
          { idFeedback: 3, idUsuarioFeedback: 1, idAutorFeedback: 4, idSolicitacaoFeedback: 7, dataRealizacao: '2026-10-01T14:00:00', mensagemFeedback: 'Ótimo trimestre.', avaliacao: 3 },
        ],
      },
    }).as('meusFeedbacks');
    // A listagem geral é só para admin
    cy.intercept('GET', '**/api/Feedback/ListarFeedback', { statusCode: 403, body: { sucesso: false } }).as('todos');
    cy.visit('/feedback');

    cy.contains('Quero um retorno do trimestre.').click();
    cy.wait('@meusFeedbacks');
    cy.contains('Ótimo trimestre.').should('be.visible');
    cy.contains('(4)').should('be.visible'); // avaliação 3 na API = 4 estrelas
    cy.get('@todos.all').should('have.length', 0);
  });

  it('manda o pedido de feedback para o chefe do usuário', () => {
    cy.intercept('GET', '**/api/Feedback/ListarSolicitacoesUsuario/1', { body: { sucesso: true, mensagem: null, solicitacoesFeedback: [] } });
    cy.intercept('POST', '**/api/Feedback/InserirSolicitacao', { body: { sucesso: true, mensagem: null } }).as('inserir');
    cy.visit('/feedback');

    cy.contains('button', 'Nova Solicitação').first().click();
    cy.get('textarea').type('Queria um retorno sobre o último projeto.');
    cy.contains('button', 'Enviar Solicitação').click();

    cy.wait('@inserir').its('request.body').should('deep.include', {
      idUsuarioSolicitacao: 1,
      idResponsavelFeedback: 4,
    });
  });
});
