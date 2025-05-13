'use client';

import DefaultForm from '@/app/components/molecules/DefaultForm';
import { regexPatterns } from '@/utils/regexPatterns';

export default function AdicionarUsuario() {
  const handleSubmit = (data: Record<string, string>) => {
    console.log('Form data:', data);
  };

  const formInputs = [
    {
      id: 'name',
      label: 'Nome',
      type: 'text' as const,
      placeholder: 'Digite o nome completo',
      regex: regexPatterns.name,
      required: true
    },
    {
      id: 'email',
      label: 'E-mail',
      type: 'email' as const,
      placeholder: 'Digite o e-mail',
      regex: regexPatterns.email,
      required: true
    },
    {
      id: 'password',
      label: 'Senha',
      type: 'password' as const,
      placeholder: 'Digite a senha',
      regex: regexPatterns.password,
      required: true
    }
  ];

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Adicionar Novo Usuário
          </h2>
        </div>
        <div className="mt-8">
          <DefaultForm
            title="Cadastro de Usuário"
            inputs={formInputs}
            buttonText="Cadastrar"
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
} 