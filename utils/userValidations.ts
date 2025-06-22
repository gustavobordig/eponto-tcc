export interface ValidationResult {
  isValid: boolean;
  message: string;
}

export const userValidations = {
  // Validação de senha forte
  validatePassword: (password: string): ValidationResult => {
    if (password.length < 8) {
      return {
        isValid: false,
        message: 'A senha deve ter pelo menos 8 caracteres'
      };
    }

    if (!/(?=.*[a-z])/.test(password)) {
      return {
        isValid: false,
        message: 'A senha deve conter pelo menos uma letra minúscula'
      };
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      return {
        isValid: false,
        message: 'A senha deve conter pelo menos uma letra maiúscula'
      };
    }

    if (!/(?=.*\d)/.test(password)) {
      return {
        isValid: false,
        message: 'A senha deve conter pelo menos um número'
      };
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return {
        isValid: false,
        message: 'A senha deve conter pelo menos um caractere especial (@$!%*?&)'
      };
    }

    return {
      isValid: true,
      message: 'Senha válida'
    };
  },

  // Validação de telefone brasileiro
  validatePhone: (phone: string): ValidationResult => {
    if (!phone) {
      return {
        isValid: true,
        message: 'Telefone é opcional'
      };
    }

    // Remove todos os caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Verifica se tem 10 ou 11 dígitos (com DDD)
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      return {
        isValid: false,
        message: 'Telefone deve ter 10 ou 11 dígitos (com DDD)'
      };
    }

    // Verifica se o DDD é válido (11-99)
    const ddd = parseInt(cleanPhone.substring(0, 2));
    if (ddd < 11 || ddd > 99) {
      return {
        isValid: false,
        message: 'DDD inválido'
      };
    }

    return {
      isValid: true,
      message: 'Telefone válido'
    };
  },

  // Validação de data de nascimento (idade entre 18 e 100 anos)
  validateBirthDate: (birthDate: string): ValidationResult => {
    if (!birthDate) {
      return {
        isValid: false,
        message: 'Data de nascimento é obrigatória'
      };
    }

    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    // Ajusta a idade se ainda não fez aniversário este ano
    const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate()) 
      ? age - 1 
      : age;

    if (actualAge < 16) {
      return {
        isValid: false,
        message: 'O usuário deve ter pelo menos 16 anos'
      };
    }

    if (actualAge > 100) {
      return {
        isValid: false,
        message: 'Data de nascimento inválida (idade máxima: 100 anos)'
      };
    }

    // Verifica se a data não é no futuro
    if (birth > today) {
      return {
        isValid: false,
        message: 'Data de nascimento não pode ser no futuro'
      };
    }

    return {
      isValid: true,
      message: 'Data de nascimento válida'
    };
  },

  // Validação de email único (simulação - em produção seria verificado no backend)
  validateEmail: (email: string): ValidationResult => {
    if (!email) {
      return {
        isValid: false,
        message: 'E-mail é obrigatório'
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        isValid: false,
        message: 'Formato de e-mail inválido'
      };
    }

    return {
      isValid: true,
      message: 'E-mail válido'
    };
  },

  // Validação de nome
  validateName: (name: string): ValidationResult => {
    if (!name) {
      return {
        isValid: false,
        message: 'Nome é obrigatório'
      };
    }

    if (name.length < 2) {
      return {
        isValid: false,
        message: 'Nome deve ter pelo menos 2 caracteres'
      };
    }

    if (name.length > 100) {
      return {
        isValid: false,
        message: 'Nome deve ter no máximo 100 caracteres'
      };
    }

    // Permite letras, espaços, hífens e apóstrofos
    const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
    if (!nameRegex.test(name)) {
      return {
        isValid: false,
        message: 'Nome deve conter apenas letras, espaços, hífens e apóstrofos'
      };
    }

    return {
      isValid: true,
      message: 'Nome válido'
    };
  },

  // Validação completa do formulário
  validateForm: (data: Record<string, string>, selectedCargo: string, selectedJornada: string): ValidationResult[] => {
    const validations: ValidationResult[] = [];

    // Validação do nome
    validations.push(userValidations.validateName(data.name || ''));

    // Validação do email
    validations.push(userValidations.validateEmail(data.email || ''));

    // Validação da data de nascimento
    validations.push(userValidations.validateBirthDate(data.dataNascimento || ''));

    // Validação do telefone
    validations.push(userValidations.validatePhone(data.telefone || ''));

    // Validação da senha
    validations.push(userValidations.validatePassword(data.password || ''));

    // Validação do cargo
    if (!selectedCargo) {
      validations.push({
        isValid: false,
        message: 'Cargo é obrigatório'
      });
    } else {
      validations.push({
        isValid: true,
        message: 'Cargo selecionado'
      });
    }

    // Validação da jornada
    if (!selectedJornada) {
      validations.push({
        isValid: false,
        message: 'Jornada de trabalho é obrigatória'
      });
    } else {
      validations.push({
        isValid: true,
        message: 'Jornada selecionada'
      });
    }

    return validations;
  }
}; 