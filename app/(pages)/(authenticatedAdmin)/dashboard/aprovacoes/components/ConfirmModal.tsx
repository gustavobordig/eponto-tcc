import React from 'react';
import { TimeRecordAdjustment } from '@/services/timeRecordAdjustment';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedSolicitacao: TimeRecordAdjustment | null;
  action: 'approve' | 'reject' | null;
  loading: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  selectedSolicitacao,
  action,
  loading
}) => {
  if (!isOpen || !selectedSolicitacao || !action) return null;

  return (
    <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
            action === 'approve' ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {action === 'approve' ? (
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {action === 'approve' ? 'Aprovar Solicitação' : 'Reprovar Solicitação'}
            </h3>
            <p className="text-sm text-gray-500">
              ID: {selectedSolicitacao.idSolicitacao}
            </p>
          </div>
        </div>
        
        <p className="text-gray-700 mb-6">
          Tem certeza que deseja {action === 'approve' ? 'aprovar' : 'reprovar'} esta solicitação de ajuste de ponto?
        </p>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 ${
              action === 'approve' ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            {loading ? 'Processando...' : (action === 'approve' ? 'Aprovar' : 'Reprovar')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
