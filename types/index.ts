import { ReactNode } from 'react';

export interface Column {
    key: string;
    label: string;
    type?: 'text' | 'status' | 'currency' | 'date' | 'custom' | 'actions';
    render?: (item: any) => ReactNode;
}

export interface Ferias {
  idFerias?: number;
  dscFerias: string;
  datIncioFerias: string;
  datFimFerias: string;
  idUsuario: number | null;
}


