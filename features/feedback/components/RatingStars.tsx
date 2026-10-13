import { Star } from 'lucide-react';
import { estrelasDaAvaliacao } from '@/features/feedback/avaliacao';

/** Recebe a avaliação como vem da API (0 a 4) e mostra de 1 a 5 estrelas. */
export default function RatingStars({ avaliacao }: { avaliacao: number }) {
  const estrelas = estrelasDaAvaliacao(avaliacao);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={16}
          className={star <= estrelas ? 'fill-current text-warn' : 'text-line-strong'}
        />
      ))}
      <span className="ml-1 text-xs text-muted">({estrelas})</span>
    </div>
  );
}
