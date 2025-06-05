export const invalidFieldMessages = {
  name: {
    required: 'O nome é obrigatório',
    invalid: 'Nome inválido. Use apenas letras e espaços.',
    minLength: 'O nome deve ter pelo menos 3 caracteres',
    maxLength: 'O nome deve ter no máximo 100 caracteres'
  },
  email: {
    required: 'O e-mail é obrigatório',
    invalid: 'E-mail inválido. Use um formato válido (ex: usuario@dominio.com)',
    alreadyExists: 'Este e-mail já está cadastrado'
  },
  password: {
    required: 'A senha é obrigatória',
    invalid: 'A senha deve conter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais',
    minLength: 'A senha deve ter pelo menos 8 caracteres',
    maxLength: 'A senha deve ter no máximo 50 caracteres',
    mismatch: 'As senhas não coincidem'
  }
};
