'use client';

import { useState, useEffect } from 'react';
import { feriasService } from '@/services/ferias';
import { showSuccessToast, showErrorToast } from '@/utils/toast';
import Button from '@/app/components/atoms/Button';
import Input from '@/app/components/atoms/Input';
import TextArea from '@/app/components/atoms/TextArea';
import { tokenUtils } from '@/utils/token';

export default function SolicitarFeriasPage() {
  const [formData, setFormData] = useState({
    dataInicio: '',
    dataFim: '',
    observacoes: ''
  });
  const [saldoFerias, setSaldoFerias] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingSaldo, setLoadingSaldo] = useState(true);

  useEffect(() => {
    loadSaldoFerias();
  }, []);

  const loadSaldoFerias = async () => {
    try {
      setLoadingSaldo(true);
      const userId = parseInt(tokenUtils.getId() || '0');
      const response = await feriasService.retornarSaldoFerias(userId);
      if (response.sucesso && response.saldoFerias) {
        setSaldoFerias(response.saldoFerias);
      }
    } catch (error) {
      showErrorToast('Erro ao carregar saldo de férias');
    } finally {
      setLoadingSaldo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.dataInicio || !formData.dataFim) {
      showErrorToast('Por favor, preencha todas as datas');
      return;
    }

    const dataInicio = new Date(formData.dataInicio);
    const dataFim = new Date(formData.dataFim);
    
    if (dataFim <= dataInicio) {
      showErrorToast('A data de fim deve ser posterior à data de início');
      return;
    }

    if (dataInicio <= new Date()) {
      showErrorToast('A data de início deve ser futura');
      return;
    }

    try {
      setLoading(true);
      const userId = parseInt(tokenUtils.getId() || '0');
      
      const solicitacao = {
        idUsuario: userId,
        dataInicio: formData.dataInicio,
        dataFim: formData.dataFim,
        observacoes: formData.observacoes
      };

      const response = await feriasService.cadastrarSolicitacaoFerias(solicitacao);
      
      if (response.sucesso) {
        showSuccessToast('Solicitação de férias enviada com sucesso');
        setFormData({
          dataInicio: '',
          dataFim: '',
          observacoes: ''
        });
      } else {
        showErrorToast(response.mensagem || 'Erro ao enviar solicitação');
      }
    } catch (error) {
      showErrorToast('Erro ao enviar solicitação de férias');
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = () => {
    if (!formData.dataInicio || !formData.dataFim) return 0;
    
    const dataInicio = new Date(formData.dataInicio);
    const dataFim = new Date(formData.dataFim);
    const diffTime = Math.abs(dataFim.getTime() - dataInicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    return diffDays;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loadingSaldo) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Carregando saldo de férias...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Solicitar Férias</h1>

      {/* Saldo de Férias */}
      {saldoFerias && (
        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-4">
            Seu Saldo de Férias
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-blue-600">Dias Disponíveis</p>
              <p className="text-2xl font-bold text-blue-800">
                {saldoFerias.saldoDias || 0} dias
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-600">Horas Disponíveis</p>
              <p className="text-2xl font-bold text-blue-800">
                {saldoFerias.saldoHoras || 0} horas
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Formulário de Solicitação */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Data de Início"
              type="date"
              value={formData.dataInicio}
              onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
              required
            />
            <Input
              label="Data de Fim"
              type="date"
              value={formData.dataFim}
              onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
              required
            />
          </div>

          {/* Resumo da Solicitação */}
          {formData.dataInicio && formData.dataFim && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Resumo da Solicitação
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Período:</p>
                  <p className="font-medium">
                    {formatDate(formData.dataInicio)} a {formatDate(formData.dataFim)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Total de dias:</p>
                  <p className="font-medium">{calculateDays()} dias</p>
                </div>
              </div>
            </div>
          )}

          <TextArea
            label="Observações (opcional)"
            value={formData.observacoes}
            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            rows={4}
            placeholder="Adicione observações sobre sua solicitação de férias..."
          />

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={loading || !formData.dataInicio || !formData.dataFim}
            >
              {loading ? 'Enviando...' : 'Enviar Solicitação'}
            </Button>
          </div>
        </form>
      </div>

      {/* Informações Importantes */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-yellow-800 mb-2">
          Informações Importantes
        </h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• As solicitações de férias devem ser feitas com antecedência mínima de 15 dias</li>
          <li>• O período de férias deve ser de no mínimo 14 dias consecutivos</li>
          <li>• Sua solicitação será analisada pela equipe de RH</li>
          <li>• Você receberá uma notificação sobre o status da sua solicitação</li>
        </ul>
      </div>
    </div>
  );
}
