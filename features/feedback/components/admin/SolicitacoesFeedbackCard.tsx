import { Clock, Eye, MessageSquare, Send } from 'lucide-react';
import { SolicitacaoData } from '@/features/feedback/api';
import { getStatusColor, getStatusLabel, STATUS_RESPONDIDA, truncateText } from '@/features/feedback/status';
import { formatDate } from '@/shared/lib/format';

interface Props {
  solicitacoes: SolicitacaoData[];
  onView: (solicitacao: SolicitacaoData) => void;
  onResponder: (solicitacao: SolicitacaoData) => void;
}

const COLUNAS = ['Solicitante', 'Data da Solicitação', 'Status', 'Mensagem', 'Ações'];

export default function SolicitacoesFeedbackCard({ solicitacoes, onView, onResponder }: Props) {
  const pendentes = solicitacoes.filter((s) => s.status === 0).length;
  const respondidas = solicitacoes.filter((s) => s.status === STATUS_RESPONDIDA).length;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 m-4 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <MessageSquare className="text-primary" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Solicitações de Feedback</h1>
            <p className="text-gray-600">Gerencie as solicitações de feedback dos usuários</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Stat cor="blue" label="Total" valor={solicitacoes.length} />
        <Stat cor="yellow" label="Pendentes" valor={pendentes} />
        <Stat cor="green" label="Respondidas" valor={respondidas} />
      </div>

      {solicitacoes.length > 0 ? (
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
              {solicitacoes.map((solicitacao) => (
                <tr key={solicitacao.idSolicitacaoFeedback} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {solicitacao.nomeUsuarioSolicitacao}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(solicitacao.dataSolicitacao, true)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(solicitacao.status)}`}>
                      {getStatusLabel(solicitacao.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {truncateText(solicitacao.mensagemSolicitacao, 60)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => onView(solicitacao)}
                      className="bg-primary hover:bg-primary-dark text-white px-3 my-2 py-1 rounded text-xs flex items-center gap-1 transition-colors"
                    >
                      <Eye size={12} />
                      Visualizar
                    </button>
                    {solicitacao.status !== STATUS_RESPONDIDA && (
                      <button
                        onClick={() => onResponder(solicitacao)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 my-2 py-1 rounded text-xs flex items-center gap-1 transition-colors"
                      >
                        <Send size={12} />
                        Responder
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <MessageSquare className="mx-auto text-gray-400" size={48} />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhuma solicitação encontrada</h3>
          <p className="mt-2 text-gray-500">Não há solicitações de feedback para exibir.</p>
        </div>
      )}
    </div>
  );
}

// Classes completas por cor para o Tailwind encontrar no build
const CORES = {
  blue: ['bg-blue-50', 'text-primary', 'text-blue-900'],
  yellow: ['bg-yellow-50', 'text-yellow-600', 'text-yellow-900'],
  green: ['bg-green-50', 'text-green-600', 'text-green-900'],
} as const;

function Stat({ cor, label, valor }: { cor: keyof typeof CORES; label: string; valor: number }) {
  const [fundo, texto, numero] = CORES[cor];
  return (
    <div className={`${fundo} p-4 rounded-lg`}>
      <div className="flex items-center gap-2">
        <Clock className={texto} size={20} />
        <span className={`text-sm font-medium ${texto}`}>{label}</span>
      </div>
      <p className={`text-2xl font-bold ${numero}`}>{valor}</p>
    </div>
  );
}
