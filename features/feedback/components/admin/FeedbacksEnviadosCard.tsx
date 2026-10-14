import { Star } from 'lucide-react';
import { FeedbackData } from '@/features/feedback/api';
import { truncateText } from '@/features/feedback/status';
import RatingStars from '@/features/feedback/components/RatingStars';
import { estrelasDaAvaliacao } from '@/features/feedback/avaliacao';
import { formatDate } from '@/shared/lib/format';

interface Props {
  feedbacks: FeedbackData[];
  loading: boolean;
}

const COLUNAS = ['Data do Feedback', 'Avaliação', 'Mensagem'];

// Classes completas por cor para o Tailwind encontrar no build
const STATS = [
  { label: 'Total', filtro: () => true, cores: ['bg-ok-soft', 'text-ok-ink', 'text-ok-ink'] },
  { label: 'Avaliação 1-2', filtro: (f: FeedbackData) => estrelasDaAvaliacao(f.avaliacao) <= 2, cores: ['bg-warn-soft', 'text-warn-ink', 'text-warn-ink'] },
  { label: 'Avaliação 3-4', filtro: (f: FeedbackData) => [3, 4].includes(estrelasDaAvaliacao(f.avaliacao)), cores: ['bg-primary-soft', 'text-primary', 'text-primary'] },
  { label: 'Avaliação 5', filtro: (f: FeedbackData) => estrelasDaAvaliacao(f.avaliacao) === 5, cores: ['bg-ferias-soft', 'text-ferias', 'text-ferias'] },
];

export default function FeedbacksEnviadosCard({ feedbacks, loading }: Props) {
  return (
    <div className="bg-surface rounded-lg shadow-sm p-6 m-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-ok-soft rounded-lg">
            <Star className="text-ok-ink" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Feedbacks Enviados</h2>
            <p className="text-muted">Visualize todos os feedbacks enviados pelos administradores</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {STATS.map(({ label, filtro, cores: [fundo, texto, numero] }) => (
          <div key={label} className={`${fundo} p-4 rounded-lg`}>
            <div className="flex items-center gap-2">
              <Star className={texto} size={20} />
              <span className={`text-sm font-medium ${texto}`}>{label}</span>
            </div>
            <p className={`text-2xl font-bold ${numero}`}>{feedbacks.filter(filtro).length}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-muted mt-4">Carregando feedbacks...</p>
        </div>
      ) : feedbacks.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-line">
            <thead className="bg-surface-2">
              <tr>
                {COLUNAS.map((coluna) => (
                  <th key={coluna} className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                    {coluna}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-line">
              {feedbacks.map((feedback) => (
                <tr key={feedback.idFeedback} className="hover:bg-surface-2 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {formatDate(feedback.dataRealizacao, true)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <RatingStars avaliacao={feedback.avaliacao} />
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {truncateText(feedback.mensagemFeedback, 60)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <Star className="mx-auto text-subtle" size={48} />
          <h3 className="mt-4 text-lg font-medium text-foreground">Nenhum feedback encontrado</h3>
          <p className="mt-2 text-muted">Não há feedbacks enviados para exibir.</p>
        </div>
      )}
    </div>
  );
}
