'use client';

import { useState, useEffect } from 'react';
import { feriasService } from '@/services/ferias';
import { userService } from '@/services/user';
import { showErrorToast } from '@/utils/toast';
import Select from '@/app/components/atoms/Select';
import Button from '@/app/components/atoms/Button';

interface SaldoFerias {
  idUsuario: number;
  nomeUsuario: string;
  saldoDias: number;
  saldoHoras: number;
  diasVencidos: number;
}

interface Usuario {
  idUsuario: number;
  nome: string;
}

export default function SaldoFeriasPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [saldoFerias, setSaldoFerias] = useState<SaldoFerias | null>(null);
  const [selectedUsuario, setSelectedUsuario] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    try {
      setLoadingUsuarios(true);
      const response = await userService.getAll();
      if (response.sucesso && response.usuarios) {
        setUsuarios(response.usuarios);
      }
    } catch (error) {
      showErrorToast('Erro ao carregar usuários');
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const loadSaldoFerias = async () => {
    if (!selectedUsuario) return;
    
    try {
      setLoading(true);
      const response = await feriasService.retornarSaldoFerias(selectedUsuario);
      if (response.sucesso && response.saldoFerias) {
        setSaldoFerias(response.saldoFerias);
      } else {
        setSaldoFerias(null);
        showErrorToast(response.mensagem || 'Erro ao carregar saldo de férias');
      }
    } catch (error) {
      showErrorToast('Erro ao carregar saldo de férias');
      setSaldoFerias(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUsuarioChange = (value: string) => {
    setSelectedUsuario(value === '' ? '' : parseInt(value));
    setSaldoFerias(null);
  };

  const usuarioOptions = [
    { value: '', label: 'Selecione um usuário' },
    ...usuarios.map(usuario => ({
      value: usuario.idUsuario.toString(),
      label: usuario.nome
    }))
  ];

  if (loadingUsuarios) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Carregando usuários...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Saldo de Férias</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <Select
              label="Selecionar Usuário"
              value={selectedUsuario}
              onChange={(e) => handleUsuarioChange(e.target.value)}
              options={usuarioOptions}
            />
          </div>
          <Button
            onClick={loadSaldoFerias}
            disabled={!selectedUsuario || loading}
          >
            {loading ? 'Carregando...' : 'Consultar Saldo'}
          </Button>
        </div>
      </div>

      {saldoFerias && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            Saldo de Férias - {saldoFerias.nomeUsuario}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-blue-800 mb-2">
                Saldo em Dias
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {saldoFerias.saldoDias}
              </p>
              <p className="text-sm text-blue-600 mt-1">dias disponíveis</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-green-800 mb-2">
                Saldo em Horas
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {saldoFerias.saldoHoras}
              </p>
              <p className="text-sm text-green-600 mt-1">horas disponíveis</p>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-orange-800 mb-2">
                Dias Vencidos
              </h3>
              <p className="text-3xl font-bold text-orange-600">
                {saldoFerias.diasVencidos}
              </p>
              <p className="text-sm text-orange-600 mt-1">dias vencidos</p>
            </div>
          </div>

          {saldoFerias.diasVencidos > 0 && (
            <div className="mt-6 p-4 bg-orange-100 border border-orange-300 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-orange-700">
                    <strong>Atenção:</strong> Este funcionário possui {saldoFerias.diasVencidos} dias de férias vencidos.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedUsuario && !saldoFerias && !loading && (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-500">Nenhum saldo de férias encontrado para este usuário.</p>
        </div>
      )}
    </div>
  );
}
