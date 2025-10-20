'use client';

import { useState } from 'react';

// Components
import ListPageTemplate from '@/app/components/templates/ListPageTemplate';

// Services
import { listCargos, deleteCargo, updateCargo } from '@/services/cargo';

// Utils
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { cargoValidations } from '@/utils/validations/cargoValidations';

// Types
import { Column } from '@/types';


interface Cargo {
  idCargo: number;
  nomeCargo: string;
  salario: string;
  formacaoMinima: string;
  indAtivo: number;
}

interface ApiResponse {
  sucesso: boolean;
  mensagem: string | null;
  cargo: Cargo | null;
  cargos: Cargo[];
}

export default function CargosPage() {
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [loading, setLoading] = useState(true);

  const columns: Column[] = [
    { key: 'nomeCargo', label: 'Nome do Cargo' },
    { key: 'formacaoMinima', label: 'Formação Mínima' },
    { key: 'salario', label: 'Salário', type: 'currency' },
    { key: 'indAtivo', label: 'Status', type: 'status' }
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
      showErrorToast('Erro ao carregar cargos');
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
      label: "Nome do Cargo",
      value: cargo.nomeCargo,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setField('nomeCargo', e.target.value),
      fieldName: "nomeCargo",
      required: true
    },
    {
      label: "Salário",
      value: cargo.salario,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setField('salario', e.target.value),
      type: "number" as const,
      fieldName: "salario",
      required: true
    },
    {
      label: "Formação Mínima",
      value: cargo.formacaoMinima,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setField('formacaoMinima', e.target.value),
      fieldName: "formacaoMinima",
      required: true
    },
    {
      label: "Status",
      value: cargo.indAtivo.toString(),
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

  const getItemId = (cargo: Cargo) => cargo.idCargo;

  const createUpdatedItem = (originalCargo: Cargo, editedFields: Record<string, any>): Cargo => ({
    idCargo: originalCargo.idCargo,
    nomeCargo: editedFields.nomeCargo,
    salario: editedFields.salario,
    formacaoMinima: editedFields.formacaoMinima,
    indAtivo: editedFields.indAtivo
  });

  return (
    <ListPageTemplate
      data={cargos}
      setData={setCargos}
      loading={loading}
      setLoading={setLoading}
      title="Cargos"
      columns={columns}
      addItemHref="/adicionar-cargo"
      fetchData={fetchCargos}
      updateItem={handleUpdateCargo}
      deleteItem={handleDeleteCargo}
      editModalTitle="Editar Cargo"
      deleteModalTitle="Confirmar exclusão"
      deleteModalMessage="Tem certeza que deseja excluir este cargo? Esta ação não pode ser desfeita."
      validationConfigs={validationConfigs}
      getEditFields={getEditFields}
      getItemId={getItemId}
      createUpdatedItem={createUpdatedItem}
    />
  );
} 