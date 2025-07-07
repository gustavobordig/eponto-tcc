# Instruções para Execução dos Testes E2E

## Pré-requisitos

1. **Servidor rodando**: Certifique-se de que o servidor Next.js está rodando em `http://localhost:3000`
2. **Credenciais configuradas**: Configure as credenciais de login no arquivo `cypress/support/commands.ts`
3. **Cypress instalado**: Execute `npm install cypress` se ainda não tiver instalado

## Configuração das Credenciais

No arquivo `cypress/support/commands.ts`, atualize as credenciais de login:

```typescript
cy.get('input[type="text"], input[type="email"]').first().type('SEU_EMAIL_AQUI');
cy.get('input[type="password"]').first().type('SUA_SENHA_AQUI');
```

## Executando os Testes

### 1. Teste de Autenticação Administrativa
```bash
npx cypress run --spec "cypress/e2e/admin-auth.cy.ts"
```

### 2. Teste de Login
```bash
npx cypress run --spec "cypress/e2e/login.cy.ts"
```

### 3. Teste de CRUD de Cargos
```bash
npx cypress run --spec "cypress/e2e/cargos.cy.ts"
```

### Executar Todos os Testes
```bash
npx cypress run
```

## Estrutura dos Testes de Cargos

### Campos Testados
- **Nome do Cargo**: Validações de obrigatoriedade, tamanho mínimo (3 caracteres) e máximo (100 caracteres)
- **Formação Mínima**: Validações de obrigatoriedade, tamanho mínimo (3 caracteres) e máximo (100 caracteres)
- **Salário**: Validações de obrigatoriedade, valor positivo, valor mínimo (R$ 1.000,00)

### Cenários de Teste

#### Validações de Criação
- Nome vazio
- Formação mínima vazia
- Salário vazio
- Nome muito pequeno (< 3 caracteres)
- Formação mínima muito pequena (< 3 caracteres)
- Nome muito longo (> 100 caracteres)
- Formação mínima muito longa (> 100 caracteres)
- Salário negativo
- Salário zero
- Salário muito pequeno (< R$ 1.000,00)
- Nome apenas com espaços
- Formação mínima apenas com espaços

#### Criação com Sucesso
- Cargo com dados válidos
- Cargo com salário decimal
- Cargo com formação mínima específica

#### Listagem
- Verificar se cargos criados aparecem na lista
- Verificar formatação de salário

#### Edição
- Editar nome do cargo
- Editar formação mínima
- Editar salário
- Cancelar edição

#### Exclusão
- Excluir cargo com confirmação
- Cancelar exclusão

## Comandos Personalizados

### `cy.createTestCargo(nome, salario, formacaoMinima?)`
Cria um cargo de teste com os dados fornecidos.

**Parâmetros:**
- `nome`: Nome do cargo
- `salario`: Salário do cargo
- `formacaoMinima`: Formação mínima (opcional, padrão: "Ensino Superior")

**Exemplo:**
```typescript
cy.createTestCargo('Desenvolvedor', '5000', 'Ensino Superior');
```

### `cy.deleteCargoByName(nome)`
Exclui um cargo pelo nome.

**Parâmetros:**
- `nome`: Nome do cargo a ser excluído

**Exemplo:**
```typescript
cy.deleteCargoByName('Desenvolvedor Teste');
```

### `cy.ensureAdminAuth()`
Verifica se é necessário fazer autenticação administrativa e, se sim, executa automaticamente.

## Modo Interativo

Para executar os testes de forma interativa (recomendado para debug):

```bash
npx cypress open
```

Isso abrirá a interface gráfica do Cypress onde você pode:
- Ver os testes em tempo real
- Pausar a execução
- Inspecionar elementos
- Debugar problemas

## Troubleshooting

### Problemas Comuns

1. **Elemento não encontrado**: Verifique se os seletores estão corretos
2. **Timeout**: Aumente o timeout no `cypress.config.ts` se necessário
3. **Autenticação falha**: Verifique as credenciais no `commands.ts`
4. **Servidor não responde**: Certifique-se de que o servidor está rodando

### Desacelerar Testes

Para facilitar o debug, você pode desacelerar os testes:

1. **No modo interativo**: Use `cy.pause()` nos testes
2. **Configuração global**: Ajuste `defaultCommandTimeout` no `cypress.config.ts`
3. **Comando específico**: Use `cy.wait(1000)` para pausas específicas

## Estrutura de Arquivos

```
cypress/
├── e2e/
│   ├── admin-auth.cy.ts    # Testes de autenticação administrativa
│   ├── login.cy.ts         # Testes de login
│   └── cargos.cy.ts        # Testes de CRUD de cargos
├── support/
│   ├── commands.ts         # Comandos personalizados
│   └── index.d.ts          # Declarações de tipos
└── cypress.config.ts       # Configuração do Cypress
``` 