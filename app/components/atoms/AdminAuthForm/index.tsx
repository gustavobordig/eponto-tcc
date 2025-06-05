'use client';

import DefaultForm from '@/app/components/molecules/DefaultForm';

interface AdminAuthFormProps {
  onAuthenticate: (isAuthenticated: boolean) => void;
}

export function AdminAuthForm({ onAuthenticate }: AdminAuthFormProps) {
  const handleSubmit = (data: Record<string, string>) => {
    if (data.password === '123') {
      onAuthenticate(true);
      localStorage.setItem('adminAuthenticated', 'true');
    } else {
      onAuthenticate(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <DefaultForm
        title="Acesso Administrativo"
        inputs={[
          {
            id: 'password',
            label: 'Senha',
            type: 'password',
            placeholder: 'Digite a senha para acessar a área administrativa',
            required: true
          }
        ]}
        buttonText="Entrar"
        onSubmit={handleSubmit}
      />
    </div>
  );
} 