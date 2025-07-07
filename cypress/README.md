# Testes E2E - Cypress

Este diretório contém os testes end-to-end do projeto usando Cypress.

## Estrutura

```
cypress/
├── e2e/
│   └── cargos.cy.ts          # Testes do CRUD de cargos
├── support/
│   ├── commands.ts           # Comandos personalizados
│   ├── e2e.ts               # Configurações globais
│   └── index.d.ts           # Declarações de tipos
├── fixtures/
│   └── example.json         # Dados de exemplo
└── README.md                # Esta documentação
```

## Testes Implementados

### CRUD de Cargos (`cargos.cy.ts`)

#### Validações de Criação
- ✅ Teste sem nome do cargo
- ✅ Teste sem salário
- ✅ Teste com nome muito pequeno (< 3 caracteres)
- ✅ Teste com nome muito longo (> 100 caracteres)
- ✅ Teste com salário negativo
- ✅ Teste com salário zero
- ✅ Teste com salário inválido (texto)
- ✅ Teste com nome apenas espaços

#### Criação com Sucesso
- ✅ Criação com dados válidos (incluindo timestamp no nome)
- ✅ Criação com salário decimal

#### Listagem
- ✅ Verificação da estrutura da tabela
- ✅ Verificação da presença de cargos criados
- ✅ Verificação dos botões de ação

#### Edição
- ✅ Abertura do modal de edição
- ✅ Edição com dados válidos
- ✅ Cancelamento da edição
- ✅ Edição do salário

#### Exclusão
- ✅ Abertura do modal de confirmação
- ✅ Cancelamento da exclusão
- ✅ Confirmação da exclusão

#### Fluxo Completo
- ✅ Teste completo: criar → listar → editar → excluir

## Comandos Personalizados

### `cy.loginAsAdmin()`
Faz login como administrador. **IMPORTANTE**: Você precisa configurar as credenciais corretas no arquivo `commands.ts`.

### `cy.createTestCargo(nome, salario)`
Cria um cargo de teste com os dados fornecidos.

### `cy.deleteCargoByName(nome)`
Deleta um cargo pelo nome.

## Como Executar os Testes

### Pré-requisitos
1. Certifique-se de que o servidor está rodando em `http://localhost:3000`
2. Configure as credenciais de admin no arquivo `cypress/support/commands.ts`

### Executar todos os testes
```bash
npm run cypress:run
```

### Executar testes em modo interativo
```bash
npm run cypress:open
```

### Executar um arquivo específico
```bash
npx cypress run --spec "cypress/e2e/cargos.cy.ts"
```

## Configurações

As configurações do Cypress estão no arquivo `cypress.config.ts`:

- **baseUrl**: `http://localhost:3000`
- **viewport**: 1280x720
- **timeouts**: Configurados para aplicações web modernas
- **retries**: 2 tentativas em modo de execução

## Dicas para Desenvolvimento

1. **Credenciais de Login**: Atualize o comando `loginAsAdmin()` com as credenciais corretas do seu sistema.

2. **Seletores**: Os testes usam IDs e classes CSS. Se você alterar a estrutura HTML, atualize os seletores nos testes.

3. **Dados de Teste**: Os testes criam cargos com timestamps para evitar conflitos. Isso facilita a depuração.

4. **Modais**: Os testes assumem que os modais têm o atributo `role="dialog"`. Se não tiver, atualize os seletores.

5. **Toasts**: Os testes verificam mensagens de sucesso/erro. Certifique-se de que as mensagens estão corretas.

## Próximos Passos

Para expandir os testes, considere:

1. **Testes de API**: Criar testes para as chamadas de API diretamente
2. **Testes de Performance**: Adicionar testes de performance
3. **Testes de Acessibilidade**: Verificar acessibilidade com axe-core
4. **Testes de Responsividade**: Testar em diferentes tamanhos de tela
5. **Testes de Integração**: Testar integração com outros módulos

## Troubleshooting

### Problemas Comuns

1. **Elemento não encontrado**: Verifique se o seletor está correto e se o elemento está visível
2. **Timeout**: Aumente os timeouts se necessário
3. **Login falha**: Verifique as credenciais no comando `loginAsAdmin()`
4. **Dados não persistem**: Verifique se o banco de dados está configurado corretamente

### Logs e Debug

Para debug, use:
```javascript
cy.log('Mensagem de debug');
cy.pause(); // Pausa o teste para inspeção manual
``` 