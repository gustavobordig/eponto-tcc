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
    // Comentando o login automático para testar primeiro sem problemas de autenticação
    // cy.loginAsAdmin();
    
    // Por enquanto, vamos assumir que já está logado e ir direto para a página
    // Você pode descomentar a linha acima quando configurar o login corretamente
    cy.visit('/dashboard/cargos');
  });

  describe('Criar Cargo - Validações', () => {
    beforeEach(() => {
      cy.visit('/adicionar-cargo');
      // Verificar se precisa fazer autenticação administrativa
      cy.ensureAdminAuth();
    });

    it('deve mostrar erro ao tentar salvar sem nome do cargo', () => {
      cy.get('#formacaoMinima').type('Ensino Superior');
      cy.get('#salario').type('5000');
      cy.get('form').submit();
      
      // Verificar se o botão está desabilitado
      cy.get('button').should('have.class', 'bg-gray-300 text-gray-500 cursor-not-allowed');
    });

    it('deve mostrar erro ao tentar salvar sem formação mínima', () => {
      const dataFormatada = getDataFormatada();
      cy.get('#nome').type(`Desenvolvedor ${dataFormatada}`);
      cy.get('#salario').type('5000');
      cy.get('form').submit();
      
      // Verificar se o botão está desabilitado
      cy.get('button').should('have.class', 'bg-gray-300 text-gray-500 cursor-not-allowed');
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
}); 