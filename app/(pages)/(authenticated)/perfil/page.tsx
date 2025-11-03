'use client';

import { useState, useEffect, useRef } from 'react';
import { userService } from '@/services/user';
import { tokenUtils } from '@/utils/token';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import ConfirmationModal from '@/app/components/atoms/ConfirmationModal';
import ContractualInfo from '@/app/components/atoms/ContractualInfo';

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
  fotoPerfil?: string;
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
    fotoPerfil: '',
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        const userId = tokenUtils.getId();
        
        if (!userId) {
          showErrorToast("Usuário não encontrado");
          return;
        }

        const response = await userService.getById(Number(userId));
        
        if (response.sucesso && response.usuario) {
          let fotoPerfilData = response.usuario.fotoPerfil || '';

          // If the image from the DB is raw base64, add the data URI prefix to display it
          if (fotoPerfilData && !fotoPerfilData.startsWith('data:image')) {
            fotoPerfilData = `data:image/jpeg;base64,${fotoPerfilData}`;
          }

          const userWithPhoto = {
            ...response.usuario,
            fotoPerfil: fotoPerfilData,
          };

          setUserData(userWithPhoto);
          setPreviewImage(fotoPerfilData);
          
          // Salvar a foto no localStorage para uso na NavBar
          if (fotoPerfilData) {
            localStorage.setItem('userProfilePhoto', fotoPerfilData);
          }
        } else {
          showErrorToast("Erro ao carregar dados do usuário");
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showErrorToast("Erro ao carregar dados do usuário");
      } finally {
        setIsLoading(false);
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setPreviewImage(result);
        setUserData(prev => ({
          ...prev,
          fotoPerfil: result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    console.log('Botão de alterar imagem clicado');
    console.log('Referência do input:', fileInputRef.current);
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handleConfirmUpdate = async () => {
    try {
      setIsLoading(true);
      const userId = tokenUtils.getId();
      
      if (!userId) {
        showErrorToast("Usuário não encontrado");
        return;
      }

      // Prepare data for submission
      const dataToSend = { ...userData };

      // Backend expects raw base64, so we remove the data URI prefix before sending
      if (dataToSend.fotoPerfil && dataToSend.fotoPerfil.startsWith('data:image')) {
        dataToSend.fotoPerfil = dataToSend.fotoPerfil.split(',')[1];
      }

      const response = await userService.update(dataToSend);
      
      if (response.sucesso) {
        // Salvar a foto no localStorage para uso na NavBar
        if (userData.fotoPerfil) {
          localStorage.setItem('userProfilePhoto', userData.fotoPerfil);
        }
        showSuccessToast("Dados atualizados com sucesso!");
      } else {
        showErrorToast(response.mensagem || "Erro ao atualizar dados");
      }
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      showErrorToast("Erro ao atualizar dados do usuário");
    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  if (isLoading && !userData.nome) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r bg-[#002085] px-6 py-8 text-white">
            <h1 className="text-3xl font-bold">Bem vindo, {userData.nome}</h1>
            <p className="text-indigo-100 mt-2">Gerencie suas informações pessoais</p>
          </div>

          <div className="p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Foto de Perfil */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative group">
                  <div
                    className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 cursor-pointer group-hover:border-indigo-300 transition-all duration-300 shadow-lg bg-gray-200 flex items-center justify-center"
                    onClick={handleImageClick}
                  >
                    {previewImage ? (
                      <img
                        key={previewImage}
                        src={previewImage}
                        width={128}
                        height={128}
                        className="w-full h-full object-cover absolute z-10 rounded-full
                        border-4 border-[#002085]"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <svg className="w-24 h-24 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div 
                    onClick={handleImageClick}
                    className="absolute inset-0 bg-gray-500 bg-opacity-0 group-hover:bg-opacity-20 rounded-full transition-all duration-300 flex items-center justify-center cursor-pointer">
                    <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={handleImageClick}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200 cursor-pointer"
                >
                  Alterar foto
                </button>
              </div>

              {/* Informações Contratuais */}
              {/* <div className="mb-8">
                <ContractualInfo userId={userData.idUsuario} />
              </div> */}

              {/* Informações Pessoais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="nome" className="block text-sm font-semibold text-gray-700">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    name="nome"
                    id="nome"
                    value={userData.nome}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white placeholder-gray-700 text-gray-700"
                    placeholder="Digite seu nome completo"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="dataNascimento" className="block text-sm font-semibold text-gray-700">
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    name="dataNascimento"
                    id="dataNascimento"
                    value={userData.dataNascimento.split('T')[0]}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white placeholder-gray-700 text-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={userData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white placeholder-gray-700 text-gray-700"
                    placeholder="seu@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="telefone" className="block text-sm font-semibold text-gray-700">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    name="telefone"
                    id="telefone"
                    value={userData.telefone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white placeholder-gray-700 text-gray-700"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              {/* Senha */}
              <div className="space-y-2">
                <label htmlFor="senha" className="block text-sm font-semibold text-gray-700">
                  Nova Senha
                </label>
                <input
                  type="password"
                  name="senha"
                  id="senha"
                  value=""
                  placeholder="Deixe em branco para manter a senha atual"
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent 
                  transition-all duration-200 bg-white placeholder-gray-400 text-gray-700"
                />
                <p className="text-xs text-gray-500">Digite uma nova senha apenas se desejar alterá-la</p>
              </div>

              {/* Botões */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 sm:flex-none px-8 py-3 text-white font-semibold rounded-lg cursor-pointer opacity-80
                   hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all 
                   duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg bg-[#002085]"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Salvando...
                    </div>
                  ) : (
                    'Salvar Alterações'
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="flex-1 sm:flex-none px-8 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg cursor-pointer opacity-80
                  hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                >
                  Cancelar
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