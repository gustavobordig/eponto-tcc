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
import { feriadoService } from '@/services/feriado';

//Utils
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { feriadoValidations } from '@/utils/validations/feriadoValidations';

//Types
import { Column } from '@/types';

interface Feriado {
  idFeriado?: number;
  dscFeriado: string;
  datFeriado: string;
  indTipoFeriado: number;
}

export default function FeriadosPage() {
  const [feriados, setFeriados] = useState<Feriado[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [feriadoToDelete, setFeriadoToDelete] = useState<number | null>(null);
  const [feriadoToEdit, setFeriadoToEdit] = useState<Feriado | null>(null);
  const [editedDscFeriado, setEditedDscFeriado] = useState('');
  const [editedDatFeriado, setEditedDatFeriado] = useState('');
  const [editedIndTipoFeriado, setEditedIndTipoFeriado] = useState(1);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const columns: Column[] = [
    { key: 'dscFeriado', label: 'Descrição' },
    { key: 'datFeriado', label: 'Data', type: 'date' },
    { 
      key: 'indTipoFeriado', 
      label: 'Tipo',
      render: (value: number) => {
        console.log('Tipo Feriado value:', value, typeof value); // Debug log
        return Number(value) === 1 ? 'Integral' : 'Meio Período';
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

  useEffect(() => {
    fetchFeriados();
  }, []);

  const handleEdit = (feriado: Feriado) => {
    setFeriadoToEdit(feriado);
    setEditedDscFeriado(feriado.dscFeriado);
    setEditedDatFeriado(feriado.datFeriado);
    setEditedIndTipoFeriado(feriado.indTipoFeriado);
    setIsEditModalOpen(true);
  };

  const handleEditClose = () => {
    setIsEditModalOpen(false);
    setFeriadoToEdit(null);
    setEditedDscFeriado('');
    setEditedDatFeriado('');
    setEditedIndTipoFeriado(1);
  };

  const handleEditConfirm = async () => {
    if (!feriadoToEdit || !feriadoToEdit.idFeriado) return;

    setEditLoading(true);
    try {
      const updatedFeriado: Feriado = {
        idFeriado: feriadoToEdit.idFeriado,
        dscFeriado: editedDscFeriado,
        datFeriado: editedDatFeriado,
        indTipoFeriado: editedIndTipoFeriado
      };

      await feriadoService.cadastrarFeriado(updatedFeriado);
      showSuccessToast('Feriado atualizado com sucesso!');
      fetchFeriados();
      handleEditClose();
    } catch (error) {
      showErrorToast('Erro ao atualizar feriado. Tente novamente.');
      console.error('Erro ao atualizar feriado:', error);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteClick = (feriado: Feriado) => {
    if (feriado.idFeriado === undefined) {
      showErrorToast('ID do feriado não encontrado');
      return;
    }
    setFeriadoToDelete(feriado.idFeriado);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!feriadoToDelete) {
      showErrorToast('ID do feriado não encontrado');
      setIsDeleteModalOpen(false);
      setFeriadoToDelete(null);
      return;
    }
    
    setDeleteLoading(true);
    try {
      await feriadoService.excluirFeriado(feriadoToDelete);
      showSuccessToast('Feriado excluído com sucesso!');
      fetchFeriados();
    } catch (error) {
      showErrorToast('Erro ao excluir feriado. Tente novamente.');
      console.error('Erro ao excluir feriado:', error);
    } finally {
      setDeleteLoading(false);
      setIsDeleteModalOpen(false);
      setFeriadoToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setFeriadoToDelete(null);
  };

  if (loading) {
    return <LoadingText title="feriados" />
  }

  return (
    <Container className="py-8">
      {/* Tabela de Feriados */}
      <Table
        data={feriados}
        title="Feriados"
        columns={columns}
        handleEdit={handleEdit}
        handleDeleteClick={handleDeleteClick}
        addItemHref="/adicionar-feriado"
      />

      {/* Modal de edição */}
      {isEditModalOpen && feriadoToEdit && (
        <EditModal
          title="Editar Feriado"
          fields={[
            {
              label: "Descrição do Feriado",
              value: editedDscFeriado,
              onChange: (e) => setEditedDscFeriado(e.target.value),
              fieldName: "dscFeriado",
              required: true
            },
            {
              label: "Data do Feriado",
              value: editedDatFeriado,
              onChange: (e) => setEditedDatFeriado(e.target.value),
              type: "date",
              fieldName: "datFeriado",
              required: true
            },
            {
              label: "Tipo de Feriado",
              value: editedIndTipoFeriado.toString(),
              onChange: (e) => setEditedIndTipoFeriado(Number(e.target.value)),
              type: "select",
              options: [
                { value: "1", label: "Integral" },
                { value: "2", label: "Meio Período" }
              ],
              fieldName: "indTipoFeriado",
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
          message="Tem certeza que deseja excluir este feriado? Esta ação não pode ser desfeita."
          onCancel={handleCancelDelete}
          onConfirm={handleDeleteConfirm}
          loading={deleteLoading}
        />
      )}
    </Container>
  );
} 