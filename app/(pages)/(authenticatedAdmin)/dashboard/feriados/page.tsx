'use client';

import { useState } from 'react';

// Components
import ListPageTemplate from '@/app/components/templates/ListPageTemplate';

// Services
import { feriadoService } from '@/services/feriado';

// Utils
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { feriadoValidations } from '@/utils/validations/feriadoValidations';

// Types
import { Column } from '@/types';

// Context
import { useLanguage } from '@/app/contexts/LanguageContext';

interface Feriado {
  idFeriado?: number;
  dscFeriado: string;
  datFeriado: string;
  indTipoFeriado: number;
}

export default function FeriadosPage() {
  const { t } = useLanguage();
  const [feriados, setFeriados] = useState<Feriado[]>([]);
  const [loading, setLoading] = useState(true);

  const columns: Column[] = [
    { key: 'dscFeriado', label: t('admin.table.description') },
    { key: 'datFeriado', label: t('admin.table.date'), type: 'date' },
    { 
      key: 'indTipoFeriado', 
      label: t('admin.table.type'),
      render: (value: number) => {
        console.log('Tipo Feriado value:', value, typeof value); // Debug log
        return Number(value) === 1 ? t('admin.table.integral') : t('admin.table.half-day');
      }
    }
  ];

  // Configuração das validações para o EditModal
  const validationConfigs = {
    dscFeriado: feriadoValidations.validateDescricao,
    datFeriado: feriadoValidations.validateDataFeriado
  };

  const fetchFeriados = async () => {
    try {
      const response = await feriadoService.buscarFeriados();
      setFeriados(Array.isArray(response) ? response : []);
    } catch (error) {
      showErrorToast('Erro ao carregar feriados');
      console.error('Erro ao carregar feriados:', error);
      setFeriados([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFeriado = async (feriado: Feriado) => {
    if (!feriado.idFeriado) {
      throw new Error('ID do feriado não encontrado');
    }
    await feriadoService.cadastrarFeriado(feriado);
  };

  const handleDeleteFeriado = async (id: number) => {
    await feriadoService.excluirFeriado(id);
  };

  const getEditFields = (feriado: Feriado, setField: (field: string, value: any) => void) => [
    {
      label: t('admin.table.description'),
      value: feriado.dscFeriado,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setField('dscFeriado', e.target.value),
      fieldName: "dscFeriado",
      required: true
    },
    {
      label: t('admin.table.date'),
      value: feriado.datFeriado,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setField('datFeriado', e.target.value),
      type: "date" as const,
      fieldName: "datFeriado",
      required: true
    },
    {
      label: t('admin.table.holiday-type'),
      value: feriado.indTipoFeriado.toString(),
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setField('indTipoFeriado', Number(e.target.value)),
      type: "select" as const,
      options: [
        { value: "1", label: t('admin.table.integral') },
        { value: "2", label: t('admin.table.half-day') }
      ],
      fieldName: "indTipoFeriado",
      required: false
    }
  ];

  const getItemId = (feriado: Feriado) => {
    if (!feriado.idFeriado) {
      throw new Error('ID do feriado não encontrado');
    }
    return feriado.idFeriado;
  };

  const createUpdatedItem = (originalFeriado: Feriado, editedFields: Record<string, any>): Feriado => ({
    idFeriado: originalFeriado.idFeriado,
    dscFeriado: editedFields.dscFeriado,
    datFeriado: editedFields.datFeriado,
    indTipoFeriado: editedFields.indTipoFeriado
  });

  return (
    <ListPageTemplate
      data={feriados}
      setData={setFeriados}
      loading={loading}
      setLoading={setLoading}
      title={t('admin.page.holidays')}
      columns={columns}
      addItemHref="/adicionar-feriado"
      fetchData={fetchFeriados}
      updateItem={handleUpdateFeriado}
      deleteItem={handleDeleteFeriado}
      editModalTitle="Editar Feriado"
      deleteModalTitle="Confirmar exclusão"
      deleteModalMessage="Tem certeza que deseja excluir este feriado? Esta ação não pode ser desfeita."
      validationConfigs={validationConfigs}
      getEditFields={getEditFields}
      getItemId={getItemId}
      createUpdatedItem={createUpdatedItem}
    />
  );
} 