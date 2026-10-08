# Validações do Formulário de Adicionar Usuário

## Visão Geral

Este documento descreve as validações implementadas no formulário de adicionar usuário para garantir a qualidade e integridade dos dados cadastrados.

## Validações Implementadas

### 1. Validação de Nome
- **Obrigatório**: Sim
- **Comprimento mínimo**: 2 caracteres
- **Comprimento máximo**: 100 caracteres
- **Caracteres permitidos**: Letras, espaços, hífens e apóstrofos
- **Regex**: `/^[a-zA-ZÀ-ÿ\s'-]+$/`

### 2. Validação de E-mail
- **Obrigatório**: Sim
- **Formato**: Deve seguir padrão de e-mail válido
- **Regex**: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

### 3. Validação de Data de Nascimento
- **Obrigatório**: Sim
- **Idade mínima**: 18 anos
- **Idade máxima**: 100 anos
- **Restrições**: 
  - Não pode ser data futura
  - Cálculo preciso considerando mês e dia do aniversário

### 4. Validação de Telefone
- **Obrigatório**: Não (opcional)
- **Formato**: Telefone brasileiro
- **Comprimento**: 10 ou 11 dígitos (com DDD)
- **DDD válido**: Entre 11 e 99
- **Limpeza automática**: Remove caracteres não numéricos

### 5. Validação de Senha Forte
- **Obrigatório**: Sim
- **Comprimento mínimo**: 8 caracteres
- **Requisitos**:
  - Pelo menos uma letra minúscula
  - Pelo menos uma letra maiúscula
  - Pelo menos um número
  - Pelo menos um caractere especial (@$!%*?&)
- **Regex**: `/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/`

### 6. Validação de Cargo
- **Obrigatório**: Sim
- **Validação**: Deve selecionar um cargo da lista

### 7. Validação de Jornada de Trabalho
- **Obrigatório**: Sim
- **Validação**: Deve selecionar uma jornada da lista

## Funcionalidades de UX

### 1. Validação em Tempo Real
- As validações são executadas conforme o usuário digita
- Feedback visual imediato com cores (verde/vermelho)
- Mensagens de erro específicas para cada campo

### 2. Indicadores Visuais
- **Bordas verdes**: Campo válido
- **Bordas vermelhas**: Campo inválido
- **Bordas cinzas**: Campo não validado ainda
- **Ícones**: ✓ para válido, ⚠ para inválido

### 3. Checklist de Senha
- Lista visual dos requisitos da senha
- Marcação em tempo real do que já foi atendido
- Cores dinâmicas (cinza → verde)

### 4. Botão de Envio Inteligente
- Desabilitado até que todos os campos obrigatórios estejam válidos
- Habilita automaticamente quando todas as validações passam

## Arquivos Criados/Modificados

### Novos Arquivos
- `utils/userValidations.ts` - Lógica de validação centralizada
- `app/components/atoms/ValidationMessage/index.tsx` - Componente de mensagem de validação

### Arquivos Modificados
- `app/(pages)/(authenticatedAdmin)/adicionar-usuario/page.tsx` - Formulário com validações
- `utils/regexPatterns.ts` - Padrões regex atualizados

## Como Usar

1. **Importar validações**:
```typescript
import { userValidations, ValidationResult } from '@/utils/userValidations';
```

2. **Validar campo específico**:
```typescript
const validation = userValidations.validatePassword(password);
if (!validation.isValid) {
  console.log(validation.message);
}
```

3. **Validar formulário completo**:
```typescript
const validations = userValidations.validateForm(data, cargo, jornada);
const hasErrors = validations.some(v => !v.isValid);
```

## Benefícios

1. **Segurança**: Senhas fortes e validação rigorosa
2. **Qualidade dos dados**: Dados consistentes e válidos
3. **Experiência do usuário**: Feedback imediato e claro
4. **Manutenibilidade**: Código organizado e reutilizável
5. **Acessibilidade**: Mensagens claras e indicadores visuais

## Próximas Melhorias Sugeridas

1. **Validação de e-mail único**: Verificar no backend se o e-mail já existe
2. **Máscara de telefone**: Formatação automática (XX) XXXXX-XXXX
3. **Validação de CPF**: Adicionar validação de CPF se necessário
4. **Testes unitários**: Criar testes para as funções de validação
5. **Internacionalização**: Suporte a múltiplos idiomas 