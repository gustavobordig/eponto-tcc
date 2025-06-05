export const regexPatterns = {
  // Email validation - allows standard email formats
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

  // Name validation - allows letters, spaces, and common name characters
  name: /^[a-zA-ZÀ-ÿ\s'-]{2,100}$/,

  // Password validation - minimum 8 characters, at least one uppercase, one lowercase, one number and one special character
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,

  // Phone number validation - Brazilian format
  phone: /^\(\d{2}\)\s\d{5}-\d{4}$/,

  // CPF validation - Brazilian format
  cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,

  // Date validation - DD/MM/YYYY format
  date: /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,

  // Time validation - HH:MM format
  time: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,

  // Only numbers
  numbers: /^\d+$/,

  // Only letters
  letters: /^[a-zA-ZÀ-ÿ\s]+$/
} as const;

// Type for the regex patterns
export type RegexPattern = keyof typeof regexPatterns;
