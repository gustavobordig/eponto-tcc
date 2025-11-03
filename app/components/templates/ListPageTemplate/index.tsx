'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Components
import Table from '@/app/components/atoms/Table';
import LoadingText from '@/app/components/atoms/LoadingText';
import Container from '@/app/components/atoms/container';
import EditModal from '@/app/components/atoms/EditModal';
import ExcludeModal from '@/app/components/atoms/ExcludeModal';

// Utils
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { useLanguage } from '@/app/contexts/LanguageContext';

// Types
import { Column } from '@/types';

interface ListPageTemplateProps<T> {
  // Dados
  data: T[];
  setData: (data: T[]) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  
  // Configuração da tabela
  title: string;
  columns: Column[];
  addItemHref: string;
  
  // Serviços
  fetchData: () => Promise<void>;
  updateItem: (item: T) => Promise<void>;
  deleteItem: (id: number) => Promise<void>;
  
  // Configuração dos modais
  editModalTitle: string;
  deleteModalTitle: string;
  deleteModalMessage: string;
  
  // Validações (opcional)
  validationConfigs?: Record<string, (value: string) => any>;
  
  // Campos do modal de edição
  getEditFields: (item: T, setField: (field: string, value: any) => void) => Array<{
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    type?: "number" | "text" | "date" | "select";
    options?: Array<{ value: string; label: string }>;
    fieldName?: string;
    required?: boolean;
  }>;
  
  // Função para obter ID do item
  getItemId: (item: T) => number;
  
  // Função para criar item atualizado
  createUpdatedItem: (originalItem: T, editedFields: Record<string, any>) => T;
  
  // Permitir edição (opcional, padrão: true)
  allowEdit?: boolean;
}

export default function ListPageTemplate<T extends Record<string, any>>({
  data,
  setData,
  loading,
  setLoading,
  title,
  columns,
  addItemHref,
  fetchData,
  updateItem,
  deleteItem,
  editModalTitle,
  deleteModalTitle,
  deleteModalMessage,
  validationConfigs,
  getEditFields,
  getItemId,
  createUpdatedItem,
  allowEdit = true
}: ListPageTemplateProps<T>) {
  const router = useRouter();
  const { language } = useLanguage();
  
  // Estados dos modais
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [itemToEdit, setItemToEdit] = useState<T | null>(null);
  
  // Estados de loading dos modais
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  
  // Estados dos campos editados
  const [editedFields, setEditedFields] = useState<Record<string, any>>({});

  // Carregar dados iniciais
  useEffect(() => {
    fetchData();
  }, []);

  // Handlers de edição
  const handleEdit = (item: T) => {
    setItemToEdit(item);
    // Inicializar campos editados com valores do item
    const initialFields: Record<string, any> = {};
    Object.keys(item).forEach(key => {
      initialFields[key] = item[key];
    });
    setEditedFields(initialFields);
    setIsEditModalOpen(true);
  };

  const handleEditClose = () => {
    setIsEditModalOpen(false);
    setItemToEdit(null);
    setEditedFields({});
  };

  const handleEditConfirm = async () => {
    if (!itemToEdit) return;

    setEditLoading(true);
    try {
      const updatedItem = createUpdatedItem(itemToEdit, editedFields);
      await updateItem(updatedItem);
      showSuccessToast(`${title.slice(0, -1)} atualizado com sucesso!`);
      fetchData();
      handleEditClose();
    } catch (error) {
      showErrorToast(`Erro ao atualizar ${title.toLowerCase()}. Tente novamente.`);
      console.error(`Erro ao atualizar ${title.toLowerCase()}:`, error);
    } finally {
      setEditLoading(false);
    }
  };

  // Handlers de exclusão
  const handleDeleteClick = (item: T) => {
    const id = getItemId(item);
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) {
      showErrorToast(`ID do ${title.toLowerCase().slice(0, -1)} não encontrado`);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      return;
    }
    
    setDeleteLoading(true);
    try {
      await deleteItem(itemToDelete);
      showSuccessToast(`${title.slice(0, -1)} excluído com sucesso!`);
      fetchData();
    } catch (error) {
      showErrorToast(`Erro ao excluir ${title.toLowerCase().slice(0, -1)}. Tente novamente.`);
      console.error(`Erro ao excluir ${title.toLowerCase().slice(0, -1)}:`, error);
    } finally {
      setDeleteLoading(false);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  // Função para atualizar campos editados
  const setField = (field: string, value: any) => {
    setEditedFields(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return <LoadingText title={title.toLowerCase()} />
  }

  return (
    <Container className="py-8">
      {/* Tabela */}
      <Table
        data={data}
        title={title}
        columns={columns}
        handleEdit={allowEdit ? handleEdit : undefined}
        handleDeleteClick={handleDeleteClick}
        addItemHref={addItemHref}
      />

      {/* Modal de edição */}
      {isEditModalOpen && itemToEdit && (
        <EditModal
          title={editModalTitle}
          fields={getEditFields(itemToEdit, setField)}
          onClose={handleEditClose}
          onConfirm={handleEditConfirm}
          loading={editLoading}
          validationConfigs={validationConfigs}
        />
      )}

      {/* Modal de confirmação de exclusão */}
      {isDeleteModalOpen && (
        <ExcludeModal
          title={deleteModalTitle}
          message={deleteModalMessage}
          onCancel={handleCancelDelete}
          onConfirm={handleDeleteConfirm}
          loading={deleteLoading}
        />
      )}
    </Container>
  );
}
