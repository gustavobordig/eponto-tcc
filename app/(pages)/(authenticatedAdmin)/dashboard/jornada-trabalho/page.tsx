'use client';

import { useState } from 'react';

// Components
import ListPageTemplate from '@/app/components/templates/ListPageTemplate';

// Services
import { jornadaTrabalhoService } from '@/services/jornadaTrabalho';

// Utils
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { useLanguage } from '@/app/contexts/LanguageContext';

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
  const { t } = useLanguage();
  const [jornadas, setJornadas] = useState<JornadaTrabalho[]>([]);
  const [loading, setLoading] = useState(true);

  const columns: Column[] = [
    {
      key: 'nomeJornada',
      label: t('table.schedule-name'),
      type: 'text'
    },
    {
      key: 'qtdHorasDiarias',
      label: t('table.daily-hours'),
      type: 'text'
    },
    {
      key: 'indAtivo',
      label: t('table.status'),
      type: 'status'
    } 
  ];

  const fetchJornadas = async () => {
    try {
      const response = await jornadaTrabalhoService.listar() as ApiResponse;
      setJornadas(response.jornadas || []);
    } catch (error) {
      showErrorToast(t('table.error-loading-schedules'));
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
      label: t('table.schedule-name'),
      value: jornada.nomeJornada,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setField('nomeJornada', e.target.value),
      fieldName: "nomeJornada",
      required: true
    },
    {
      label: t('table.daily-hours'),
      value: jornada.qtdHorasDiarias?.toString() || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setField('qtdHorasDiarias', Number(e.target.value)),
      type: "number" as const,
      fieldName: "qtdHorasDiarias",
      required: true
    },
    {
      label: t('table.status'),
      value: jornada.indAtivo?.toString() || '1',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setField('indAtivo', Number(e.target.value)),
      type: "select" as const,
      options: [
        { value: "1", label: t('table.status.active') },
        { value: "0", label: t('table.status.inactive') }
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
      title={t('admin.work-schedule')}
      columns={columns}
      addItemHref="/adicionar-jornada"
      fetchData={fetchJornadas}
      updateItem={handleUpdateJornada}
      deleteItem={handleDeleteJornada}
      editModalTitle={t('table.edit') + ' ' + t('admin.work-schedule')}
      deleteModalTitle={t('common.confirm') + ' ' + t('table.delete')}
      deleteModalMessage={t('table.confirm-delete-schedule')}
      getEditFields={getEditFields}
      getItemId={getItemId}
      createUpdatedItem={createUpdatedItem}
    />
  );
} 