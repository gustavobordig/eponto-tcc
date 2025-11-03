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
import { listCargos } from '@/services/cargo';
import { jornadaTrabalhoService } from '@/services/jornadaTrabalho';

//Utils
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { useLanguage } from '@/app/contexts/LanguageContext';

//Types
import { Column } from '@/types';

interface Cargo {
  idCargo: number;
  nomeCargo: string;
  salario: string;
  indAtivo: number;
}

interface JornadaTrabalho {
  idJornada: number;
  nomeJornada: string;
  qtdHorasDiarias: number;
}

interface UserWithDetails extends UserData {
  cargo?: string;
  jornada?: string;
}

export default function CargosPage() {
    const { t } = useLanguage();
    const [users, setUsers] = useState<UserWithDetails[]>([]);
    const [cargos, setCargos] = useState<Cargo[]>([]);
    const [jornadas, setJornadas] = useState<JornadaTrabalho[]>([]);
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
      { key: 'nome', label: t('table.name') },
      { key: 'email', label: t('table.email') },
      { key: 'telefone', label: t('table.phone') },
      { key: 'cargo', label: t('table.role') },
      { key: 'jornada', label: t('table.work-schedule') },
      { key: 'indAtivo', label: t('table.status'), type: 'status' }
    ];

    const fetchCargos = async () => {
      try {
        const response = await listCargos();
        setCargos(response.cargos || []);
      } catch (error) {
        console.error('Erro ao carregar cargos:', error);
        setCargos([]);
      }
    };

    const fetchJornadas = async () => {
      try {
        const response = await jornadaTrabalhoService.listar();
        setJornadas(response.jornadas || []);
      } catch (error) {
        console.error('Erro ao carregar jornadas:', error);
        setJornadas([]);
      }
    };
  
    const fetchUsers = async () => {
      try {
        const response = await userService.getAll();
        const usersData = response.usuarios || [];
        
        // Mapear cargos e jornadas para os usuários
        const usersWithDetails = usersData.map((user: UserData) => {
          const cargo = cargos.find(c => c.idCargo === user.idCargo);
          const jornada = jornadas.find(j => j.idJornada === user.idJornada);
          
          return {
            ...user,
            cargo: cargo?.nomeCargo || `Cargo ${user.idCargo}`,
            jornada: jornada?.nomeJornada || `Jornada ${user.idJornada}`
          };
        });
        
        setUsers(usersWithDetails);
      } catch (error) {
        showErrorToast('Erro ao carregar usuários');
        console.error('Erro ao carregar usuários:', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
        const loadData = async () => {
          setLoading(true);
          await Promise.all([fetchCargos(), fetchJornadas()]);
          // O loading será definido como false no fetchUsers
        };
        
        loadData();
    }, []);

    // Recarregar usuários quando cargos ou jornadas mudarem
    useEffect(() => {
        if (cargos.length > 0 && jornadas.length > 0) {
          fetchUsers();
        } else if (cargos.length === 0 && jornadas.length === 0) {
          // Se não há cargos nem jornadas, ainda carregar usuários para mostrar os IDs
          fetchUsers();
        }
    }, [cargos, jornadas]);
  
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
      return <LoadingText title={t('admin.users').toLowerCase()} />
    }
  
    return (
      <Container className="py-8">
  
        {/* Tabela de Cargos */}
        <Table
          data={users}
          title={t('admin.users')}
          columns={columns}
          handleEdit={handleEdit}
          handleDeleteClick={handleDeleteClick}
          addItemHref="/adicionar-usuario"
        />
  
        {/* Modal de edição */}
        {isEditModalOpen && userToEdit && (
          <EditModal
            title={t('table.edit') + ' ' + t('admin.users')}
            fields={[
              {
                label: t('table.name'),
                value: editedNome,
                onChange: (e) => setEditedNome(e.target.value),
                fieldName: 'nome',
                required: true
              },
              {
                label: t('table.email'),
                value: editedEmail,
                onChange: (e) => setEditedEmail(e.target.value),
                fieldName: 'email',
                required: true
              },
              {
                label: t('table.phone'),
                value: editedTelefone,
                onChange: (e) => setEditedTelefone(e.target.value),
                fieldName: 'telefone',
                required: true
              },
              {
                label: t('table.role'),
                type: 'select',
                value: editedCargo,
                onChange: (e) => setEditedCargo(e.target.value),
                fieldName: 'idCargo',
                required: true,
                options: cargos.map(cargo => ({
                  value: cargo.idCargo.toString(),
                  label: cargo.nomeCargo
                }))
              },
              {
                label: t('table.work-schedule'),
                type: 'select',
                value: editedJornada,
                onChange: (e) => setEditedJornada(e.target.value),
                fieldName: 'idJornada',
                required: true,
                options: jornadas.map(jornada => ({
                  value: jornada.idJornada.toString(),
                  label: jornada.nomeJornada
                }))
              },
              {
                label: t('table.status'),
                type: 'select',
                value: editedStatus.toString(),
                onChange: (e) => setEditedStatus(Number(e.target.value)),
                fieldName: 'indAtivo',
                required: true,
                options: [
                  { value: '1', label: t('table.active') || 'Ativo' },
                  { value: '0', label: t('table.inactive') || 'Inativo' }
                ]
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
            title={t('common.confirm') + ' ' + t('table.delete')}
            message={t('table.confirm-delete-user')}
            onCancel={handleCancelDelete}
            onConfirm={handleDeleteConfirm}
            loading={deleteLoading}
          />
        )}
      </Container>
    );
  } 