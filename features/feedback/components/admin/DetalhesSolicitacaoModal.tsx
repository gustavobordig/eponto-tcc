import { AlertCircle, CheckCircle, Clock, MessageCircle, Send, User } from 'lucide-react';
import { SolicitacaoData } from '@/features/feedback/api';
import { getStatusColor, getStatusLabel, STATUS_RESPONDIDA } from '@/features/feedback/status';
import { formatDate } from '@/shared/lib/format';
import ModalShell from './ModalShell';

interface Props {
  solicitacao: SolicitacaoData;
  onClose: () => void;
  onResponder: (solicitacao: SolicitacaoData) => void;
}

const StatusIcon = ({ status }: { status: number }) =>
  status === STATUS_RESPONDIDA ? (
    <CheckCircle className="text-ok-ink" size={16} />
  ) : (
    <AlertCircle className={status === 0 ? 'text-warn-ink' : 'text-muted'} size={16} />
  );

export default function DetalhesSolicitacaoModal({ solicitacao, onClose, onResponder }: Props) {
  return (
    <ModalShell
      titulo="Detalhes da Solicitação"
      icone={<MessageCircle className="text-primary" size={20} />}
      corIcone="bg-primary-soft"
      onClose={onClose}
      rodape={
        <>
          {solicitacao.status !== STATUS_RESPONDIDA && (
            <button
              onClick={() => {
                onClose();
                onResponder(solicitacao);
              }}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              <Send size={16} />
              Responder
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 text-foreground bg-surface border border-line-strong rounded-lg hover:bg-surface-2 transition-colors"
          >
            Fechar
          </button>
        </>
      }
    >
      <div className="flex justify-center">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${getStatusColor(solicitacao.status)}`}>
          <StatusIcon status={solicitacao.status} />
          <span className="font-medium">{getStatusLabel(solicitacao.status)}</span>
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary-soft to-primary-tint p-6 rounded-xl border border-primary-soft">
        <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <User size={18} className="text-primary" />
          Informações do Solicitante
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted">Nome:</label>
            <p className="text-foreground font-medium">{solicitacao.nomeUsuarioSolicitacao}</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-ok-soft to-emerald-50 p-6 rounded-xl border border-ok-soft">
        <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Clock size={18} className="text-ok-ink" />
          Informações da Solicitação
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted">Data da Solicitação:</label>
            <p className="text-foreground font-medium">{formatDate(solicitacao.dataSolicitacao, true)}</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-ferias-soft to-pink-50 p-6 rounded-xl border border-ferias-soft">
        <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <MessageCircle size={18} className="text-ferias" />
          Mensagem da Solicitação
        </h4>
        <div className="bg-surface p-4 rounded-lg border border-ferias-soft">
          <p className="text-foreground whitespace-pre-wrap leading-relaxed">{solicitacao.mensagemSolicitacao}</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-xl border border-orange-100">
        <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <User size={18} className="text-orange-600" />
          Responsável
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted">Nome:</label>
            <p className="text-foreground font-medium">{solicitacao.nomeResponsavelFeedback}</p>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}
