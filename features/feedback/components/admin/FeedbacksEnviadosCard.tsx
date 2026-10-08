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
  { label: 'Total', filtro: () => true, cores: ['bg-green-50', 'text-green-600', 'text-green-900'] },
  { label: 'Avaliação 1-2', filtro: (f: FeedbackData) => estrelasDaAvaliacao(f.avaliacao) <= 2, cores: ['bg-yellow-50', 'text-yellow-600', 'text-yellow-900'] },
  { label: 'Avaliação 3-4', filtro: (f: FeedbackData) => [3, 4].includes(estrelasDaAvaliacao(f.avaliacao)), cores: ['bg-blue-50', 'text-primary', 'text-blue-900'] },
  { label: 'Avaliação 5', filtro: (f: FeedbackData) => estrelasDaAvaliacao(f.avaliacao) === 5, cores: ['bg-purple-50', 'text-purple-600', 'text-purple-900'] },
];

export default function FeedbacksEnviadosCard({ feedbacks, loading }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 m-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Star className="text-green-600" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Feedbacks Enviados</h2>
            <p className="text-gray-600">Visualize todos os feedbacks enviados pelos administradores</p>
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
          <p className="text-gray-600 mt-4">Carregando feedbacks...</p>
        </div>
      ) : feedbacks.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {COLUNAS.map((coluna) => (
                  <th key={coluna} className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    {coluna}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {feedbacks.map((feedback) => (
                <tr key={feedback.idFeedback} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(feedback.dataRealizacao, true)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <RatingStars avaliacao={feedback.avaliacao} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {truncateText(feedback.mensagemFeedback, 60)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <Star className="mx-auto text-gray-400" size={48} />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhum feedback encontrado</h3>
          <p className="mt-2 text-gray-500">Não há feedbacks enviados para exibir.</p>
        </div>
      )}
    </div>
  );
}
