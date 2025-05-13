'use client';

import Container from '@/app/components/atoms/container';
import DefaultForm from '@/app/components/molecules/DefaultForm';

export default function AdicionarCargo() {
  const handleSubmit = (data: Record<string, string>) => {
    // TODO: Implement the submission logic
    console.log('Form data:', data);
  };

  const formInputs = [
    {
      id: 'nome',
      label: 'Nome do Cargo',
      type: 'text' as const,
      placeholder: 'Digite o nome do cargo',
      required: true,
    },
    {
      id: 'salario',
      label: 'Salário',
      type: 'number' as const,
      placeholder: 'Digite o salário',
      required: true,
    },
  ];

  return (
    <Container
      className='h-screen flex items-center justify-center'
    >
      <DefaultForm
        title="Adicionar Novo Cargo"
        inputs={formInputs}
        buttonText="Cadastrar Cargo"
        onSubmit={handleSubmit}
      />
    </Container>
  );
}

