import React from 'react';
import { TimeRecordAdjustment, ItemRegistro } from '@/services/timeRecordAdjustment';

interface TimeComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSolicitacao: TimeRecordAdjustment | null;
  registrosOriginais: ItemRegistro[];
  onApprove: () => void;
  onReject: () => void;
  loading: boolean;
}

const TimeComparisonModal: React.FC<TimeComparisonModalProps> = ({
  isOpen,
  onClose,
  selectedSolicitacao,
  registrosOriginais,
  onApprove,
  onReject,
  loading
}) => {
  if (!isOpen || !selectedSolicitacao) return null;

  const formatarHora = (dataHora: string) => {
    if (dataHora === "0001-01-01T00:00:00") return "Não definida";
    return new Date(dataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const getTipoRegistro = (idTipo: number): string => {
    switch (idTipo) {
      case 1:
        return 'Entrada';
      case 2:
        return 'Início Almoço';
      case 3:
        return 'Volta Almoço';
      case 4:
        return 'Saída';
      default:
        return 'Desconhecido';
    }
  };

  const getTipoColor = (tipo: string): string => {
    switch (tipo) {
      case 'Entrada':
        return 'bg-green-100 text-green-800';
      case 'Início Almoço':
        return 'bg-yellow-100 text-yellow-800';
      case 'Volta Almoço':
        return 'bg-orange-100 text-orange-800';
      case 'Saída':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatarRegistros = (registros: ItemRegistro[]) => {
    return registros.map(registro => ({
      hora: formatarHora(registro.horaRegistro),
      tipo: getTipoRegistro(registro.idTipoRegistroPonto)
    }));
  };

  const calcularDiferenca = (horaOriginal: string, horaSolicitada: string) => {
    if (horaOriginal === "Não definida" || horaSolicitada === "Não definida") {
      return "N/A";
    }
    
    const [h1, m1] = horaOriginal.split(':').map(Number);
    const [h2, m2] = horaSolicitada.split(':').map(Number);
    
    const minutos1 = h1 * 60 + m1;
    const minutos2 = h2 * 60 + m2;
    const diferenca = minutos2 - minutos1;
    
    if (diferenca === 0) return "Sem alteração";
    
    const horas = Math.abs(diferenca) / 60;
    const mins = Math.abs(diferenca) % 60;
    
    const sinal = diferenca > 0 ? '+' : '-';
    const tempo = horas > 0 ? `${Math.floor(horas)}h ${mins}min` : `${mins}min`;
    
    return `${sinal}${tempo}`;
  };

  const registrosOriginaisFormatados = formatarRegistros(registrosOriginais);
  const registrosSolicitadosFormatados = formatarRegistros(selectedSolicitacao.itens);

  return (
    <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Comparação de Horários</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Registros Originais */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              Horários Originais
            </h3>
            <div className="space-y-3">
              {registrosOriginais.length > 0 ? (
                registrosOriginaisFormatados.map((registro, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 border border-red-200">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-mono font-bold text-red-700">
                        {registro.hora}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTipoColor(registro.tipo)}`}>
                        {registro.tipo}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-2"></div>
                  Carregando registros originais...
                </div>
              )}
            </div>
          </div>

          {/* Registros Solicitados */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              Horários Solicitados
            </h3>
            <div className="space-y-3">
              {registrosSolicitadosFormatados.map((registro, index) => (
                <div key={index} className="bg-white rounded-lg p-3 border border-blue-200">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-mono font-bold text-blue-700">
                      {registro.hora}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTipoColor(registro.tipo)}`}>
                      {registro.tipo}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resumo das Diferenças */}
        {registrosOriginais.length > 0 && (
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Resumo das Alterações</h4>
            <div className="grid md:grid-cols-2 gap-4">
              {registrosOriginaisFormatados.map((original, index) => {
                const solicitado = registrosSolicitadosFormatados[index];
                if (!solicitado) return null;
                
                const diferenca = calcularDiferenca(original.hora, solicitado.hora);
                return (
                  <div key={index} className="bg-white rounded-lg p-3 border">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">{original.tipo}</span>
                      <span className={`px-2 py-1 rounded text-sm font-medium ${
                        diferenca.includes('+') 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {diferenca}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {original.hora} → {solicitado.hora}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Botões de Ação */}
        {selectedSolicitacao.statusSolicitacao === 0 && (
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Fechar
            </button>
            <button
              onClick={onReject}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Processando...' : 'Reprovar'}
            </button>
            <button
              onClick={onApprove}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Processando...' : 'Aprovar'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeComparisonModal;
