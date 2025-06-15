'use client';

import { useEffect, useState } from 'react';
import Container from '@/app/components/atoms/container';
import DefaultForm from '@/app/components/molecules/DefaultForm';
import { feriasService } from '@/services/ferias';
import { userService, UserData } from '@/services/user';
import { showSuccessToast, showErrorToast } from '@/utils/toast';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdicionarFerias() {
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await userService.getAll();
        if (response.usuarios) {
          setUsers(response.usuarios);
        }
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        showErrorToast('Erro ao carregar lista de usuários');
      }
    };

    fetchUsers();
  }, []);

  const handleSubmit = async (data: Record<string, string>) => {
    try {
      // Format dates to include time component
      const dataInicio = new Date(data.dataInicio);
      const dataFim = new Date(data.dataFim);

      // Set time to 00:00:00.000Z for start date and 23:59:59.999Z for end date
      dataInicio.setUTCHours(0, 0, 0, 0);
      dataFim.setUTCHours(23, 59, 59, 999);

      const feriasPayload = {
        dscFerias: data.descricao,
        datIncioFerias: dataInicio.toISOString(),
        datFimFerias: dataFim.toISOString(),
        idUsuario: selectedUserId ? parseInt(selectedUserId) : null
      };

      await feriasService.cadastrarFerias(feriasPayload);
      showSuccessToast('Férias cadastradas com sucesso!');
      router.push('/dashboard/ferias'); 
    } catch (error) {
      console.error('Erro ao cadastrar férias:', error);
      showErrorToast('Erro ao cadastrar férias. Tente novamente.');
    }
  };

  const formInputs = [
    {
      id: 'descricao',
      label: 'Descrição',
      type: 'text' as const,
      placeholder: 'Digite a descrição das férias',
      required: true,
    },
    {
      id: 'dataInicio',
      label: 'Data de Início',
      type: 'date' as const,
      required: true,
    },
    {
      id: 'dataFim',
      label: 'Data de Fim',
      type: 'date' as const,
      required: true,
    },
    {
      id: 'idUsuario',
      label: 'Usuário',
      type: 'select' as const,
      required: false,
      render: () => (
        <Select
          value={selectedUserId}
          onValueChange={setSelectedUserId}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione um usuário (opcional)" />
          </SelectTrigger>
          <SelectContent className="max-h-[200px] overflow-y-auto">
            {users.map((user) => (
              <SelectItem key={user.idUsuario} value={user.idUsuario.toString()}>
                {user.nome}
              </SelectItem>
            ))}
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
        title="Adicionar Novo Período de Férias"
        inputs={formInputs}
        buttonText="Cadastrar Férias"
        onSubmit={handleSubmit}
      />
    </Container>
  );
} 