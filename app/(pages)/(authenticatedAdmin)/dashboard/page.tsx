"use client";

import { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

//Components
import Table from '@/app/components/atoms/Table';
import LoadingText from '@/app/components/atoms/LoadingText';
import Container from '@/app/components/atoms/container';
import ExcludeModal from '@/app/components/atoms/ExcludeModal';
import EditModal from '@/app/components/atoms/EditModal';

//Services
import { UserData, userService } from '@/services/user';

//Utils
import { showErrorToast, showSuccessToast } from '@/utils/toast';

//Types
import { Column } from '@/types';


export default function CargosPage() {
  
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<number | null>(null);
    const [userToEdit, setUserToEdit] = useState<UserData | null>(null);
    const [editedNome, setEditedNome] = useState('');
    const [editedEmail, setEditedEmail] = useState('');
    const [editedTelefone, setEditedTelefone] = useState('');
    const [editedCargo, setEditedCargo] = useState('');
    const [editedJornada, setEditedJornada] = useState('');
    const [editedStatus, setEditedStatus] = useState(1);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
  
    const columns: Column[] = [
      { key: 'nome', label: 'Nome' },
      { key: 'email', label: 'Email' },
      { key: 'telefone', label: 'Telefone' },
      { key: 'cargo', label: 'Cargo' },
      { key: 'jornada', label: 'Jornada' },
      { key: 'indAtivo', label: 'Status', type: 'status' }
    ];
  
    const fetchUsers = async () => {
      try {
        const response = await userService.getAll();
        setUsers(response.usuarios || []);
      } catch (error) {
        showErrorToast('Erro ao carregar usuários');
        console.error('Erro ao carregar usuários:', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
        fetchUsers();
    }, []);
  
    const handleEdit = (user: UserData) => {
      setUserToEdit(user);
      setEditedNome(user.nome);
      setEditedEmail(user.email);
      setEditedTelefone(user.telefone.toString());
      setEditedCargo(user.idCargo.toString());
      setEditedJornada(user.idJornada.toString());
      setEditedStatus(user.indAtivo);
      setIsEditModalOpen(true);
    };
  
    const handleEditClose = () => {
      setIsEditModalOpen(false);
      setUserToEdit(null);
      setEditedNome('');
      setEditedEmail('');
      setEditedTelefone('');
      setEditedCargo('');
      setEditedJornada('');
      setEditedStatus(1);
    };
  
    const handleEditConfirm = async () => {
      if (!userToEdit) return;
  
      setEditLoading(true);
      try {
        const updatedUser: UserData = {
          idUsuario: userToEdit.idUsuario,
          nome: editedNome,
          email: editedEmail,   
          telefone: Number(editedTelefone),
          idCargo: Number(editedCargo),
          idJornada: Number(editedJornada),
          indAtivo: editedStatus,
          dataNascimento: new Date().toISOString(),
          senha: ''
        };
  
        await userService.update(updatedUser);
        showSuccessToast('Usuário atualizado com sucesso!');
        fetchUsers();
        handleEditClose();
      } catch (error) {
        showErrorToast('Erro ao atualizar cargo. Tente novamente.');
        console.error('Erro ao atualizar cargo:', error);
      } finally {
        setEditLoading(false);
      }
    };
  
    const handleDeleteClick = (user: UserData) => {
      setUserToDelete(user.idUsuario);
      setIsDeleteModalOpen(true);
    };
  
    const handleDeleteConfirm = async () => {
      if (!userToDelete) {
        showErrorToast('ID do usuário não encontrado');
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
        return;
      }
      
      setDeleteLoading(true);
      try {
        await userService.delete(userToDelete);
        showSuccessToast('Usuário excluído com sucesso!');
        fetchUsers();
      } catch (error) {
        showErrorToast('Erro ao excluir cargo. Tente novamente.');
        console.error('Erro ao excluir cargo:', error);
      } finally {
        setDeleteLoading(false);
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
      }
    };
  
    const handleCancelDelete = () => {
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    };
  
    if (loading) {
      return <LoadingText title="usuários" />
    }
  
    return (
      <Container className="py-8">
  
        {/* Tabela de Cargos */}
        <Table
          data={users}
          title="Usuários"
          columns={columns}
          handleEdit={handleEdit}
          handleDeleteClick={handleDeleteClick}
          addItemHref="/adicionar-usuario"
        />
  
        {/* Modal de edição */}
        {isEditModalOpen && userToEdit && (
          <EditModal
            title="Editar Usuário"
            fields={[
              {
                label: "Nome",
                value: editedNome,
                onChange: (e) => setEditedNome(e.target.value)
              },
              {
                label: "Email",
                value: editedEmail,
                onChange: (e) => setEditedEmail(e.target.value)
              },
              {
                label: "Telefone",
                value: editedTelefone,
                onChange: (e) => setEditedTelefone(e.target.value)
              },
              {
                label: "Cargo",
                value: editedCargo,
                onChange: (e) => setEditedCargo(e.target.value)
              },
              {
                label: "Jornada",
                value: editedJornada,
                onChange: (e) => setEditedJornada(e.target.value)
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
            message="Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita."
            onCancel={handleCancelDelete}
            onConfirm={handleDeleteConfirm}
            loading={deleteLoading}
          />
        )}
      </Container>
    );
  } 