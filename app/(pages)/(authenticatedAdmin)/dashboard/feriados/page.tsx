'use client';

import { useEffect, useState } from 'react';

//Components
import Table from '@/shared/ui/Table';
import LoadingText from '@/shared/ui/LoadingText';
import Container from '@/shared/ui/Container';
import EditModal from '@/shared/ui/EditModal';
import ExcludeModal from '@/shared/ui/ExcludeModal';

//Services
import { FeriadoListado, feriadoService, labelDoTipo, tipoDoFeriado } from '@/features/feriados/api';

//Utils
import { showErrorToast, showSuccessToast } from '@/shared/lib/toast';
import { feriadoValidations } from '@/features/feriados/validations';

//Types
import { Column } from '@/shared/types/ui';

export default function FeriadosPage() {
  const [feriados, setFeriados] = useState<FeriadoListado[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [feriadoToDelete, setFeriadoToDelete] = useState<number | null>(null);
  const [feriadoToEdit, setFeriadoToEdit] = useState<FeriadoListado | null>(null);
  const [editedDscFeriado, setEditedDscFeriado] = useState('');
  const [editedDatFeriado, setEditedDatFeriado] = useState('');
  const [editedIndTipoFeriado, setEditedIndTipoFeriado] = useState(1);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const columns: Column<FeriadoListado>[] = [
    { key: 'dscFeriado', label: 'Descrição' },
    { key: 'datFeriado', label: 'Data', type: 'date' },
    // A listagem devolve o tipo como texto (dscTipoFeriado)
    { key: 'dscTipoFeriado', label: 'Tipo', render: (feriado) => labelDoTipo(tipoDoFeriado(feriado.dscTipoFeriado)) }
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

  const handleEdit = (feriado: FeriadoListado) => {
    setFeriadoToEdit(feriado);
    setEditedDscFeriado(feriado.dscFeriado);
    // O input date precisa de yyyy-MM-dd; a API manda com hora
    setEditedDatFeriado(feriado.datFeriado?.slice(0, 10) ?? '');
    setEditedIndTipoFeriado(tipoDoFeriado(feriado.dscTipoFeriado));
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
      await feriadoService.atualizarFeriado(feriadoToEdit.idFeriado, {
        dscFeriado: editedDscFeriado,
        datFeriado: editedDatFeriado,
        indTipoFeriado: editedIndTipoFeriado
      });
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

  const handleDeleteClick = (feriado: FeriadoListado) => {
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