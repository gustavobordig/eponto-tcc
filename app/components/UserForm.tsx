'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { userService } from '@/services/user';
import { showSuccessToast, showErrorToast } from '@/utils/toast';

export default function 
UserForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    dataNascimento: '',
    senha: '',
    email: '',
    telefone: '',
    idCargo: '',
    idJornada: '',
    teste: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Formata a data para o formato YYYY-MM-DD
      const dataObj = new Date(formData.dataNascimento);
      const dataFormatada = dataObj.toISOString().split('T')[0]; // Extrai apenas a parte da data (YYYY-MM-DD)
      
      const userData = {
        ...formData,
        dataNascimento: dataFormatada,
        telefone: parseInt(formData.telefone),
        idCargo: parseInt(formData.idCargo),
        idJornada: parseInt(formData.idJornada),
        teste: formData.teste
      };
      
      const response = await userService.create(userData);
      
      if (response.sucesso) {
        showSuccessToast('Usuário cadastrado com sucesso!');
        router.push('/dashboard');
      } else {
        showErrorToast(response.mensagem || 'Erro ao cadastrar usuário');
      }
    } catch (error) {
      console.error('Erro:', error);
      showErrorToast('Erro ao cadastrar usuário. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Nome</label>
        <input
          type="text"
          name="nome"
          value={formData.nome}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-4 text-black"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Data de Nascimento</label>
        <input
          type="date"
          name="dataNascimento"
          value={formData.dataNascimento}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-4 text-black"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Senha</label>
        <input
          type="password"
          name="senha"
          value={formData.senha}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-4 text-black"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-4 text-black"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Telefone</label>
        <input
          type="number"
          name="telefone"
          value={formData.telefone}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-4 text-black"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">ID do Cargo</label>
        <input
          type="number"
          name="idCargo"
          value={formData.idCargo}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-4 text-black"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">ID da Jornada</label>
        <input
          type="number"
          name="idJornada"
          value={formData.idJornada}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-4 text-black"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Teste</label>
        <input
          name="teste"
          value={formData.teste}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-4 text-black"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 p-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="flex items-center">
            <div className="h-5 w-5 mr-2 border-t-2 border-white rounded-full animate-spin"></div>
            Cadastrando...
          </div>
        ) : (
          'Adicionar Usuário'
        )}
      </button>
    </form>
  );
} 