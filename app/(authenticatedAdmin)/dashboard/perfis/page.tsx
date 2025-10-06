'use client';

import { useState, useEffect } from 'react';
import { perfilService, Perfil } from '@/services/perfil';
import { showSuccessToast, showErrorToast } from '@/utils/toast';
import Button from '@/app/components/atoms/Button';
import Modal from '@/app/components/atoms/Modal';
import Input from '@/app/components/atoms/Input';
import TextArea from '@/app/components/atoms/TextArea';
import Table from '@/app/components/atoms/Table';
import ConfirmationModal from '@/app/components/atoms/ConfirmationModal';
import Select from '@/app/components/atoms/Select';

export default function PerfisPage() {
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPerfil, setSelectedPerfil] = useState<Perfil | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nomePerfil: '',
    descricaoPerfil: '',
    indAtivo: 1
  });

  useEffect(() => {
    loadPerfis();
  }, []);

  const loadPerfis = async () => {
    try {
      setLoading(true);
      const response = await perfilService.listarPerfis();
      if (response.sucesso && response.perfis) {
        setPerfis(response.perfis);
      }
    } catch (error) {
      showErrorToast('Erro ao carregar perfis');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let response;
      if (isEditing && selectedPerfil) {
        response = await perfilService.editarPerfil({
          ...selectedPerfil,
          ...formData
        });
      } else {
        response = await perfilService.cadastrarPerfil(formData);
      }
      
      if (response.sucesso) {
        showSuccessToast(`Perfil ${isEditing ? 'atualizado' : 'cadastrado'} com sucesso`);
        setShowModal(false);
        resetForm();
        loadPerfis();
      } else {
        showErrorToast(response.mensagem || `Erro ao ${isEditing ? 'atualizar' : 'cadastrar'} perfil`);
      }
    } catch (error) {
      showErrorToast(`Erro ao ${isEditing ? 'atualizar' : 'cadastrar'} perfil`);
    }
  };

  const handleDelete = async () => {
    if (!selectedPerfil) return;
    
    try {
      const response = await perfilService.removerPerfil(selectedPerfil.idPerfil);
      if (response.sucesso) {
        showSuccessToast('Perfil excluído com sucesso');
        setShowDeleteModal(false);
        setSelectedPerfil(null);
        loadPerfis();
      } else {
        showErrorToast(response.mensagem || 'Erro ao excluir perfil');
      }
    } catch (error) {
      showErrorToast('Erro ao excluir perfil');
    }
  };

  const openEditModal = (perfil: Perfil) => {
    setSelectedPerfil(perfil);
    setFormData({
      nomePerfil: perfil.nomePerfil,
      descricaoPerfil: perfil.descricaoPerfil,
      indAtivo: perfil.indAtivo
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const openDeleteModal = (perfil: Perfil) => {
    setSelectedPerfil(perfil);
    setShowDeleteModal(true);
  };

  const openCreateModal = () => {
    resetForm();
    setIsEditing(false);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      nomePerfil: '',
      descricaoPerfil: '',
      indAtivo: 1
    });
    setSelectedPerfil(null);
  };

  const tableHeaders = ['Nome', 'Descrição', 'Status', 'Ações'];
  const tableData = perfis.map(perfil => [
    perfil.nomePerfil,
    perfil.descricaoPerfil,
    perfil.indAtivo === 1 ? 'Ativo' : 'Inativo',
    <div key={perfil.idPerfil} className="flex gap-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => openEditModal(perfil)}
      >
        Editar
      </Button>
      <Button
        variant="danger"
        size="sm"
        onClick={() => openDeleteModal(perfil)}
      >
        Excluir
      </Button>
    </div>
  ]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Carregando perfis...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciar Perfis</h1>
        <Button onClick={openCreateModal}>
          Novo Perfil
        </Button>
      </div>

      <Table headers={tableHeaders} data={tableData} />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={isEditing ? 'Editar Perfil' : 'Novo Perfil'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome do Perfil"
            value={formData.nomePerfil}
            onChange={(e) => setFormData({ ...formData, nomePerfil: e.target.value })}
            required
          />
          <TextArea
            label="Descrição"
            value={formData.descricaoPerfil}
            onChange={(e) => setFormData({ ...formData, descricaoPerfil: e.target.value })}
            required
            rows={3}
          />
          <Select
            label="Status"
            value={formData.indAtivo}
            onChange={(e) => setFormData({ ...formData, indAtivo: parseInt(e.target.value) })}
            options={[
              { value: 1, label: 'Ativo' },
              { value: 0, label: 'Inativo' }
            ]}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowModal(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {isEditing ? 'Atualizar' : 'Salvar'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Excluir Perfil"
        message="Tem certeza que deseja excluir este perfil?"
      />
    </div>
  );
}
