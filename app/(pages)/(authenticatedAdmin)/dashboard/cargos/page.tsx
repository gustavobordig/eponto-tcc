'use client';

import { useEffect, useState } from 'react';
import Container from '@/app/components/atoms/container';
import { listCargos, deleteCargo, updateCargo } from '@/services/cargo';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import Button from '@/app/components/atoms/Button';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2 } from 'lucide-react';

interface Cargo {
  idCargo: number;
  nomeCargo: string;
  salario: string;
  indAtivo: number;
}

interface ApiResponse {
  sucesso: boolean;
  mensagem: string | null;
  cargo: Cargo | null;
  cargos: Cargo[];
}

export default function CargosPage() {
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [cargoToDelete, setCargoToDelete] = useState<number | null>(null);
  const [cargoToEdit, setCargoToEdit] = useState<Cargo | null>(null);
  const [editedNomeCargo, setEditedNomeCargo] = useState('');
  const [editedSalario, setEditedSalario] = useState('');
  const [editedStatus, setEditedStatus] = useState(1);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const router = useRouter();

  const fetchCargos = async () => {
    try {
      const response = await listCargos() as ApiResponse;
      setCargos(response.cargos || []);
    } catch (error) {
      showErrorToast('Erro ao carregar cargos');
      console.error('Erro ao carregar cargos:', error);
      setCargos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCargos();
  }, []);

  const handleEdit = (cargo: Cargo) => {
    setCargoToEdit(cargo);
    setEditedNomeCargo(cargo.nomeCargo);
    setEditedSalario(cargo.salario);
    setEditedStatus(cargo.indAtivo);
    setIsEditModalOpen(true);
  };

  const handleEditClose = () => {
    setIsEditModalOpen(false);
    setCargoToEdit(null);
    setEditedNomeCargo('');
    setEditedSalario('');
    setEditedStatus(1);
  };

  const handleEditConfirm = async () => {
    if (!cargoToEdit) return;

    setEditLoading(true);
    try {
      const updatedCargo: Cargo = {
        idCargo: cargoToEdit.idCargo,
        nomeCargo: editedNomeCargo,
        salario: editedSalario,
        indAtivo: editedStatus
      };

      await updateCargo(updatedCargo);
      showSuccessToast('Cargo atualizado com sucesso!');
      fetchCargos();
      handleEditClose();
    } catch (error) {
      showErrorToast('Erro ao atualizar cargo. Tente novamente.');
      console.error('Erro ao atualizar cargo:', error);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteClick = (idCargo: number) => {
    setCargoToDelete(idCargo);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!cargoToDelete) {
      showErrorToast('ID do cargo não encontrado');
      setIsDeleteModalOpen(false);
      setCargoToDelete(null);
      return;
    }
    
    setDeleteLoading(true);
    try {
      await deleteCargo(cargoToDelete);
      showSuccessToast('Cargo excluído com sucesso!');
      fetchCargos();
    } catch (error) {
      showErrorToast('Erro ao excluir cargo. Tente novamente.');
      console.error('Erro ao excluir cargo:', error);
    } finally {
      setDeleteLoading(false);
      setIsDeleteModalOpen(false);
      setCargoToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setCargoToDelete(null);
  };

  if (loading) {
    return (
      <Container className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando cargos...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Lista de Cargos</h1>
          <div className="w-[200px]">
            <Button
              text="Adicionar Cargo"
              backgroundColor="bg-indigo-600"
              textColor="text-white"
              onClick={() => router.push('/adicionar-cargo')}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Nome do Cargo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Salário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cargos.map((cargo) => (
                <tr key={cargo.idCargo} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    {cargo.idCargo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {cargo.nomeCargo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    R$ {cargo.salario}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        cargo.indAtivo === 1
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {cargo.indAtivo === 1 ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(cargo)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteClick(cargo.idCargo)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {cargos.length === 0 && (
          <div className="text-center py-8">
            <p className="text-black">Nenhum cargo cadastrado.</p>
          </div>
        )}
      </div>

      {/* Modal de edição */}
      {isEditModalOpen && cargoToEdit && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Editar Cargo</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="nomeCargo" className="block text-sm font-medium text-black">
                  Nome do Cargo
                </label>
                <input
                  type="text"
                  id="nomeCargo"
                  value={editedNomeCargo}
                  onChange={(e) => setEditedNomeCargo(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                />
              </div>
              <div>
                <label htmlFor="salario" className="block text-sm font-medium text-black">
                  Salário
                </label>
                <input
                  type="text"
                  id="salario"
                  value={editedSalario}
                  onChange={(e) => setEditedSalario(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                />
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-black">
                  Status
                </label>
                <select
                  id="status"
                  value={editedStatus}
                  onChange={(e) => setEditedStatus(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                >
                  <option value={1} className='text-black'>Ativo</option>
                  <option value={0} className='text-black'>Inativo</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={handleEditClose}
                disabled={editLoading}
                className="px-4 py-2 border border-gray-300 rounded-md text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancelar
              </button>
              <button
                onClick={handleEditConfirm}
                disabled={editLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {editLoading ? (
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
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmar exclusão</h3>
            <p className="text-black mb-6">
              Tem certeza que deseja excluir este cargo? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCancelDelete}
                disabled={deleteLoading}
                className="px-4 py-2 border border-gray-300 rounded-md text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {deleteLoading ? (
                  <div className="flex items-center">
                    <div className="h-4 w-4 mr-2 border-t-2 border-white rounded-full animate-spin"></div>
                    Excluindo...
                  </div>
                ) : (
                  'Excluir'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
} 