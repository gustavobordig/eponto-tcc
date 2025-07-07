import { ValidationResult } from "./userValidations";

export const cargoValidations = {
  // Validação de nome do cargo
  validateNomeCargo: (nome: string): ValidationResult => {
    if (!nome || nome.trim().length === 0) {
      return { isValid: false, message: 'O nome do cargo é obrigatório.' };
    }
    if (nome.length < 3) {
      return { isValid: false, message: 'O nome deve ter no mínimo 3 caracteres.' };
    }
    if (nome.length > 100) {
      return { isValid: false, message: 'O nome deve ter no máximo 100 caracteres.' };
    }
    return { isValid: true, message: 'Nome do cargo válido.' };
  },

  // Validação de formação mínima
  validateFormacaoMinima: (formacao: string): ValidationResult => {
    if (!formacao || formacao.trim().length === 0) {
      return { isValid: false, message: 'A formação mínima é obrigatória.' };
    }
    if (formacao.length < 3) {
      return { isValid: false, message: 'A formação mínima deve ter no mínimo 3 caracteres.' };
    }
    if (formacao.length > 100) {
      return { isValid: false, message: 'A formação mínima deve ter no máximo 100 caracteres.' };
    }
    return { isValid: true, message: 'Formação mínima válida.' };
  },

  // Validação de salário
  validateSalario: (salario: string): ValidationResult => {
    if (!salario) {
      return { isValid: false, message: 'O salário é obrigatório.' };
    }
    const numericSalario = parseFloat(salario);
    if (isNaN(numericSalario) || numericSalario <= 0) {
      return { isValid: false, message: 'O salário deve ser um número positivo.' };
    }
    // Validação para salário muito pequeno (menor que R$ 1.000,00)
    if (numericSalario < 1000) {
      return { isValid: false, message: 'O salário deve ser no mínimo R$ 1.000,00.' };
    }
    return { isValid: true, message: 'Salário válido.' };
  },

  // Validação completa do formulário
  validateForm: (data: Record<string, string>): ValidationResult[] => {
    const validations: ValidationResult[] = [];

    validations.push(cargoValidations.validateNomeCargo(data.nome || ''));
    validations.push(cargoValidations.validateFormacaoMinima(data.formacaoMinima || ''));
    validations.push(cargoValidations.validateSalario(data.salario || ''));

    return validations;
  }
}; 