export const regexPatterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
}

export const regexMessages = {
    email: 'Email inválido',
    password: 'A senha deve conter pelo menos 8 caracteres, uma letra maiúscula, uma letra minúscula e um número',
}

