'use client';

import { useEffect, useState } from 'react';
import LoadingText from '@/shared/ui/LoadingText';
import { JornadaTrabalho, jornadaTrabalhoService } from '@/features/jornadas/api';
import { showErrorToast, showSuccessToast } from '@/shared/lib/toast';

//Components
import Table from '@/shared/ui/Table';
import EditModal from '@/shared/ui/EditModal';
import ExcludeModal from '@/shared/ui/ExcludeModal';

//Types
import { Column } from '@/shared/types/ui';


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

 

  const columns: Column<JornadaTrabalho>[] = [
    {
      key: 'nomeJornada',
      label: 'Jornada',
      render: (j) => <b className="text-sm">{j.nomeJornada}</b>
    },
    {
      key: 'qtdHorasDiarias',
      label: 'Horas por dia',
      render: (j) => <span className="font-mono text-[13px]">{j.qtdHorasDiarias}h</span>
    },
    {
      key: 'indAtivo',
      label: 'Status',
      type: 'status'
    } 
  ]   

  const fetchJornadas = async () => {
    try {
      const response = await jornadaTrabalhoService.listar();
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
      <LoadingText title="jornadas" />
    );
  }

  return (
    <>


       {/* Tabela de Jornadas de Trabalho */}
      <Table
        data={jornadas}
        columns={columns}   
        title="Jornadas de trabalho"
        subtitle={`${jornadas.length} ${jornadas.length === 1 ? 'jornada cadastrada' : 'jornadas cadastradas'} · ${jornadas.filter((j) => j.indAtivo === 1).length} ativas`}
        searchPlaceholder="Buscar jornada"
        handleEdit={handleEdit}
        handleDeleteClick={handleDeleteClick}
        addItemHref="/adicionar-jornada"
        addItemLabel="Nova jornada"
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
    </>
  );
} 