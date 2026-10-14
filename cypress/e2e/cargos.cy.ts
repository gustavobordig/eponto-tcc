describe('CRUD de Cargos', () => {
  // Função helper para gerar data formatada em português
  const getDataFormatada = () => {
    const agora = new Date();
    const dia = agora.getDate().toString().padStart(2, '0');
    const mes = (agora.getMonth() + 1).toString().padStart(2, '0');
    const hora = agora.getHours().toString().padStart(2, '0');
    const minuto = agora.getMinutes().toString().padStart(2, '0');
    return `${dia}-${mes} ${hora}:${minuto}`;
  };

  beforeEach(() => {
    cy.mockApi();
    cy.intercept('GET', '**/api/Cargo/Listar', { fixture: 'cargos.json' }).as('cargos');
    cy.loginAsAdmin();
    cy.visit('/dashboard/cargos');
  });

  describe('Criar Cargo - Validações', () => {
    beforeEach(() => {
      cy.visit('/adicionar-cargo');
    });

    it('deve mostrar erro ao tentar salvar sem nome do cargo', () => {
      cy.get('#formacaoMinima').type('Ensino Superior');
      cy.get('#salario').type('5000');
      cy.get('form').submit();
      
      // Verificar se o botão está desabilitado
      cy.contains('button', 'Cadastrar Cargo').should('be.disabled').and('have.class', 'cursor-not-allowed');
    });

    it('deve mostrar erro ao tentar salvar sem formação mínima', () => {
      const dataFormatada = getDataFormatada();
      cy.get('#nome').type(`Desenvolvedor ${dataFormatada}`);
      cy.get('#salario').type('5000');
      cy.get('form').submit();
      
      // Verificar se o botão está desabilitado
      cy.contains('button', 'Cadastrar Cargo').should('be.disabled').and('have.class', 'cursor-not-allowed');
    });

    it('deve mostrar erro ao tentar salvar sem salário', () => {
      const dataFormatada = getDataFormatada();
      cy.get('#nome').type(`Desenvolvedor ${dataFormatada}`);
      cy.get('#formacaoMinima').type('Ensino Superior');
      cy.get('form').submit();
      
      // Primeiro verificar se a mensagem de erro aparece
      cy.contains('O salário é obrigatório.').should('be.visible');
      // Depois verificar se o campo ficou com borda vermelha
      cy.get('#salario').should('have.class', 'border-red-500');
    });

    it('deve mostrar erro ao tentar salvar com nome muito pequeno', () => {
      cy.get('#nome').type('Ab');
      cy.get('#formacaoMinima').type('Ensino Superior');
      cy.get('#salario').type('5000');
      cy.get('form').submit();
      
      // Primeiro verificar se a mensagem de erro aparece
      cy.contains('O nome deve ter no mínimo 3 caracteres.').should('be.visible');
      // Depois verificar se o campo ficou com borda vermelha
      cy.get('#nome').should('have.class', 'border-red-500');
    });

    it('deve mostrar erro ao tentar salvar com formação mínima muito pequena', () => {
      const dataFormatada = getDataFormatada();
      cy.get('#nome').type(`Desenvolvedor ${dataFormatada}`);
      cy.get('#formacaoMinima').type('Ab').blur();
      // Primeiro verificar se a mensagem de erro aparece
      cy.contains('A formação mínima deve ter no mínimo 3 caracteres.').should('be.visible');
    });

    it('deve mostrar erro ao tentar salvar com nome muito longo', () => {
      const nomeLongo = 'A'.repeat(101);
      cy.get('#nome').type(nomeLongo).blur();
      cy.get('#formacaoMinima').type('Ensino Superior').blur();
      cy.get('#salario').type('5000').blur();
      
      // Primeiro verificar se a mensagem de erro aparece
      cy.contains('O nome deve ter no máximo 100 caracteres.').should('be.visible');
      // Depois verificar se o campo ficou com borda vermelha
      cy.get('#nome').should('have.class', 'border-red-500');
    });

    it('deve mostrar erro ao tentar salvar com formação mínima muito longa', () => {
      const formacaoLonga = 'A'.repeat(101);
      const dataFormatada = getDataFormatada();
      cy.get('#nome').type(`Desenvolvedor ${dataFormatada}`);
      cy.get('#formacaoMinima').type(formacaoLonga).blur();
      cy.contains('A formação mínima deve ter no máximo 100 caracteres.').should('be.visible');
    });

    it('deve mostrar erro ao tentar salvar com salário negativo', () => {
      const dataFormatada = getDataFormatada();
      cy.get('#nome').type(`Desenvolvedor ${dataFormatada}`);
      cy.get('#formacaoMinima').type('Ensino Superior').blur();
      cy.get('#salario').type('-1000').blur();
      
      // Primeiro verificar se a mensagem de erro aparece
      cy.contains('O salário deve ser um número positivo.').should('be.visible');
      // Depois verificar se o campo ficou com borda vermelha
      cy.get('#salario').should('have.class', 'border-red-500');
    });

    it('deve mostrar erro ao tentar salvar com salário zero', () => {
      const dataFormatada = getDataFormatada();
      cy.get('#nome').type(`Desenvolvedor ${dataFormatada}`);
      cy.get('#formacaoMinima').type('Ensino Superior').blur();
      cy.get('#salario').type('0').blur();
      
      // Primeiro verificar se a mensagem de erro aparece
      cy.contains('O salário deve ser um número positivo.').should('be.visible');
      // Depois verificar se o campo ficou com borda vermelha
      cy.get('#salario').should('have.class', 'border-red-500');
    });

    it('deve mostrar erro ao tentar salvar com salário muito pequeno', () => {
      const dataFormatada = getDataFormatada();
      cy.get('#nome').type(`Desenvolvedor ${dataFormatada}`);
      cy.get('#formacaoMinima').type('Ensino Superior').blur();
      cy.get('#salario').type('500').blur();
      
      // Primeiro verificar se a mensagem de erro aparece
      cy.contains('O salário deve ser no mínimo R$ 1.000,00.').should('be.visible');
      // Depois verificar se o campo ficou com borda vermelha
      cy.get('#salario').should('have.class', 'border-red-500');
    });


    it('deve mostrar erro ao tentar salvar com nome apenas com espaços', () => {
      cy.get('#nome').type('   ').blur();
      cy.get('#formacaoMinima').type('Ensino Superior').blur();
      cy.get('#salario').type('5000').blur();
      
      cy.contains('O nome do cargo é obrigatório.').should('be.visible');
      cy.get('#nome').should('have.class', 'border-red-500');
    });

    it('deve mostrar erro ao tentar salvar com formação mínima apenas com espaços', () => {
      const dataFormatada = getDataFormatada();
      cy.get('#nome').type(`Desenvolvedor ${dataFormatada}`);
      cy.get('#formacaoMinima').type('   ').blur();
      cy.contains('A formação mínima é obrigatória.').should('be.visible');
    });

    it('deve mostrar erro ao tentar salvar com salário vazio após digitação', () => {
      const dataFormatada = getDataFormatada();
      cy.get('#nome').type(`Desenvolvedor ${dataFormatada}`);
      cy.get('#formacaoMinima').type('Ensino Superior').blur();
      cy.get('#salario').type('1000').blur();
      // Limpar o campo de salário
      cy.get('#salario').clear();
      cy.get('form').submit();
      
      cy.contains('O salário é obrigatório.').should('be.visible');
      cy.get('#salario').should('have.class', 'border-red-500');
    });

    it('deve verificar comportamento do campo de salário com entrada inválida', () => {
      const dataFormatada = getDataFormatada();
      cy.get('#nome').type(`Desenvolvedor ${dataFormatada}`);
      cy.get('#formacaoMinima').type('Ensino Superior').blur();
      
      // Tentar digitar caracteres não numéricos no campo de salário
      // Como é um campo number, o navegador pode não permitir
      cy.get('#salario').type('abc').blur();
      
      // Verificar se o campo ficou vazio (comportamento esperado para campo number)
      cy.get('#salario').should('have.value', '');
      
      // Tentar submeter o formulário
      cy.get('form').submit();
      
      // Deve mostrar erro de salário obrigatório
      cy.contains('O salário é obrigatório.').should('be.visible');
      cy.get('#salario').should('have.class', 'border-red-500');
    });

    
    it('deve mostrar erro ao tentar salvar com salário no limite mínimo', () => {
      const dataFormatada = getDataFormatada();
      cy.get('#nome').type(`Desenvolvedor ${dataFormatada}`);
      cy.get('#formacaoMinima').type('Ensino Superior').blur();
      cy.get('#salario').type('999').blur();
      
      // Primeiro verificar se a mensagem de erro aparece
      cy.contains('O salário deve ser no mínimo R$ 1.000,00.').should('be.visible');
      // Depois verificar se o campo ficou com borda vermelha
      cy.get('#salario').should('have.class', 'border-red-500');
    });

    it('deve aceitar salário no valor mínimo exato', () => {
      const dataFormatada = getDataFormatada();
      cy.get('#nome').type(`Desenvolvedor ${dataFormatada}`).blur();
      cy.get('#formacaoMinima').type('Ensino Superior').blur();
      cy.get('#salario').type('1000').blur();
      cy.get('form').submit();
      
      // Deve aceitar o valor mínimo
      cy.url({ timeout: 10000 }).should('include', '/dashboard/cargos');
    });

    it('deve testar todas as validações de salário', () => {
      const dataFormatada = getDataFormatada();
      cy.get('#nome').type(`Desenvolvedor dois ${dataFormatada}`);
      cy.get('#formacaoMinima').type('Ensino Superior');
      
      // Teste 1: Salário vazio
      cy.get('form').submit();
      cy.contains('O salário é obrigatório.').should('be.visible');
      cy.get('#salario').should('have.class', 'border-red-500');
      
      // Teste 2: Salário zero
      cy.get('#salario').type('0').blur();
      cy.get('form').submit();
      cy.contains('O salário deve ser um número positivo.').should('be.visible');
      cy.get('#salario').should('have.class', 'border-red-500');
      
      // Teste 3: Salário negativo
      cy.get('#salario').clear().type('-100').blur();
      cy.get('form').submit();
      cy.contains('O salário deve ser um número positivo.').should('be.visible');
      cy.get('#salario').should('have.class', 'border-red-500');
      
      // Teste 4: Salário muito pequeno
      cy.get('#salario').clear().type('500').blur();
      cy.get('form').submit();
      cy.contains('O salário deve ser no mínimo R$ 1.000,00.').should('be.visible');
      cy.get('#salario').should('have.class', 'border-red-500');
      
      // Teste 5: Salário válido
      cy.get('#salario').clear().type('1500').blur();
      cy.get('form').submit();
      cy.url({ timeout: 10000 }).should('include', '/dashboard/cargos');
    });
  });

  describe('Editar Cargo - Validações', () => {
    beforeEach(() => {
      cy.visit('/dashboard/cargos');
    });

    it('deve abrir o modal de edição ao clicar no botão editar', () => {
      // Aguardar a tabela carregar
      cy.get('table').should('be.visible');
      
      // Clicar no primeiro botão de editar
      cy.get('button').contains('Editar').first().click();
      
      // Verificar se o modal abriu
      cy.get('.fixed.inset-0').should('be.visible');
      cy.contains('Editar Cargo').should('be.visible');
    });

    it('deve mostrar erro ao tentar salvar sem nome do cargo', () => {
      // Abrir modal de edição
      cy.get('button').contains('Editar').first().click();
      cy.get('.fixed.inset-0').should('be.visible');
      
      // Limpar o campo nome
      cy.get('.fixed.inset-0 input').first().clear().blur();
      
      // Verificar se a mensagem de erro aparece
      cy.contains('O nome do cargo é obrigatório.').should('be.visible');
    });

    it('deve mostrar erro ao tentar salvar com nome muito pequeno', () => {
      // Abrir modal de edição
      cy.get('button').contains('Editar').first().click();
      cy.get('.fixed.inset-0').should('be.visible');
      
      // Digitar nome com menos de 3 caracteres
      cy.get('.fixed.inset-0 input').first().clear().type('Ab').blur();
      
      // Verificar se a mensagem de erro aparece
      cy.contains('O nome deve ter no mínimo 3 caracteres.').should('be.visible');
    });

    it('deve mostrar erro ao tentar salvar com nome muito longo', () => {
      // Abrir modal de edição
      cy.get('button').contains('Editar').first().click();
      cy.get('.fixed.inset-0').should('be.visible');
      
      const nomeLongo = 'A'.repeat(101);
      cy.get('.fixed.inset-0 input').first().clear().type(nomeLongo).blur();
      
      // Verificar se a mensagem de erro aparece
      cy.contains('O nome deve ter no máximo 100 caracteres.').should('be.visible');
    });

    it('deve mostrar erro ao tentar salvar com nome apenas com espaços', () => {
      // Abrir modal de edição
      cy.get('button').contains('Editar').first().click();
      cy.get('.fixed.inset-0').should('be.visible');
      
      cy.get('.fixed.inset-0 input').first().clear().type('   ').blur();
      
      cy.contains('O nome do cargo é obrigatório.').should('be.visible');
    });

    it('deve mostrar erro ao tentar salvar sem salário', () => {
      // Abrir modal de edição
      cy.get('button').contains('Editar').first().click();
      cy.get('.fixed.inset-0').should('be.visible');
      
      // Limpar o campo salário (segundo input)
      cy.get('.fixed.inset-0 input[type="number"]').clear().blur();
      
      // Verificar se a mensagem de erro aparece
      cy.contains('O salário é obrigatório.').should('be.visible');
    });

    it('deve mostrar erro ao tentar salvar com salário negativo', () => {
      // Abrir modal de edição
      cy.get('button').contains('Editar').first().click();
      cy.get('.fixed.inset-0').should('be.visible');
      
      cy.get('.fixed.inset-0 input[type="number"]').clear().type('-1000').blur();
      
      // Verificar se a mensagem de erro aparece
      cy.contains('O salário deve ser um número positivo.').should('be.visible');
    });

    it('deve mostrar erro ao tentar salvar com salário zero', () => {
      // Abrir modal de edição
      cy.get('button').contains('Editar').first().click();
      cy.get('.fixed.inset-0').should('be.visible');
      
      cy.get('.fixed.inset-0 input[type="number"]').clear().type('0').blur();
      
      // Verificar se a mensagem de erro aparece
      cy.contains('O salário deve ser um número positivo.').should('be.visible');
    });

    it('deve mostrar erro ao tentar salvar com salário muito pequeno', () => {
      // Abrir modal de edição
      cy.get('button').contains('Editar').first().click();
      cy.get('.fixed.inset-0').should('be.visible');
      
      cy.get('.fixed.inset-0 input[type="number"]').clear().type('500').blur();
      
      // Verificar se a mensagem de erro aparece
      cy.contains('O salário deve ser no mínimo R$ 1.000,00.').should('be.visible');
    });

    it('deve mostrar erro ao tentar salvar sem formação mínima', () => {
      // Abrir modal de edição
      cy.get('button').contains('Editar').first().click();
      cy.get('.fixed.inset-0').should('be.visible');
      
      // Limpar o campo formação mínima (terceiro input)
      cy.get('.fixed.inset-0 input').eq(2).clear().blur();
      
      // Verificar se a mensagem de erro aparece
      cy.contains('A formação mínima é obrigatória.').should('be.visible');
    });

    it('deve mostrar erro ao tentar salvar com formação mínima muito pequena', () => {
      // Abrir modal de edição
      cy.get('button').contains('Editar').first().click();
      cy.get('.fixed.inset-0').should('be.visible');
      
      cy.get('.fixed.inset-0 input').eq(2).clear().type('Ab').blur();
      
      // Verificar se a mensagem de erro aparece
      cy.contains('A formação mínima deve ter no mínimo 3 caracteres.').should('be.visible');
    });

    it('deve mostrar erro ao tentar salvar com formação mínima muito longa', () => {
      // Abrir modal de edição
      cy.get('button').contains('Editar').first().click();
      cy.get('.fixed.inset-0').should('be.visible');
      
      const formacaoLonga = 'A'.repeat(101);
      cy.get('.fixed.inset-0 input').eq(2).clear().type(formacaoLonga).blur();
      
      // Verificar se a mensagem de erro aparece
      cy.contains('A formação mínima deve ter no máximo 100 caracteres.').should('be.visible');
    });

    it('deve aceitar dados válidos e permitir salvar', () => {
      // Abrir modal de edição
      cy.get('button').contains('Editar').first().click();
      cy.get('.fixed.inset-0').should('be.visible');
      
      // Preencher todos os campos com valores válidos
      cy.get('.fixed.inset-0 input').first().clear().type('Desenvolvedor Senior').blur();
      cy.get('.fixed.inset-0 input[type="number"]').clear().type('5000').blur();
      cy.get('.fixed.inset-0 input').eq(2).clear().type('Ensino Superior Completo').blur();
      
      // Não deve mostrar mensagens de erro
      cy.contains('O nome do cargo é obrigatório.').should('not.exist');
      cy.contains('O salário é obrigatório.').should('not.exist');
      cy.contains('A formação mínima é obrigatória.').should('not.exist');
      
      // Campos não devem ter borda vermelha
      cy.get('.fixed.inset-0 input').first().should('not.have.class', 'border-danger');
      cy.get('.fixed.inset-0 input[type="number"]').should('not.have.class', 'border-danger');
      cy.get('.fixed.inset-0 input').eq(2).should('not.have.class', 'border-danger');
      
      // Botão salvar deve estar habilitado
      cy.get('button').contains('Salvar').should('not.be.disabled');
    });

    it('deve fechar o modal ao clicar em cancelar', () => {
      // Abrir modal de edição
      cy.get('button').contains('Editar').first().click();
      cy.get('.fixed.inset-0').should('be.visible');
      
      // Clicar em cancelar
      cy.get('button').contains('Cancelar').click();
      
      // Modal deve fechar
      cy.get('.fixed.inset-0').should('not.exist');
    });

    it('deve fechar o modal ao clicar no X', () => {
      // Abrir modal de edição
      cy.get('button').contains('Editar').first().click();
      cy.get('.fixed.inset-0').should('be.visible');
      
      // Clicar no X do modal
      cy.get('.fixed.inset-0 button[aria-label="Fechar"]').click();
      
      // Modal deve fechar
      cy.get('.fixed.inset-0').should('not.exist');
    });

    it('deve testar múltiplas validações simultaneamente', () => {
      // Abrir modal de edição
      cy.get('button').contains('Editar').first().click();
      cy.get('.fixed.inset-0').should('be.visible');
      
      // Preencher todos os campos com valores inválidos
      cy.get('.fixed.inset-0 input').first().clear().type('Ab').blur();
      cy.get('.fixed.inset-0 input[type="number"]').clear().type('-100').blur();
      cy.get('.fixed.inset-0 input').eq(2).clear().type('Ab').blur();
      
      // Verificar se todas as mensagens de erro aparecem
      cy.contains('O nome deve ter no mínimo 3 caracteres.').should('be.visible');
      cy.contains('O salário deve ser um número positivo.').should('be.visible');
      cy.contains('A formação mínima deve ter no mínimo 3 caracteres.').should('be.visible');
      
      // Verificar se todos os campos ficaram com borda vermelha
      cy.get('.fixed.inset-0 input').first().should('have.class', 'border-danger');
      cy.get('.fixed.inset-0 input[type="number"]').should('have.class', 'border-danger');
      cy.get('.fixed.inset-0 input').eq(2).should('have.class', 'border-danger');
    });
  });

  describe('CRUD de Cargos - Chamadas à API', () => {
    it('não abre o modal de edição sozinho ao carregar a lista', () => {
      cy.wait('@cargos');
      cy.get('table tbody tr').should('have.length', 2);
      cy.contains('Editar Cargo').should('not.exist');
    });

    it('envia o novo cargo para a API e volta para a lista', () => {
      cy.intercept('POST', '**/api/Cargo/Inserir', { body: { sucesso: true, mensagem: null } }).as('inserir');
      cy.visit('/adicionar-cargo');
      cy.get('#nome').type('Desenvolvedor Pleno');
      cy.get('#formacaoMinima').type('Ensino Superior');
      cy.get('#salario').type('6500');
      cy.get('form').submit();

      cy.wait('@inserir').its('request.body').should('deep.include', {
        idCargo: 0,
        nomeCargo: 'Desenvolvedor Pleno',
        formacaoMinima: 'Ensino Superior',
        indAtivo: 1,
      });
      cy.location('pathname').should('eq', '/dashboard/cargos');
      cy.contains('Cargo cadastrado com sucesso!').should('be.visible');
    });

    it('envia a edição para a API', () => {
      cy.intercept('PUT', '**/api/Cargo/Atualizar/*', { body: { sucesso: true, mensagem: null } }).as('atualizar');
      cy.get('table tbody tr').contains('Gerente').parents('tr').within(() => {
        cy.contains('Editar').click();
      });
      cy.get('.fixed.inset-0 input').first().clear().type('Gerente de Projetos').blur();
      cy.contains('button', 'Salvar').click();

      cy.wait('@atualizar').then(({ request }) => {
        expect(request.url).to.match(/Atualizar\/2$/);
        expect(request.body).to.deep.include({ idCargo: 2, nomeCargo: 'Gerente de Projetos' });
      });
      cy.contains('Editar Cargo').should('not.exist');
    });

    it('exclui pelo id do cargo', () => {
      cy.intercept('PUT', '**/api/Cargo/Deletar/*', { body: { sucesso: true, mensagem: null } }).as('deletar');
      cy.get('table tbody tr').contains('Analista').parents('tr').within(() => {
        // O botão é só o ícone da lixeira, com o rótulo acessível "Excluir"
        cy.get('button[aria-label="Excluir"]').click();
      });
      cy.contains('Confirmar exclusão').should('be.visible');
      cy.get('.fixed.inset-0 button').contains('Excluir').click();

      cy.wait('@deletar').its('request.url').should('match', /Deletar\/1$/);
    });
  });
});
