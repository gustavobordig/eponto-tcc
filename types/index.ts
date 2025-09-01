import { ReactNode } from 'react';

export interface Column {
    key: string;
    label: string;
    type?: 'text' | 'status' | 'currency' | 'date' | 'datetime' | 'custom' | 'actions';
    render?: (item: any) => ReactNode;
}

export interface Ferias {
  idFerias?: number;
  dscObservacao?: string;
  dscFerias?: string;
  datInicioFerias?: string;
  datIncioFerias?: string;
  datFimFerias: string;
  idUsuario?: number | null;
}


