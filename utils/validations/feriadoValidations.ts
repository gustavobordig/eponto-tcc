import { ValidationResult } from "./userValidations";

export const feriadoValidations = {
  // Validação da descrição do feriado
  validateDescricao: (descricao: string): ValidationResult => {
    if (!descricao || descricao.trim().length === 0) {
      return { isValid: false, message: 'A descrição é obrigatória.' };
    }
    if (descricao.length < 3) {
      return { isValid: false, message: 'A descrição deve ter no mínimo 3 caracteres.' };
    }
    if (descricao.length > 200) {
      return { isValid: false, message: 'A descrição deve ter no máximo 200 caracteres.' };
    }
    return { isValid: true, message: 'Descrição válida.' };
  },

  // Validação da data do feriado
  validateDataFeriado: (data: string): ValidationResult => {
    if (!data) {
      return { isValid: false, message: 'A data do feriado é obrigatória.' };
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to compare dates only
    const feriadoDate = new Date(data);

    if (feriadoDate < today) {
      return { isValid: false, message: 'A data do feriado não pode ser no passado.' };
    }
    return { isValid: true, message: 'Data válida.' };
  },

  // Validação do tipo de feriado
  validateTipoFeriado: (tipo: string): ValidationResult => {
    if (!tipo) {
      return { isValid: false, message: 'O tipo de feriado é obrigatório.' };
    }
    return { isValid: true, message: 'Tipo de feriado válido.' };
  },

  // Validação completa do formulário
  validateForm: (data: Record<string, string>, tipo: string): ValidationResult[] => {
    const validations: ValidationResult[] = [];
    validations.push(feriadoValidations.validateDescricao(data.descricao || ''));
    validations.push(feriadoValidations.validateDataFeriado(data.dataFeriado || ''));
    validations.push(feriadoValidations.validateTipoFeriado(tipo));
    return validations;
  }
}; 