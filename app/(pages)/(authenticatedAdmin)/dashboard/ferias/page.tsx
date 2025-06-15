'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

//Components
import Table from '@/app/components/atoms/Table';
import LoadingText from '@/app/components/atoms/LoadingText';
import Container from '@/app/components/atoms/container';
import ExcludeModal from '@/app/components/atoms/ExcludeModal';

//Services
import { feriasService } from '@/services/ferias';

//Utils
import { showErrorToast, showSuccessToast } from '@/utils/toast';

//Types
import { Column } from '@/types';

interface Ferias {
  idFerias?: number;
  dscFerias: string;
  datIncioFerias: string;
  datFimFerias: string;
  idUsuario?: number | null;
}

interface ApiResponse {
  mensagem: string;
  sucesso: boolean;
  listaFerias: Ferias[];
}

export default function FeriasPage() {
  const [ferias, setFerias] = useState<Ferias[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [feriasToDelete, setFeriasToDelete] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const columns: Column[] = [
    { key: 'idFerias', label: 'ID' },
    { key: 'dscFerias', label: 'Descrição' },
    { key: 'datIncioFerias', label: 'Data Início', type: 'date' },
    { key: 'datFimFerias', label: 'Data Fim', type: 'date' },
    { key: 'idUsuario', label: 'ID Usuário' }
  ];

  const fetchFerias = async () => {
    try {
      const response = await feriasService.buscarFerias();
      setFerias(response);
    } catch (error) {
      showErrorToast('Erro ao carregar férias');
      console.error('Erro ao carregar férias:', error);
      setFerias([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFerias();
  }, []);

  const handleDeleteClick = (ferias: Ferias) => {
    if (ferias.idFerias === undefined) {
      showErrorToast('ID das férias não encontrado');
      return;
    }
    setFeriasToDelete(ferias.idFerias);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!feriasToDelete) {
      showErrorToast('ID das férias não encontrado');
      setIsDeleteModalOpen(false);
      setFeriasToDelete(null);
      return;
    }
    
    setDeleteLoading(true);
    try {
      await feriasService.excluirFerias(feriasToDelete);
      showSuccessToast('Férias excluídas com sucesso!');
      fetchFerias();
    } catch (error) {
      showErrorToast('Erro ao excluir férias. Tente novamente.');
      console.error('Erro ao excluir férias:', error);
    } finally {
      setDeleteLoading(false);
      setIsDeleteModalOpen(false);
      setFeriasToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setFeriasToDelete(null);
  };

  if (loading) {
    return <LoadingText title="férias" />
  }

  return (
    <Container className="py-8">
      {/* Tabela de Férias */}
      <Table
        data={ferias}
        title="Férias"
        columns={columns}
        handleDeleteClick={handleDeleteClick}
        addItemHref="/adicionar-ferias"
      />

      {/* Modal de confirmação de exclusão */}
      {isDeleteModalOpen && (
        <ExcludeModal
          title="Confirmar exclusão"
          message="Tem certeza que deseja excluir estas férias? Esta ação não pode ser desfeita."
          onCancel={handleCancelDelete}
          onConfirm={handleDeleteConfirm}
          loading={deleteLoading}
        />
      )}
    </Container>
  );
} 