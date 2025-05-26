'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/app/components/atoms/container';
import { insertCargo } from '@/services/cargo';
import { showErrorToast, showSuccessToast } from '@/utils/toast';

interface CargoPayload {
  idCargo: number;
  nomeCargo: string;
  salario: string;
  indAtivo: number;
}

export default function AdicionarCargo() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cargo, setCargo] = useState<CargoPayload>({
    idCargo: 0,
    nomeCargo: '',
    salario: '',
    indAtivo: 1
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await insertCargo(cargo);
      showSuccessToast('Cargo adicionado com sucesso!');
      router.push('/dashboard/cargos');
    } catch (error) {
      showErrorToast('Erro ao adicionar cargo. Tente novamente.');
      console.error('Erro ao adicionar cargo:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Adicionar Novo Cargo</h1>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="nomeCargo" className="block text-sm font-medium text-black">
              Nome do Cargo
            </label>
            <input
              type="text"
              id="nomeCargo"
              value={cargo.nomeCargo}
              onChange={(e) => setCargo({ ...cargo, nomeCargo: e.target.value })}
              className="text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="salario" className="block text-sm font-medium text-black">
              Salário
            </label>
            <input
              type="text"
              id="salario"
              value={cargo.salario}
              onChange={(e) => setCargo({ ...cargo, salario: e.target.value })}
              className="text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-black">
              Status
            </label>
            <select
              id="status"
              value={cargo.indAtivo}
              onChange={(e) => setCargo({ ...cargo, indAtivo: Number(e.target.value) })}
              className="text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value={1}>Ativo</option>
              <option value={0}>Inativo</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={() => router.push('/dashboard/cargos')}
            className="px-4 py-2 border border-gray-300 rounded-md text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="h-4 w-4 mr-2 border-t-2 border-white rounded-full animate-spin"></div>
                Salvando...
              </div>
            ) : (
              'Salvar'
            )}
          </button>
        </div>
      </div>
    </Container>
  );
} 