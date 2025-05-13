'use client';

import { useState, useEffect } from 'react';
import { userService } from '@/services/user';
import { tokenUtils } from '@/utils/token';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import ConfirmationModal from '@/app/components/atoms/ConfirmationModal';

interface UserData {
  idUsuario: number;
  nome: string;
  dataNascimento: string;
  senha: string;
  email: string;
  telefone: number;
  idCargo: number;
  idJornada: number;
  indAtivo: number;
  teste: string;
}

export default function PerfilPage() {
  const [userData, setUserData] = useState<UserData>({
    idUsuario: 0,
    nome: '',
    dataNascimento: '',
    senha: '',
    email: '',
    telefone: 0,
    idCargo: 0,
    idJornada: 0,
    indAtivo: 1,
    teste: '',
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userId = tokenUtils.getId();
        
        if (!userId) {
          showErrorToast("Usuário não encontrado");
          return;
        }

        const response = await userService.getById(Number(userId));
        
        if (response.sucesso && response.usuario) {
          setUserData(response.usuario);
        } else {
          showErrorToast("Erro ao carregar dados do usuário");
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showErrorToast("Erro ao carregar dados do usuário");
      }
    };

    loadUserData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: name === 'telefone' || name === 'idCargo' || name === 'idJornada' 
        ? Number(value) 
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handleConfirmUpdate = async () => {
    try {
      const userId = tokenUtils.getId();
      
      if (!userId) {
        showErrorToast("Usuário não encontrado");
        return;
      }

      const response = await userService.update(userData);
      
      if (response.sucesso) {
        showSuccessToast("Dados atualizados com sucesso!");
      } else {
        showErrorToast(response.mensagem || "Erro ao atualizar dados");
      }
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      showErrorToast("Erro ao atualizar dados do usuário");
    } finally {
      setIsModalOpen(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Perfil do Usuário
            </h3>
            <form onSubmit={handleSubmit} className="mt-5 space-y-6">
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
                  Nome
                </label>
                <input
                  type="text"
                  name="nome"
                  id="nome"
                  value={userData.nome}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-700"
                />
              </div>

              <div>
                <label htmlFor="dataNascimento" className="block text-sm font-medium text-gray-700">
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  name="dataNascimento"
                  id="dataNascimento"
                  value={userData.dataNascimento.split('T')[0]}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-700"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={userData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-700"
                />
              </div>

              <div>
                <label htmlFor="senha" className="block text-sm font-medium text-gray-700">
                  Senha
                </label>
                <input
                  type="password"
                  name="senha"
                  id="senha"
                  value=""
                  placeholder="Digite a nova senha"
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-700"
                />
              </div>

              <div>
                <label htmlFor="telefone" className="block text-sm font-medium text-gray-700">
                  Telefone
                </label>
                <input
                  type="tel"
                  name="telefone"
                  id="telefone"
                  value={userData.telefone}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-700"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmUpdate}
        title="Confirmar Atualização"
        message="Tem certeza que deseja atualizar seus dados?"
        confirmText="Confirmar"
        cancelText="Cancelar"
      />
    </div>
  );
} 