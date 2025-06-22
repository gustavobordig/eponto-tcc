import { ValidationResult } from "./userValidations";

export const jornadaValidations = {
  // Validação de nome da jornada
  validateNomeJornada: (nome: string): ValidationResult => {
    if (!nome || nome.trim().length === 0) {
      return { isValid: false, message: 'O nome da jornada é obrigatório.' };
    }
    if (nome.length < 3) {
      return { isValid: false, message: 'O nome deve ter no mínimo 3 caracteres.' };
    }
    if (nome.length > 100) {
      return { isValid: false, message: 'O nome deve ter no máximo 100 caracteres.' };
    }
    return { isValid: true, message: 'Nome da jornada válido.' };
  },

  // Validação de horas diárias
  validateHorasDiarias: (horas: string): ValidationResult => {
    if (!horas) {
      return { isValid: false, message: 'A quantidade de horas é obrigatória.' };
    }
    const numericHoras = parseFloat(horas);
    if (isNaN(numericHoras) || numericHoras <= 0) {
      return { isValid: false, message: 'As horas devem ser um número positivo.' };
    }
    if (numericHoras > 24) {
      return { isValid: false, message: 'A quantidade de horas não pode exceder 24.' };
    }
    return { isValid: true, message: 'Quantidade de horas válida.' };
  },

  // Validação completa do formulário
  validateForm: (data: Record<string, string>): ValidationResult[] => {
    const validations: ValidationResult[] = [];
    validations.push(jornadaValidations.validateNomeJornada(data.nome || ''));
    validations.push(jornadaValidations.validateHorasDiarias(data.horasDiarias || ''));
    return validations;
  }
}; 