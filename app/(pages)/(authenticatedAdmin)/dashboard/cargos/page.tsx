'use client';

import { useState } from 'react';

// Components
import ListPageTemplate from '@/app/components/templates/ListPageTemplate';

// Services
import { listCargos, deleteCargo, updateCargo } from '@/services/cargo';

// Utils
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { cargoValidations } from '@/utils/validations/cargoValidations';
import { useLanguage } from '@/app/contexts/LanguageContext';

// Types
import { Column } from '@/types';


interface Cargo {
  idCargo: number;
  nomeCargo: string;
  salario: string;
  formacaoMinima: string;
  indAtivo: number;
  idadeDoCargo: number;
}

interface ApiResponse {
  sucesso: boolean;
  mensagem: string | null;
  cargo: Cargo | null;
  cargos: Cargo[];
}

export default function CargosPage() {
  const { t } = useLanguage();
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [loading, setLoading] = useState(true);

  const columns: Column[] = [
    { key: 'nomeCargo', label: t('table.role-name') },
    { key: 'formacaoMinima', label: t('table.minimum-education') },
    { key: 'salario', label: t('table.salary'), type: 'currency' },
    { key: 'indAtivo', label: t('table.status'), type: 'status' }
  ];

  // Configuração das validações para o EditModal
  const validationConfigs = {
    nomeCargo: cargoValidations.validateNomeCargo,
    formacaoMinima: cargoValidations.validateFormacaoMinima,
    salario: cargoValidations.validateSalario
  };

  const fetchCargos = async () => {
    try {
      const response = await listCargos() as ApiResponse;
      setCargos(response.cargos || []);
    } catch (error) {
      showErrorToast(t('table.error-loading-roles'));
      console.error('Erro ao carregar cargos:', error);
      setCargos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCargo = async (cargo: Cargo) => {
    await updateCargo(cargo);
  };

  const handleDeleteCargo = async (id: number) => {
    await deleteCargo(id);
  };

  const getEditFields = (cargo: Cargo, setField: (field: string, value: any) => void) => [
    {
      label: t('table.role-name'),
      value: cargo.nomeCargo,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setField('nomeCargo', e.target.value),
      fieldName: "nomeCargo",
      required: true
    },
    {
      label: t('table.salary'),
      value: cargo.salario,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setField('salario', e.target.value),
      type: "number" as const,
      fieldName: "salario",
      required: true
    },
    {
      label: t('table.minimum-education'),
      value: cargo.formacaoMinima,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setField('formacaoMinima', e.target.value),
      fieldName: "formacaoMinima",
      required: true
    },
    {
      label: t('table.status'),
      value: cargo.indAtivo.toString(),
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

  const getItemId = (cargo: Cargo) => cargo.idCargo;

  const createUpdatedItem = (originalCargo: Cargo, editedFields: Record<string, any>): Cargo => ({
    idCargo: originalCargo.idCargo,
    nomeCargo: editedFields.nomeCargo,
    salario: editedFields.salario,
    formacaoMinima: editedFields.formacaoMinima,
    indAtivo: editedFields.indAtivo,
    idadeDoCargo: originalCargo.idadeDoCargo
  });

  return (
    <ListPageTemplate
      data={cargos}
      setData={setCargos}
      loading={loading}
      setLoading={setLoading}
      title={t('admin.roles')}
      columns={columns}
      addItemHref="/adicionar-cargo"
      fetchData={fetchCargos}
      updateItem={handleUpdateCargo}
      deleteItem={handleDeleteCargo}
      editModalTitle={t('table.edit') + ' ' + t('admin.roles')}
      deleteModalTitle={t('common.confirm') + ' ' + t('table.delete')}
      deleteModalMessage={t('table.confirm-delete-role')}
      validationConfigs={validationConfigs}
      getEditFields={getEditFields}
      getItemId={getItemId}
      createUpdatedItem={createUpdatedItem}
    />
  );
} 