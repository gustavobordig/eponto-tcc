'use client';

import { useEffect, useState } from 'react';
import Container from '@/app/components/atoms/container';
import { jornadaTrabalhoService } from '@/services/jornadaTrabalho';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
// import { useRouter } from 'next/navigation';

//Components
import Table from '@/app/components/atoms/Table';
import EditModal from '@/app/components/atoms/EditModal';
import ExcludeModal from '@/app/components/atoms/ExcludeModal';

//Types
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
  const [jornadas, setJornadas] = useState<JornadaTrabalho[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [jornadaToDelete, setJornadaToDelete] = useState<number | null>(null);
  const [jornadaToEdit, setJornadaToEdit] = useState<JornadaTrabalho | null>(null);
  const [editedNomeJornada, setEditedNomeJornada] = useState('');
  const [editedqtdHorasDiarias, setEditedqtdHorasDiarias] = useState('');
  const [editedStatus, setEditedStatus] = useState(1);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

 

  const columns: Column[] = [
    {
      key: 'nomeJornada',
      label: 'Nome da Jornada',
      type: 'text'
    },
    {
      key: 'qtdHorasDiarias',
      label: 'Quantidade de Horas Diárias',
      type: 'text'
    },
    {
      key: 'indAtivo',
      label: 'Status',
      type: 'status'
    },
    {
      key: 'teste',
      label: 'teste',
      type: 'text'
    } 
  ]   

  const fetchJornadas = async () => {
    try {
      const response = await jornadaTrabalhoService.listar() as ApiResponse;
      setJornadas(response.jornadas || []);
    } catch (error) {
      showErrorToast('Erro ao carregar jornadas');
      console.error('Erro ao carregar jornadas:', error);
      setJornadas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJornadas();
  }, []);

  const handleEdit = (jornada: JornadaTrabalho) => {
    if (!jornada || !jornada.idJornada) {
      showErrorToast('Dados da jornada inválidos');
      return;
    }
    setJornadaToEdit(jornada);
    setEditedNomeJornada(jornada.nomeJornada || '');
    setEditedqtdHorasDiarias(jornada.qtdHorasDiarias?.toString() || '');
    setEditedStatus(jornada.indAtivo || 1);
    setIsEditModalOpen(true);
  };

  const handleEditClose = () => {
    setIsEditModalOpen(false);
    setJornadaToEdit(null);
    setEditedNomeJornada('');
    setEditedqtdHorasDiarias('');
    setEditedStatus(1);
  };

  const handleEditConfirm = async () => {
    if (!jornadaToEdit) return;

    setEditLoading(true);
    try {
      const updatedJornada: JornadaTrabalho = {
        nomeJornada: editedNomeJornada,
        qtdHorasDiarias: Number(editedqtdHorasDiarias),
      };

      await jornadaTrabalhoService.atualizar(jornadaToEdit.idJornada!, updatedJornada);
      showSuccessToast('Jornada atualizada com sucesso!');
      fetchJornadas();
      handleEditClose();
    } catch (error) {
      showErrorToast('Erro ao atualizar jornada. Tente novamente.');
      console.error('Erro ao atualizar jornada:', error);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteClick = (jornada: JornadaTrabalho) => {
    setJornadaToDelete(jornada.idJornada!);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!jornadaToDelete) {
      showErrorToast('ID da jornada não encontrado');
      setIsDeleteModalOpen(false);
      setJornadaToDelete(null);
      return;
    }
    
    setDeleteLoading(true);
    try {
      await jornadaTrabalhoService.deletar(jornadaToDelete);
      showSuccessToast('Jornada excluída com sucesso!');
      fetchJornadas();
    } catch (error) {
      showErrorToast('Erro ao excluir jornada. Tente novamente.');
      console.error('Erro ao excluir jornada:', error);
    } finally {
      setDeleteLoading(false);
      setIsDeleteModalOpen(false);
      setJornadaToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setJornadaToDelete(null);
  };

  if (loading) {
    return (
      <Container className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando jornadas...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">


       {/* Tabela de Jornadas de Trabalho */}
      <Table
        data={jornadas}
        columns={columns}   
        title="Jornadas de Trabalho"
        handleEdit={handleEdit}
        handleDeleteClick={handleDeleteClick}
        addItemHref="/adicionar-jornada"
      />

      {/* Modal de edição */}
      {isEditModalOpen && jornadaToEdit && (
        <EditModal
          title="Editar Jornada"
          fields={[
            {
              label: "Nome da Jornada",
              value: editedNomeJornada,
              onChange: (e) => setEditedNomeJornada(e.target.value)
            },
            {
              label: "Quantidade de Horas Diárias",
              value: editedqtdHorasDiarias,
              onChange: (e) => setEditedqtdHorasDiarias(e.target.value)
            },
            {
              label: "Status",
              value: editedStatus.toString(),
              onChange: (e) => setEditedStatus(Number(e.target.value))
            }
          ]}
          onClose={handleEditClose}
          onConfirm={handleEditConfirm}
          loading={editLoading}
        />
      )}

      {/* Modal de confirmação de exclusão */}
      {isDeleteModalOpen && (
        <ExcludeModal
          title="Confirmar exclusão"
          message="Tem certeza que deseja excluir esta jornada? Esta ação não pode ser desfeita."
          onCancel={handleCancelDelete}
          onConfirm={handleDeleteConfirm}
          loading={deleteLoading}
        />
      )}
    </Container>
  );
} 