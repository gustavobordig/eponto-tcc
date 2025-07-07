import { ValidationResult } from "./userValidations";

export const feriasValidations = {
  // Validação da descrição das férias
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

  // Validação da data de início
  validateDataInicio: (dataInicio: string): ValidationResult => {
    if (!dataInicio) {
      return { isValid: false, message: 'A data de início é obrigatória.' };
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(dataInicio);
    if (startDate < today) {
      return { isValid: false, message: 'A data de início não pode ser no passado.' };
    }
    return { isValid: true, message: 'Data de início válida.' };
  },

  // Validação da data de fim
  validateDataFim: (dataFim: string, dataInicio: string): ValidationResult => {
    if (!dataFim) {
      return { isValid: false, message: 'A data de fim é obrigatória.' };
    }
    if (!dataInicio) {
      // Se não houver data de início, não podemos comparar
      return { isValid: true, message: '' };
    }
    const startDate = new Date(dataInicio);
    const endDate = new Date(dataFim);
    if (endDate < startDate) {
      return { isValid: false, message: 'A data de fim não pode ser anterior à data de início.' };
    }
    return { isValid: true, message: 'Data de fim válida.' };
  },

  // Validação completa do formulário
  validateForm: (data: Record<string, string>): ValidationResult[] => {
    const validations: ValidationResult[] = [];
    validations.push(feriasValidations.validateDescricao(data.descricao || ''));
    validations.push(feriasValidations.validateDataInicio(data.dataInicio || ''));
    validations.push(feriasValidations.validateDataFim(data.dataFim || '', data.dataInicio || ''));
    return validations;
  }
}; 