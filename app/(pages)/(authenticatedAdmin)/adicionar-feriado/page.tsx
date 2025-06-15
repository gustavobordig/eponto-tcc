'use client';

import { useState } from 'react';
import Container from '@/app/components/atoms/container';
import DefaultForm from '@/app/components/molecules/DefaultForm';
import { feriadoService } from '@/services/feriado';
import { showSuccessToast, showErrorToast } from '@/utils/toast';
import { useRouter } from 'next/navigation';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export default function AdicionarFeriado() {
  const router = useRouter();
  const [selectedTipo, setSelectedTipo] = useState<string>('');

  const handleSubmit = async (data: Record<string, string>) => {
    try {
      // Format date to include time component
      const dataFeriado = new Date(data.dataFeriado);
      dataFeriado.setUTCHours(0, 0, 0, 0);

      const feriadoPayload = {
        dscFeriado: data.descricao,
        datFeriado: dataFeriado.toISOString(),
        indTipoFeriado: parseInt(data.tipoFeriado)
      };

      await feriadoService.cadastrarFeriado(feriadoPayload);
      showSuccessToast('Feriado cadastrado com sucesso!');
      router.push('/dashboard/feriados');
    } catch (error) {
      console.error('Erro ao cadastrar feriado:', error);
      showErrorToast('Erro ao cadastrar feriado. Tente novamente.');
    }
  };

  const formInputs = [
    {
      id: 'descricao',
      label: 'Descrição',
      type: 'text' as const,
      placeholder: 'Digite a descrição do feriado',
      required: true,
    },
    {
      id: 'dataFeriado',
      label: 'Data do Feriado',
      type: 'date' as const,
      required: true,
    },
    {
      id: 'tipoFeriado',
      label: 'Tipo de Feriado',
      type: 'select' as const,
      required: true,
      render: () => (
        <Select
          value={selectedTipo}
          onValueChange={(value) => {
            setSelectedTipo(value);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione o tipo de feriado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Integral</SelectItem>
            <SelectItem value="2">Meio Período</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
  ];

  return (
    <Container
      className='h-screen flex items-center justify-center'
    >
      <DefaultForm
        title="Adicionar Novo Feriado"
        inputs={formInputs}
        buttonText="Cadastrar Feriado"
        onSubmit={handleSubmit}
      />
    </Container>
  );
} 