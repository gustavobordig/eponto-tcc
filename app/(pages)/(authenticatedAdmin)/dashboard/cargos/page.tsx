'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

//Components
import Table from '@/app/components/atoms/Table';
import LoadingText from '@/app/components/atoms/LoadingText';
import Container from '@/app/components/atoms/container';
import EditModal from '@/app/components/atoms/EditModal';
import ExcludeModal from '@/app/components/atoms/ExcludeModal';

//Services
import { listCargos, deleteCargo, updateCargo } from '@/services/cargo';

//Utils
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { cargoValidations } from '@/utils/validations/cargoValidations';

//Types
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [cargoToDelete, setCargoToDelete] = useState<number | null>(null);
  const [cargoToEdit, setCargoToEdit] = useState<Cargo | null>(null);
  const [editedNomeCargo, setEditedNomeCargo] = useState('');
  const [editedSalario, setEditedSalario] = useState('');
  const [editedFormacaoMinima, setEditedFormacaoMinima] = useState('');
  const [editedStatus, setEditedStatus] = useState(1);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

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

  useEffect(() => {
    fetchCargos();
  }, []);

  const handleEdit = (cargo: Cargo) => {
    setCargoToEdit(cargo);
    setEditedNomeCargo(cargo.nomeCargo);
    setEditedSalario(cargo.salario);
    setEditedFormacaoMinima(cargo.formacaoMinima);
    setEditedStatus(cargo.indAtivo);
    setIsEditModalOpen(true);
  };

  const handleEditClose = () => {
    setIsEditModalOpen(false);
    setCargoToEdit(null);
    setEditedNomeCargo('');
    setEditedSalario('');
    setEditedFormacaoMinima('');
    setEditedStatus(1);
  };

  const handleEditConfirm = async () => {
    if (!cargoToEdit) return;

    setEditLoading(true);
    try {
      const updatedCargo: Cargo = {
        idCargo: cargoToEdit.idCargo,
        nomeCargo: editedNomeCargo,
        salario: editedSalario,
        formacaoMinima: editedFormacaoMinima,
        indAtivo: editedStatus
      };

      await updateCargo(updatedCargo);
      showSuccessToast('Cargo atualizado com sucesso!');
      fetchCargos();
      handleEditClose();
    } catch (error) {
      showErrorToast('Erro ao atualizar cargo. Tente novamente.');
      console.error('Erro ao atualizar cargo:', error);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteClick = (cargo: Cargo) => {
    setCargoToDelete(cargo.idCargo);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!cargoToDelete) {
      showErrorToast('ID do cargo não encontrado');
      setIsDeleteModalOpen(false);
      setCargoToDelete(null);
      return;
    }
    
    setDeleteLoading(true);
    try {
      await deleteCargo(cargoToDelete);
      showSuccessToast('Cargo excluído com sucesso!');
      fetchCargos();
    } catch (error) {
      showErrorToast('Erro ao excluir cargo. Tente novamente.');
      console.error('Erro ao excluir cargo:', error);
    } finally {
      setDeleteLoading(false);
      setIsDeleteModalOpen(false);
      setCargoToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setCargoToDelete(null);
  };

  if (loading) {
    return <LoadingText title="cargos" />
  }

  return (
    <Container className="py-8">

      {/* Tabela de Cargos */}
      <Table
        data={cargos}
        title="Cargos"
        columns={columns}
        handleEdit={handleEdit}
        handleDeleteClick={handleDeleteClick}
        addItemHref="/adicionar-cargo"
      />

      {/* Modal de edição */}
      {isEditModalOpen && cargoToEdit && (
        <EditModal
          title="Editar Cargo"
          fields={[
            {
              label: "Nome do Cargo",
              value: editedNomeCargo,
              onChange: (e) => setEditedNomeCargo(e.target.value),
              fieldName: "nomeCargo",
              required: true
            },
            {
              label: "Salário",
              value: editedSalario,
              onChange: (e) => setEditedSalario(e.target.value),
              type: "number",
              fieldName: "salario",
              required: true
            },
            {
              label: "Formação Mínima",
              value: editedFormacaoMinima,
              onChange: (e) => setEditedFormacaoMinima(e.target.value),
              fieldName: "formacaoMinima",
              required: true
            },
            {
              label: "Status",
              value: editedStatus.toString(),
              onChange: (e) => setEditedStatus(Number(e.target.value)),
              type: "select",
              options: [
                { value: "1", label: "Ativo" },
                { value: "0", label: "Inativo" }
              ],
              fieldName: "status",
              required: false
            }
          ]}
          onClose={handleEditClose}
          onConfirm={handleEditConfirm}
          loading={editLoading}
          validationConfigs={validationConfigs}
        />
      )}

      {/* Modal de confirmação de exclusão */}
      {isDeleteModalOpen && (
        <ExcludeModal
          title="Confirmar exclusão"
          message="Tem certeza que deseja excluir este cargo? Esta ação não pode ser desfeita."
          onCancel={handleCancelDelete}
          onConfirm={handleDeleteConfirm}
          loading={deleteLoading}
        />
      )}
    </Container>
  );
} 