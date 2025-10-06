'use client';

import { useState, useEffect } from 'react';
import { bancoHorasService } from '@/services/bancoHoras';
import { userService } from '@/services/user';
import { showErrorToast } from '@/utils/toast';
import Select from '@/app/components/atoms/Select';
import Button from '@/app/components/atoms/Button';

interface Usuario {
  idUsuario: number;
  nome: string;
}

interface RelatorioHoras {
  mes: string;
  horasTrabalhadas: number;
  horasExtras: number;
  saldoHoras: number;
}

export default function RelatorioHorasPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [selectedUsuario, setSelectedUsuario] = useState<number | ''>('');
  const [relatorioHoras, setRelatorioHoras] = useState<RelatorioHoras | null>(null);
  const [relatorioExtras, setRelatorioExtras] = useState<RelatorioHoras | null>(null);
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

  const loadRelatorios = async () => {
    if (!selectedUsuario) return;
    
    try {
      setLoading(true);
      
      // Carregar horas trabalhadas por mês
      const responseHoras = await bancoHorasService.obterHorasTrabalhadasMes(selectedUsuario);
      if (responseHoras.sucesso && responseHoras.bancoHoras && responseHoras.bancoHoras.length > 0) {
        const ultimoRegistro = responseHoras.bancoHoras[responseHoras.bancoHoras.length - 1];
        setRelatorioHoras({
          mes: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
          horasTrabalhadas: parseFloat(ultimoRegistro.horasTrabalhadas) || 0,
          horasExtras: 0,
          saldoHoras: parseFloat(ultimoRegistro.saldo) || 0
        });
      }

      // Carregar horas extras por mês
      const responseExtras = await bancoHorasService.obterHorasExtrasMes(selectedUsuario);
      if (responseExtras.sucesso && responseExtras.bancoHoras && responseExtras.bancoHoras.length > 0) {
        const ultimoRegistro = responseExtras.bancoHoras[responseExtras.bancoHoras.length - 1];
        setRelatorioExtras({
          mes: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
          horasTrabalhadas: 0,
          horasExtras: parseFloat(ultimoRegistro.horasTrabalhadas) || 0,
          saldoHoras: parseFloat(ultimoRegistro.saldo) || 0
        });
      }
    } catch (error) {
      showErrorToast('Erro ao carregar relatórios de horas');
    } finally {
      setLoading(false);
    }
  };

  const handleUsuarioChange = (value: string) => {
    setSelectedUsuario(value === '' ? '' : parseInt(value));
    setRelatorioHoras(null);
    setRelatorioExtras(null);
  };

  const usuarioOptions = [
    { value: '', label: 'Selecione um usuário' },
    ...usuarios.map(usuario => ({
      value: usuario.idUsuario.toString(),
      label: usuario.nome
    }))
  ];

  const formatHours = (hours: number) => {
    const hoursInt = Math.floor(hours);
    const minutes = Math.round((hours - hoursInt) * 60);
    return `${hoursInt}h ${minutes.toString().padStart(2, '0')}min`;
  };

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
        <h1 className="text-2xl font-bold">Relatório de Horas</h1>
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
            onClick={loadRelatorios}
            disabled={!selectedUsuario || loading}
          >
            {loading ? 'Carregando...' : 'Gerar Relatório'}
          </Button>
        </div>
      </div>

      {relatorioHoras && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Relatório de Horas Trabalhadas */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">
              Horas Trabalhadas - {relatorioHoras.mes}
            </h2>
            
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-blue-800 mb-2">
                  Total de Horas Trabalhadas
                </h3>
                <p className="text-3xl font-bold text-blue-600">
                  {formatHours(relatorioHoras.horasTrabalhadas)}
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-green-800 mb-2">
                  Saldo de Horas
                </h3>
                <p className="text-3xl font-bold text-green-600">
                  {formatHours(relatorioHoras.saldoHoras)}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  {relatorioHoras.saldoHoras >= 0 ? 'Saldo positivo' : 'Saldo negativo'}
                </p>
              </div>
            </div>
          </div>

          {/* Relatório de Horas Extras */}
          {relatorioExtras && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-orange-800">
                Horas Extras - {relatorioExtras.mes}
              </h2>
              
              <div className="space-y-4">
                <div className="bg-orange-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-orange-800 mb-2">
                    Total de Horas Extras
                  </h3>
                  <p className="text-3xl font-bold text-orange-600">
                    {formatHours(relatorioExtras.horasExtras)}
                  </p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-purple-800 mb-2">
                    Saldo de Horas Extras
                  </h3>
                  <p className="text-3xl font-bold text-purple-600">
                    {formatHours(relatorioExtras.saldoHoras)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedUsuario && !relatorioHoras && !loading && (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-500">Nenhum relatório de horas encontrado para este usuário.</p>
        </div>
      )}
    </div>
  );
}
