'use client';

import { useState, useEffect } from 'react';
import { feriasService } from '@/services/ferias';
import { showErrorToast } from '@/utils/toast';
import { tokenUtils } from '@/utils/token';
import Table from '@/app/components/atoms/Table';

interface SolicitacaoFerias {
  idSolicitacao: number;
  dataInicio: string;
  dataFim: string;
  status: number;
  observacoes?: string;
  dataSolicitacao: string;
}

export default function MinhasFeriasPage() {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoFerias[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSolicitacoes();
  }, []);

  const loadSolicitacoes = async () => {
    try {
      setLoading(true);
      const userId = parseInt(tokenUtils.getId() || '0');
      const response = await feriasService.listarSolicitacoesFerias(userId);
      
      if (response.sucesso && response.solicitacoes) {
        setSolicitacoes(response.solicitacoes);
      }
    } catch (error) {
      showErrorToast('Erro ao carregar suas solicitações de férias');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 0: return 'Pendente';
      case 1: return 'Aprovado';
      case 2: return 'Rejeitado';
      default: return 'Desconhecido';
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: return 'text-yellow-600 bg-yellow-100';
      case 1: return 'text-green-600 bg-green-100';
      case 2: return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const calculateDays = (dataInicio: string, dataFim: string) => {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    const diffTime = Math.abs(fim.getTime() - inicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Carregando suas solicitações de férias...</div>
      </div>
    );
  }

  const tableHeaders = ['Período', 'Dias', 'Status', 'Data da Solicitação', 'Observações'];
  const tableData = solicitacoes.map(solicitacao => [
    `${formatDate(solicitacao.dataInicio)} a ${formatDate(solicitacao.dataFim)}`,
    `${calculateDays(solicitacao.dataInicio, solicitacao.dataFim)} dias`,
    <span 
      key={solicitacao.idSolicitacao}
      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(solicitacao.status)}`}
    >
      {getStatusLabel(solicitacao.status)}
    </span>,
    formatDate(solicitacao.dataSolicitacao),
    solicitacao.observacoes || '-'
  ]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Minhas Solicitações de Férias</h1>
        <a 
          href="/solicitar-ferias"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Nova Solicitação
        </a>
      </div>

      {solicitacoes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma solicitação de férias encontrada
          </h3>
          <p className="text-gray-500 mb-4">
            Você ainda não fez nenhuma solicitação de férias.
          </p>
          <a 
            href="/solicitar-ferias"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Fazer Primeira Solicitação
          </a>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <Table headers={tableHeaders} data={tableData} />
        </div>
      )}

      {/* Estatísticas */}
      {solicitacoes.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm font-medium text-gray-500">Total de Solicitações</h3>
            <p className="text-2xl font-bold text-gray-900">{solicitacoes.length}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm font-medium text-gray-500">Aprovadas</h3>
            <p className="text-2xl font-bold text-green-600">
              {solicitacoes.filter(s => s.status === 1).length}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm font-medium text-gray-500">Pendentes</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {solicitacoes.filter(s => s.status === 0).length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
