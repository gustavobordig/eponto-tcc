import { SolicitacaoFerias } from '@/features/ferias/api';
import ConfirmationModal from '@/shared/ui/ConfirmationModal';

interface Props {
  solicitacao: SolicitacaoFerias | null;
  aprovar: boolean;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DecisaoSolicitacaoModal({ solicitacao, aprovar, loading, onConfirm, onCancel }: Props) {
  return (
    <ConfirmationModal
      isOpen={Boolean(solicitacao)}
      title={aprovar ? 'Confirmar Aprovação' : 'Confirmar Reprovação'}
      message={`Tem certeza que deseja ${aprovar ? 'aprovar' : 'reprovar'} esta solicitação de férias?`}
      confirmText={aprovar ? 'Aprovar' : 'Reprovar'}
      cancelText="Cancelar"
      onConfirm={onConfirm}
      onCancel={onCancel}
      loading={loading}
      confirmButtonColor={aprovar ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
    >
      {solicitacao && (
        <div className="text-sm">
          <p><strong>Funcionário:</strong> {solicitacao.nomeUsuario}</p>
          <p>
            <strong>Período:</strong> {new Date(solicitacao.datInicioFerias).toLocaleDateString('pt-BR')} a{' '}
            {new Date(solicitacao.datFimFerias).toLocaleDateString('pt-BR')}
          </p>
          <p><strong>Descrição:</strong> {solicitacao.dscObservacao}</p>
        </div>
      )}
    </ConfirmationModal>
  );
}
