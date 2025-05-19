'use client';

import Container from '@/app/components/atoms/container';
import DefaultForm from '@/app/components/molecules/DefaultForm';
import { insertCargo } from '@/services/cargo';
import { showSuccessToast, showErrorToast } from '@/utils/toast';
import { useRouter } from 'next/navigation';

export default function AdicionarCargo() {
  const router = useRouter();

  const handleSubmit = async (data: Record<string, string>) => {
    try {
      const cargoPayload = {
        idCargo: 0,
        nomeCargo: data.nome,
        salario: data.salario,
        indAtivo: 1
      };

      await insertCargo(cargoPayload);
      showSuccessToast('Cargo cadastrado com sucesso!');
      router.push('/dashboard/cargos'); 
    } catch (error) {
      console.error('Erro ao cadastrar cargo:', error);
      showErrorToast('Erro ao cadastrar cargo. Tente novamente.');
    }
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

