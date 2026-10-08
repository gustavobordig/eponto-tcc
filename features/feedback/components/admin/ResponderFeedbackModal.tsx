import { useState } from 'react';
import { Send } from 'lucide-react';
import { SolicitacaoData } from '@/features/feedback/api';
import { RespostaFeedback } from '@/features/feedback/hooks/useFeedbackAdmin';
import { AVALIACOES } from '@/features/feedback/avaliacao';
import Button from '@/shared/ui/Button';
import TextArea from '@/shared/ui/TextArea';
import ModalShell from './ModalShell';

interface Props {
  solicitacao: SolicitacaoData;
  onClose: () => void;
  /** Devolve true quando o feedback foi gravado */
  onSubmit: (resposta: RespostaFeedback) => Promise<boolean>;
}

function validar({ mensagemFeedback, estrelas }: RespostaFeedback) {
  const erros: Record<string, string> = {};
  if (!mensagemFeedback.trim()) {
    erros.mensagemFeedback = 'Mensagem é obrigatória';
  } else if (mensagemFeedback.length < 10) {
    erros.mensagemFeedback = 'Mensagem deve ter pelo menos 10 caracteres';
  }
  if (estrelas < 1 || estrelas > 5) {
    erros.avaliacao = 'Avaliação deve ser entre 1 e 5';
  }
  return erros;
}

export default function ResponderFeedbackModal({ solicitacao, onClose, onSubmit }: Props) {
  const [resposta, setResposta] = useState<RespostaFeedback>({ mensagemFeedback: '', estrelas: 5 });
  const [erros, setErros] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async () => {
    const novosErros = validar(resposta);
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    setEnviando(true);
    const ok = await onSubmit(resposta);
    setEnviando(false);
    if (ok) onClose();
  };

  return (
    <ModalShell
      titulo="Inserir Feedback"
      icone={<Send className="text-green-600" size={20} />}
      corIcone="bg-green-100"
      onClose={onClose}
      rodape={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <Button text="Enviar Feedback" onClick={handleSubmit} isLoading={enviando} className="px-4 py-2" />
        </>
      }
    >
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-2">Solicitação de {solicitacao.nomeUsuarioSolicitacao}</h4>
        <p className="text-gray-600 text-sm">{solicitacao.mensagemSolicitacao}</p>
      </div>

      <div className="space-y-4">
        <TextArea
          label="Mensagem do Feedback"
          placeholder="Digite sua resposta, feedback ou avaliação para esta solicitação..."
          value={resposta.mensagemFeedback}
          onTextareaChange={(value) => setResposta((prev) => ({ ...prev, mensagemFeedback: value }))}
          error={erros.mensagemFeedback}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Avaliação (1-5)</label>
          <select
            value={resposta.estrelas}
            onChange={(e) => setResposta((prev) => ({ ...prev, estrelas: Number(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          >
            {AVALIACOES.map(({ estrelas, label }) => (
              <option key={estrelas} value={estrelas}>
                {estrelas} - {label}
              </option>
            ))}
          </select>
          {erros.avaliacao && <p className="text-red-500 text-sm mt-1">{erros.avaliacao}</p>}
        </div>
      </div>
    </ModalShell>
  );
}
