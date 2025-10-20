'use client';

import { useState } from 'react';

// Components
import ListPageTemplate from '@/app/components/templates/ListPageTemplate';

// Services
import { jornadaTrabalhoService } from '@/services/jornadaTrabalho';

// Utils
import { showErrorToast, showSuccessToast } from '@/utils/toast';

// Types
import { Column } from '@/types';


interface JornadaTrabalho {
  idJornada?: number;
  nomeJornada: string;
  qtdHorasDiarias: number;
  indAtivo?: number;
}

interface ApiResponse {
  sucesso: boolean;
  mensagem: string | null;
  jornada: JornadaTrabalho | null;
  jornadas: JornadaTrabalho[];
}

export default function JornadaTrabalhoPage() {
  const [jornadas, setJornadas] = useState<JornadaTrabalho[]>([]);
  const [loading, setLoading] = useState(true);

  const columns: Column[] = [
    {
      key: 'nomeJornada',
      label: 'Nome da Jornada',
      type: 'text'
    },
    {
      key: 'qtdHorasDiarias',
      label: 'Quantidade de Horas Diárias',
      type: 'text'
    },
    {
      key: 'indAtivo',
      label: 'Status',
      type: 'status'
    } 
  ];

  const fetchJornadas = async () => {
    try {
      const response = await jornadaTrabalhoService.listar() as ApiResponse;
      setJornadas(response.jornadas || []);
    } catch (error) {
      showErrorToast('Erro ao carregar jornadas');
      console.error('Erro ao carregar jornadas:', error);
      setJornadas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateJornada = async (jornada: JornadaTrabalho) => {
    if (!jornada.idJornada) {
      throw new Error('ID da jornada não encontrado');
    }
    await jornadaTrabalhoService.atualizar(jornada.idJornada, jornada);
  };

  const handleDeleteJornada = async (id: number) => {
    await jornadaTrabalhoService.deletar(id);
  };

  const getEditFields = (jornada: JornadaTrabalho, setField: (field: string, value: any) => void) => [
    {
      label: "Nome da Jornada",
      value: jornada.nomeJornada,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setField('nomeJornada', e.target.value),
      fieldName: "nomeJornada",
      required: true
    },
    {
      label: "Quantidade de Horas Diárias",
      value: jornada.qtdHorasDiarias?.toString() || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setField('qtdHorasDiarias', Number(e.target.value)),
      type: "number" as const,
      fieldName: "qtdHorasDiarias",
      required: true
    },
    {
      label: "Status",
      value: jornada.indAtivo?.toString() || '1',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setField('indAtivo', Number(e.target.value)),
      type: "select" as const,
      options: [
        { value: "1", label: "Ativo" },
        { value: "0", label: "Inativo" }
      ],
      fieldName: "status",
      required: false
    }
  ];

  const getItemId = (jornada: JornadaTrabalho) => {
    if (!jornada.idJornada) {
      throw new Error('ID da jornada não encontrado');
    }
    return jornada.idJornada;
  };

  const createUpdatedItem = (originalJornada: JornadaTrabalho, editedFields: Record<string, any>): JornadaTrabalho => ({
    idJornada: originalJornada.idJornada,
    nomeJornada: editedFields.nomeJornada,
    qtdHorasDiarias: editedFields.qtdHorasDiarias,
    indAtivo: editedFields.indAtivo
  });

  return (
    <ListPageTemplate
      data={jornadas}
      setData={setJornadas}
      loading={loading}
      setLoading={setLoading}
      title="Jornadas de Trabalho"
      columns={columns}
      addItemHref="/adicionar-jornada"
      fetchData={fetchJornadas}
      updateItem={handleUpdateJornada}
      deleteItem={handleDeleteJornada}
      editModalTitle="Editar Jornada"
      deleteModalTitle="Confirmar exclusão"
      deleteModalMessage="Tem certeza que deseja excluir esta jornada? Esta ação não pode ser desfeita."
      getEditFields={getEditFields}
      getItemId={getItemId}
      createUpdatedItem={createUpdatedItem}
    />
  );
} 