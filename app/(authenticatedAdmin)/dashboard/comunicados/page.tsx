'use client';

import { useState, useEffect } from 'react';
import { comunicadoService, Comunicado } from '@/services/comunicado';
import { showSuccessToast, showErrorToast } from '@/utils/toast';
import Button from '@/app/components/atoms/Button';
import Modal from '@/app/components/atoms/Modal';
import Input from '@/app/components/atoms/Input';
import TextArea from '@/app/components/atoms/TextArea';
import Table from '@/app/components/atoms/Table';
import ConfirmationModal from '@/app/components/atoms/ConfirmationModal';

export default function ComunicadosPage() {
  const [comunicados, setComunicados] = useState<Comunicado[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedComunicado, setSelectedComunicado] = useState<Comunicado | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    mensagem: '',
    idUsuario: 1 // TODO: Pegar do contexto de autenticação
  });

  useEffect(() => {
    loadComunicados();
  }, []);

  const loadComunicados = async () => {
    try {
      setLoading(true);
      const response = await comunicadoService.listarComunicados();
      if (response.sucesso && response.listaComunicados) {
        setComunicados(response.listaComunicados);
      }
    } catch (error) {
      showErrorToast('Erro ao carregar comunicados');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await comunicadoService.cadastrarComunicado(formData);
      if (response.sucesso) {
        showSuccessToast('Comunicado cadastrado com sucesso');
        setShowModal(false);
        setFormData({ titulo: '', mensagem: '', idUsuario: 1 });
        loadComunicados();
      } else {
        showErrorToast(response.mensagem || 'Erro ao cadastrar comunicado');
      }
    } catch (error) {
      showErrorToast('Erro ao cadastrar comunicado');
    }
  };

  const handleDelete = async () => {
    if (!selectedComunicado) return;
    
    try {
      const response = await comunicadoService.deletarComunicado(selectedComunicado.idComunicado);
      if (response.sucesso) {
        showSuccessToast('Comunicado excluído com sucesso');
        setShowDeleteModal(false);
        setSelectedComunicado(null);
        loadComunicados();
      } else {
        showErrorToast(response.mensagem || 'Erro ao excluir comunicado');
      }
    } catch (error) {
      showErrorToast('Erro ao excluir comunicado');
    }
  };

  const openDeleteModal = (comunicado: Comunicado) => {
    setSelectedComunicado(comunicado);
    setShowDeleteModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const tableHeaders = ['Título', 'Data', 'Status', 'Ações'];
  const tableData = comunicados.map(comunicado => [
    comunicado.titulo,
    formatDate(comunicado.dataComunicado),
    comunicado.indAtivo === 1 ? 'Ativo' : 'Inativo',
    <div key={comunicado.idComunicado} className="flex gap-2">
      <Button
        variant="danger"
        size="sm"
        onClick={() => openDeleteModal(comunicado)}
      >
        Excluir
      </Button>
    </div>
  ]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Carregando comunicados...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciar Comunicados</h1>
        <Button onClick={() => setShowModal(true)}>
          Novo Comunicado
        </Button>
      </div>

      <Table headers={tableHeaders} data={tableData} />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Novo Comunicado"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Título"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            required
          />
          <TextArea
            label="Mensagem"
            value={formData.mensagem}
            onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
            required
            rows={4}
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
              Salvar
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Excluir Comunicado"
        message="Tem certeza que deseja excluir este comunicado?"
      />
    </div>
  );
}
