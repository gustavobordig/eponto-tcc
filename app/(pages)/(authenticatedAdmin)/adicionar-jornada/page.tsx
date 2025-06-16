'use client';

import Container from '@/app/components/atoms/container';
import DefaultForm from '@/app/components/molecules/DefaultForm';
import { jornadaTrabalhoService } from '@/services/jornadaTrabalho';
import { showSuccessToast, showErrorToast } from '@/utils/toast';
import { useRouter } from 'next/navigation';

export default function AdicionarJornada() {
  const router = useRouter();

  const handleSubmit = async (data: Record<string, string>) => {
    try {
      const jornadaPayload = {
        nomeJornada: data.nome,
        qtdHorasDiarias: Number(data.horasMensais),
        teste: data.teste
      };

      await jornadaTrabalhoService.inserir(jornadaPayload);
      showSuccessToast('Jornada cadastrada com sucesso!');
      router.push('/dashboard/jornada-trabalho');
    } catch (error) {
      console.error('Erro ao cadastrar jornada:', error);
      showErrorToast('Erro ao cadastrar jornada. Tente novamente.');
    }
  };

  const formInputs = [
    {
      id: 'nome',
      label: 'Nome da Jornada',
      type: 'text' as const,
      placeholder: 'Digite o nome da jornada',
      required: true,
    },
    {
      id: 'horasMensais',
      label: 'Quantidade de Horas Diárias',
      type: 'number' as const,
      placeholder: 'Digite a quantidade de horas diárias',
      required: true,
    },
    {
      id: 'teste',
      label: 'Teste',
      type: 'text' as const,
      placeholder: 'Digite o teste',
      required: true,
    }
  ];

  return (
    <Container
      className='h-screen flex items-center justify-center'
    >
      <DefaultForm
        title="Adicionar Nova Jornada"
        inputs={formInputs}
        buttonText="Cadastrar Jornada"
        onSubmit={handleSubmit}
      />
    </Container>
  );
} 