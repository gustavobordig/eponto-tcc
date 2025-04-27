'use client';

import UserForm from '../../../components/UserForm';

export default function AdicionarUsuario() {
  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Adicionar Novo Usuário
          </h2>
        </div>
        <div className="mt-8">
          <UserForm />
        </div>
      </div>
    </div>
  );
} 