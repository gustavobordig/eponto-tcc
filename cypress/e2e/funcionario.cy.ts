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

  it('bate o ponto gravando a próxima marcação do dia (antes tudo era Entrada)', () => {
    const hoje = new Date();
    const dia = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
    cy.intercept('GET', '**/api/RegistroPonto/ObterRegistrosUsuario*', {
      body: {
        sucesso: true,
        mensagem: null,
        registros: [{ idRegistro: 1, idUsuario: 1, dataRegistro: `${dia}T00:00:00`, horaRegistro: `${dia}T08:05:00`, idTipoRegistroPonto: 1 }],
      },
    });
    cy.intercept('POST', '**/api/RegistroPonto/Inserir', { body: { sucesso: true, mensagem: null } }).as('inserir');
    cy.visit('/home');

    // A home mostra a próxima marcação e o mesmo modal da barra
    cy.contains('button', 'Registrar início do almoço').click();
    cy.get('[role="dialog"]').contains('button', 'Registrar início do almoço').click();

    cy.wait('@inserir').its('request.body').should('deep.include', { idUsuario: 1, idTipoRegistroPonto: 2 });
  });

  it('mostra o saldo do banco de horas lido como TimeSpan', () => {
    cy.intercept('GET', '**/api/BancoHoras/Atual/1', {
      body: { sucesso: true, mensagem: null, saldosDiarios: null, bancoHoras: [{ idBancoHoras: 1, idUsuario: 1, horasTrabalhadas: '6.08:30:00', saldo: '03:45:00' }] },
    });
    cy.visit('/home');
    cy.contains('+3h45').should('be.visible'); // antes aparecia "45h"
    cy.contains('45h').should('not.exist');
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
    cy.contains('Informações contratuais').should('be.visible');
    cy.contains('dd', 'Analista').should('be.visible');
    cy.contains('Carga diária').next().should('have.text', '8h');
    cy.contains('Carga semanal').next().should('have.text', '40h');
    cy.contains('01/03/2024').should('be.visible');
    cy.get('@cargosAdmin.all').should('have.length', 0);
    cy.get('@jornadasAdmin.all').should('have.length', 0);
  });

  it('mostra o status das ausências como na API (0 em análise, 1 aprovada, 2 reprovada)', () => {
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

    // Lista única de pedidos (ausências, ajustes e férias); 0 aparece como "Em análise"
    cy.contains('li', 'Pedido 0').should('contain', 'Em análise');
    cy.contains('li', 'Pedido 1').should('contain', 'Aprovada');
    cy.contains('li', 'Pedido 2').should('contain', 'Reprovada');
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

  describe('Pedir feedback', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/api/Feedback/ListarSolicitacoesUsuario/1', { body: { sucesso: true, mensagem: null, solicitacoesFeedback: [] } });
      cy.intercept('POST', '**/api/Feedback/InserirSolicitacao', { body: { sucesso: true, mensagem: null } }).as('inserir');
      // Rota liberada para qualquer usuário: id, nome e chefe de cada pessoa
      cy.intercept('GET', '**/api/Usuario/Hierarquia', {
        body: {
          sucesso: true,
          mensagem: null,
          usuarios: [
            { idUsuario: 4, nome: 'Marcos Prado', idChefe: null },
            { idUsuario: 1, nome: 'Ana Souza', idChefe: 4 },
            { idUsuario: 7, nome: 'Júlia Ramos', idChefe: 4 },
          ],
        },
      });
      cy.visit('/feedback');
      cy.contains('button', 'Novo').click();
    });

    it('já vem com o gestor escolhido', () => {
      cy.get('[aria-haspopup="listbox"]').should('contain', 'Marcos Prado').and('contain', 'Seu gestor');
      cy.get('textarea').type('Queria um retorno sobre o último projeto.');
      cy.contains('button', 'Enviar Solicitação').click();

      cy.wait('@inserir').its('request.body').should('deep.include', {
        idUsuarioSolicitacao: 1,
        idResponsavelFeedback: 4,
      });
    });

    it('busca outra pessoa pelo nome, sem acento, e manda para ela', () => {
      cy.get('[aria-haspopup="listbox"]').click();
      cy.get('[role="listbox"]').should('not.contain', 'Ana Souza'); // não pede para si mesma
      cy.get('[role="combobox"]').type('julia');
      cy.get('[role="option"]').should('have.length', 1).and('contain', 'Júlia Ramos').click();
      cy.get('textarea').type('Pode me dar um retorno sobre a apresentação?');
      cy.contains('button', 'Enviar Solicitação').click();

      cy.wait('@inserir').its('request.body').should('deep.include', { idResponsavelFeedback: 7 });
    });
  });
});
