export interface Column {
  key: string;
  label: string;
  type?: 'text' | 'select' | 'date' | 'status' | 'custom';
  render?: (item: any) => React.ReactNode;
  readOnly?: boolean;
  required?: boolean;
  options?: { value: string; label: string }[];
}

export interface EditModalField {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => void;
  type?: 'text' | 'select';
  options?: { value: string; label: string }[];
  readOnly?: boolean;
  required?: boolean;
} 