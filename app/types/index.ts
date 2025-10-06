export interface Column {
  key: string;
  label: string;
  type?: 'text' | 'select' | 'date' | 'status' | 'custom';
  render?: (item: any) => React.ReactNode;
  readOnly?: boolean;
  required?: boolean;
  options?: { value: string; label: string }[];
}

export interface ValidationResult {
  isValid: boolean;
  message: string;
}

export interface ValidationConfig {
  fieldName: string;
  validationFunction: (value: string) => ValidationResult;
}

export interface EditModalField {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => void;
  type?: 'text' | 'select' | 'number' | 'date';
  options?: { value: string; label: string }[];
  readOnly?: boolean;
  required?: boolean;
  fieldName?: string; // Nome do campo para validação
  validationConfig?: ValidationConfig; // Configuração de validação específica
}

export interface UsuarioHierarquia {
  idUsuario: number;
  nome: string;
  dataNascimento: string;
  senha: string;
  email: string;
  telefone: number;
  idCargo: number;
  idJornada: number;
  indAtivo: number;
  fotoPerfil: string;
  idChefe: number;
  chefe: string;
  subordinados: string[];
  nivel: number;
} 