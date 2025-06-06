import { ReactNode } from 'react';

export interface Column {
    key: string;
    label: string;
    type?: 'text' | 'status' | 'currency' | 'date' | 'custom';
    render?: (item: any) => ReactNode;
}


