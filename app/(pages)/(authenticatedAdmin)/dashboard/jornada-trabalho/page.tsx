'use client';

import { useEffect, useState } from 'react';
import Container from '@/app/components/atoms/container';
import { jornadaTrabalhoService } from '@/services/jornadaTrabalho';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import Button from '@/app/components/atoms/Button';
import { useRouter } from 'next/navigation';

interface JornadaTrabalho {
  idJornada: number;
  nomeJornada: string;
  qtdHorasMensais: number;
  indAtivo: number;
}

interface ApiResponse {
  sucesso: boolean;
  mensagem: string | null;
  jornada: JornadaTrabalho | null;
  jornadas: JornadaTrabalho[];
}

export default function JornadaTrabalhoPage() {
  const [jornadas, setJornadas] = useState<JornadaTrabalho[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [jornadaToDelete, setJornadaToDelete] = useState<number | null>(null);
  const [jornadaToEdit, setJornadaToEdit] = useState<JornadaTrabalho | null>(null);
  const [editedNomeJornada, setEditedNomeJornada] = useState('');
  const [editedQtdHorasMensais, setEditedQtdHorasMensais] = useState('');
  const [editedStatus, setEditedStatus] = useState(1);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const router = useRouter();

  const fetchJornadas = async () => {
    try {
      const response = await jornadaTrabalhoService.listar() as ApiResponse;
      setJornadas(response.jornadas || []);
    } catch (error) {
      showErrorToast('Erro ao carregar jornadas');
      console.error('Erro ao carregar jornadas:', error);
      setJornadas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJornadas();
  }, []);

  const handleEdit = (jornada: JornadaTrabalho) => {
    setJornadaToEdit(jornada);
    setEditedNomeJornada(jornada.nomeJornada);
    setEditedQtdHorasMensais(jornada.qtdHorasMensais.toString());
    setEditedStatus(jornada.indAtivo);
    setIsEditModalOpen(true);
  };

  const handleEditClose = () => {
    setIsEditModalOpen(false);
    setJornadaToEdit(null);
    setEditedNomeJornada('');
    setEditedQtdHorasMensais('');
    setEditedStatus(1);
  };

  const handleEditConfirm = async () => {
    if (!jornadaToEdit) return;

    setEditLoading(true);
    try {
      const updatedJornada: JornadaTrabalho = {
        idJornada: jornadaToEdit.idJornada,
        nomeJornada: editedNomeJornada,
        qtdHorasMensais: Number(editedQtdHorasMensais),
        indAtivo: editedStatus
      };

      await jornadaTrabalhoService.atualizar(jornadaToEdit.idJornada, updatedJornada);
      showSuccessToast('Jornada atualizada com sucesso!');
      fetchJornadas();
      handleEditClose();
    } catch (error) {
      showErrorToast('Erro ao atualizar jornada. Tente novamente.');
      console.error('Erro ao atualizar jornada:', error);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteClick = (idJornada: number) => {
    setJornadaToDelete(idJornada);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!jornadaToDelete) {
      showErrorToast('ID da jornada não encontrado');
      setIsDeleteModalOpen(false);
      setJornadaToDelete(null);
      return;
    }
    
    setDeleteLoading(true);
    try {
      await jornadaTrabalhoService.deletar(jornadaToDelete);
      showSuccessToast('Jornada excluída com sucesso!');
      fetchJornadas();
    } catch (error) {
      showErrorToast('Erro ao excluir jornada. Tente novamente.');
      console.error('Erro ao excluir jornada:', error);
    } finally {
      setDeleteLoading(false);
      setIsDeleteModalOpen(false);
      setJornadaToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setJornadaToDelete(null);
  };

  if (loading) {
    return (
      <Container className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando jornadas...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Lista de Jornadas de Trabalho</h1>
          <div className="w-[200px]">
            <Button
              text="Adicionar Jornada"
              backgroundColor="bg-indigo-600"
              textColor="text-white"
              onClick={() => router.push('/adicionar-jornada')}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome da Jornada
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Horas Mensais
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jornadas.map((jornada) => (
                <tr key={jornada.idJornada} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {jornada.idJornada}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {jornada.nomeJornada}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {jornada.qtdHorasMensais} horas
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        jornada.indAtivo === 1
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {jornada.indAtivo === 1 ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(jornada)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteClick(jornada.idJornada)}
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

        {jornadas.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhuma jornada cadastrada.</p>
          </div>
        )}
      </div>

      {/* Modal de edição */}
      {isEditModalOpen && jornadaToEdit && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Editar Jornada</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="nomeJornada" className="block text-sm font-medium text-black">
                  Nome da Jornada
                </label>
                <input
                  type="text"
                  id="nomeJornada"
                  value={editedNomeJornada}
                  onChange={(e) => setEditedNomeJornada(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                />
              </div>
              <div>
                <label htmlFor="qtdHorasMensais" className="block text-sm font-medium text-black">
                  Quantidade de Horas Mensais
                </label>
                <input
                  type="number"
                  id="qtdHorasMensais"
                  value={editedQtdHorasMensais}
                  onChange={(e) => setEditedQtdHorasMensais(e.target.value)}
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
            <p className="text-gray-500 mb-6">
              Tem certeza que deseja excluir esta jornada? Esta ação não pode ser desfeita.
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