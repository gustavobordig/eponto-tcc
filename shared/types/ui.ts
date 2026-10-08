import { ReactNode } from 'react';

// Tipos de UI compartilhados. Os contratos da API ficam nos services.

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- cada tabela recebe um tipo de linha diferente
export type TableRow = Record<string, any>;

export interface Column<T = TableRow> {
  key: string;
  label: string;
  type?: 'text' | 'select' | 'status' | 'currency' | 'date' | 'datetime' | 'phone' | 'custom' | 'actions';
  // Método (e não propriedade) para aceitar colunas tipadas com a linha de cada tabela
  render?(item: T): ReactNode;
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
  fieldName?: string;
  validationConfig?: ValidationConfig;
}
