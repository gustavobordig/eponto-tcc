import { Coffee, LogIn, LogOut, UtensilsCrossed } from 'lucide-react';
import { ReactNode } from 'react';

/** As quatro marcações do dia, na ordem. `tipo` é o idTipoRegistroPonto da API. */
export interface EtapaDoDia {
  tipo: 1 | 2 | 3 | 4;
  label: string;
  /** Texto do botão quando esta é a próxima marcação */
  acao: string;
  /** Horário de referência (fixo; a API não informa o horário da jornada) */
  referencia: string;
  /** Se marcar depois da referência conta como atraso */
  contaAtraso: boolean;
  icone: (classe?: string) => ReactNode;
}

export const ETAPAS_DO_DIA: EtapaDoDia[] = [
  { tipo: 1, label: 'Entrada', acao: 'Registrar entrada', referencia: '08:00', contaAtraso: true, icone: (c = 'w-5 h-5') => <LogIn className={c} /> },
  { tipo: 2, label: 'Início do almoço', acao: 'Iniciar almoço', referencia: '12:00', contaAtraso: false, icone: (c = 'w-5 h-5') => <Coffee className={c} /> },
  { tipo: 3, label: 'Fim do almoço', acao: 'Voltar do almoço', referencia: '13:00', contaAtraso: true, icone: (c = 'w-5 h-5') => <UtensilsCrossed className={c} /> },
  { tipo: 4, label: 'Saída', acao: 'Registrar saída', referencia: '17:00', contaAtraso: false, icone: (c = 'w-5 h-5') => <LogOut className={c} /> },
];

/** Minutos de atraso em relação à referência (0 se não atrasou). */
export function minutosDeAtraso(etapa: EtapaDoDia, hora: string): number {
  if (!etapa.contaAtraso) return 0;
  const [rh, rm] = etapa.referencia.split(':').map(Number);
  const [h, m] = hora.split(':').map(Number);
  return Math.max(0, h * 60 + m - (rh * 60 + rm));
}
