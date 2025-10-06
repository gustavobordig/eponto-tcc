"use client";

import { useState } from "react";
import { tokenUtils } from "@/utils/token";
import { solicitacaoAusenciaService, SolicitacaoAusenciaInsert } from "@/services/solicitacaoAusencia";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { useRouter } from "next/navigation";
import Button from "@/app/components/atoms/Button";
import Input from "@/app/components/atoms/Input";
import TextArea from "@/app/components/atoms/TextArea";

export default function SolicitarAusenciaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    mensagemSolicitacao: "",
    dataInicioAusencia: "",
    dataFimAusencia: "",
    arquivo: null as File | null
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.mensagemSolicitacao.trim()) {
      newErrors.mensagemSolicitacao = "Justificativa é obrigatória";
    }

    if (!formData.dataInicioAusencia) {
      newErrors.dataInicioAusencia = "Data de início é obrigatória";
    }

    if (!formData.dataFimAusencia) {
      newErrors.dataFimAusencia = "Data de fim é obrigatória";
    }

    if (formData.dataInicioAusencia && formData.dataFimAusencia) {
      const inicio = new Date(formData.dataInicioAusencia);
      const fim = new Date(formData.dataFimAusencia);
      
      if (fim < inicio) {
        newErrors.dataFimAusencia = "Data de fim deve ser posterior à data de início";
      }
    }

    if (!formData.arquivo) {
      newErrors.arquivo = "Atestado médico é obrigatório";
    } else {
      // Validar tipo de arquivo
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(formData.arquivo.type)) {
        newErrors.arquivo = "Tipo de arquivo não permitido. Use PDF, JPEG, PNG, WebP, DOC ou DOCX";
      }
      
      // Validar tamanho (50MB)
      if (formData.arquivo.size > 50 * 1024 * 1024) {
        newErrors.arquivo = "Arquivo muito grande. Tamanho máximo: 50MB";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, arquivo: file }));
    if (errors.arquivo) {
      setErrors(prev => ({ ...prev, arquivo: "" }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const userId = tokenUtils.getId();
      if (!userId) {
        showErrorToast("Usuário não encontrado");
        router.push('/');
        return;
      }

      const solicitacaoData: SolicitacaoAusenciaInsert = {
        idUsuario: Number(userId),
        mensagemSolicitacao: formData.mensagemSolicitacao,
        dataInicioAusencia: formData.dataInicioAusencia,
        dataFimAusencia: formData.dataFimAusencia,
        arquivo: formData.arquivo!,
        camposAtivos: ['mensagemSolicitacao', 'dataInicioAusencia', 'dataFimAusencia', 'arquivo']
      };

      const response = await solicitacaoAusenciaService.inserirSolicitacao(solicitacaoData);
      
      if (response.sucesso) {
        showSuccessToast("Solicitação de ausência enviada com sucesso!");
        setShowModal(true);
      } else {
        showErrorToast(response.mensagem || "Erro ao enviar solicitação");
      }
    } catch (error) {
      console.error("Erro ao enviar solicitação:", error);
      showErrorToast("Erro ao enviar solicitação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    router.push('/minhas-solicitacoes');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Solicitar Ausência
        </h1>
        
        <div className="space-y-6">
          <div>
            <TextArea
              label="Justificativa da Ausência *"
              value={formData.mensagemSolicitacao}
              onChange={(e) => handleInputChange('mensagemSolicitacao', e.target.value)}
              placeholder="Descreva o motivo da sua ausência..."
              rows={4}
              error={errors.mensagemSolicitacao}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Data de Início *"
                type="date"
                value={formData.dataInicioAusencia}
                onChange={(e) => handleInputChange('dataInicioAusencia', e.target.value)}
                error={errors.dataInicioAusencia}
              />
            </div>
            
            <div>
              <Input
                label="Data de Fim *"
                type="date"
                value={formData.dataFimAusencia}
                onChange={(e) => handleInputChange('dataFimAusencia', e.target.value)}
                error={errors.dataFimAusencia}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Atestado Médico *
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {errors.arquivo && (
              <p className="mt-1 text-sm text-red-600">{errors.arquivo}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Formatos aceitos: PDF, JPEG, PNG, WebP, DOC, DOCX (máx. 50MB)
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              text={loading ? "Enviando..." : "Enviar Solicitação"}
              backgroundColor="bg-blue-600"
              textColor="text-white"
              onClick={handleSubmit}
              disabled={loading}
              fullWidth={true}
            />
            
            <Button
              text="Cancelar"
              backgroundColor="bg-gray-200"
              textColor="text-gray-700"
              onClick={() => router.back()}
              fullWidth={true}
            />
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Solicitação Enviada</h2>
              <p className="text-gray-600 mb-4">
                Sua solicitação de ausência foi enviada com sucesso!
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Você pode acompanhar o status da sua solicitação na página "Minhas Solicitações".
              </p>
              <Button
                text="Ver Minhas Solicitações"
                backgroundColor="bg-blue-600"
                textColor="text-white"
                onClick={handleModalClose}
                fullWidth={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}