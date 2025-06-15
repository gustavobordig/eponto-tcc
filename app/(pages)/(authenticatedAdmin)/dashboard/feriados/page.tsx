'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

//Components
import Table from '@/app/components/atoms/Table';
import LoadingText from '@/app/components/atoms/LoadingText';
import Container from '@/app/components/atoms/container';
import ExcludeModal from '@/app/components/atoms/ExcludeModal';

//Services
import { feriadoService } from '@/services/feriado';

//Utils
import { showErrorToast, showSuccessToast } from '@/utils/toast';

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
  const [feriadoToDelete, setFeriadoToDelete] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const columns: Column[] = [
    { key: 'idFeriado', label: 'ID' },
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
        handleDeleteClick={handleDeleteClick}
        addItemHref="/adicionar-feriado"
      />

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