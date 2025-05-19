'use client';

import { useState, useEffect } from 'react';
import { userService, UserData } from '@/services/user';
import { showSuccessToast, showErrorToast } from '@/utils/toast';
import EditUserModal from '@/app/components/atoms/EditUserModal';
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Clock, 
  Pencil, 
  Trash2, 
  Users,
  UserX,
} from 'lucide-react';
import Button from '@/app/components/atoms/Button';
import { useRouter } from 'next/navigation';

export default function Dashboard() {

  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  const [userToEdit, setUserToEdit] = useState<UserData | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await userService.getAll();
      if (response.sucesso && response.usuarios) {
        setUsers(response.usuarios);
      } else {
        setError('Não foi possível carregar os usuários');
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      setError('Erro ao carregar os usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (user: UserData) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    console.log("userToDelete: ", userToDelete);

    console.log("userToDelete.id: ", userToDelete?.idUsuario);

    if (!userToDelete || !userToDelete.idUsuario) {
      showErrorToast('ID do usuário não encontrado');
      setShowDeleteModal(false);
      setUserToDelete(null);
      return;
    }
    
    setDeleteLoading(true);
    try {
      const response = await userService.delete(userToDelete.idUsuario);
      
      if (response.sucesso) { 
        showSuccessToast('Usuário excluído com sucesso!');
        fetchUsers();
        window.location.reload();
      } else {
        showErrorToast(response.mensagem || 'Erro ao excluir usuário');
      }
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      showErrorToast('Erro ao excluir usuário. Tente novamente.');
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const handleEditClick = (user: UserData) => {
    setUserToEdit(user);
    setShowEditModal(true);
  };

  const handleEditClose = () => {
    setShowEditModal(false);
    setUserToEdit(null);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Carregando...</span>
          </div>
          <p className="mt-4 text-lg font-semibold text-gray-700">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Users className="h-8 w-8 text-indigo-600" />
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Dashboard de Usuários
            </h2>
          </div>
          <div className="w-[200px]">
            <Button
              text="Adicionar Usuário"
              backgroundColor="bg-indigo-600"
              textColor="text-white"
              onClick={() => router.push('/adicionar-usuario')}
            />
          </div>
        </div>

        {error ? (
          <div className="mt-8 text-center text-red-600">{error}</div>
        ) : (
          <div className="mt-8 flex flex-col">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            Nome
                          </div>
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            Email
                          </div>
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            Telefone
                          </div>
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-gray-500" />
                            Cargo
                          </div>
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            Jornada
                          </div>
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Teste
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {users.map((user, index) => (
                        <tr key={index} className={user.indAtivo === 0 ? "bg-gray-100" : ""}>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                            {user.nome}
                            {user.indAtivo === 0 && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                <UserX className="h-3 w-3 mr-1" />
                                Desligado
                              </span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                            {user.email}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                            {user.telefone}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                            {user.idCargo}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                            {user.idJornada}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                            kkkkk {user.teste}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                            <div className="flex space-x-4">
                              <button
                                onClick={() => handleEditClick(user)}
                                className="text-indigo-600 hover:text-indigo-900 font-medium flex items-center gap-1"
                              >
                                <Pencil className="h-4 w-4" />
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteClick(user)}
                                className="text-red-600 hover:text-red-900 font-medium flex items-center gap-1"
                              >
                                <Trash2 className="h-4 w-4" />
                                Excluir
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmação de exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmar exclusão</h3>
            <p className="text-gray-500 mb-6">
              Tem certeza que deseja excluir o usuário <span className="font-semibold">{userToDelete?.nome}</span>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCancelDelete}
                disabled={deleteLoading}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
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

      {/* Modal de edição */}
      {userToEdit && (
        <EditUserModal
          user={userToEdit}
          isOpen={showEditModal}
          onClose={handleEditClose}
          onUpdate={fetchUsers}
        />
      )}
    </div>
  );
} 