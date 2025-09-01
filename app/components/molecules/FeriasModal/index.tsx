import React, { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, X } from "lucide-react";
import { SlideUp } from "@/app/Animations/sliderUp";
import { feriasService } from "@/services/ferias";
import { tokenUtils } from "@/utils/token";
import { showErrorToast, showSuccessToast } from "@/utils/toast";

// Atoms
import Button from "@/app/components/atoms/Button";
import Input from "@/app/components/atoms/Input";

interface FeriasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const FeriasModal: React.FC<FeriasModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    dscObservacao: "",
    datInicioFerias: "",
    datFimFerias: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.dscObservacao.trim()) {
      newErrors.dscObservacao = "Descrição é obrigatória";
    }

    if (!formData.datInicioFerias) {
      newErrors.datInicioFerias = "Data de início é obrigatória";
    } else {
      const inicioDate = new Date(formData.datInicioFerias);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      if (inicioDate < hoje) {
        newErrors.datInicioFerias = "Data de início não pode ser anterior a hoje";
      }
    }

    if (!formData.datFimFerias) {
      newErrors.datFimFerias = "Data de fim é obrigatória";
    } else {
      const fimDate = new Date(formData.datFimFerias);
      const inicioDate = formData.datInicioFerias ? new Date(formData.datInicioFerias) : null;
      
      if (inicioDate && fimDate <= inicioDate) {
        newErrors.datFimFerias = "Data de fim deve ser posterior à data de início";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      const payload = {
        dscObservacao: formData.dscObservacao,
        datInicioFerias: formData.datInicioFerias,
        datFimFerias: formData.datFimFerias,
        idUsuario: Number(tokenUtils.getId()),
      };

      await feriasService.solicitarFerias(payload);
      showSuccessToast("Solicitação de férias enviada com sucesso!");
      
      // Reset form
      setFormData({
        dscObservacao: "",
        datInicioFerias: "",
        datFimFerias: "",
      });
      setErrors({});
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Erro ao solicitar férias:", error);
      showErrorToast("Erro ao solicitar férias. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        dscObservacao: "",
        datInicioFerias: "",
        datFimFerias: "",
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm"
        onClick={handleClose}
      />
      <SlideUp>
        <div className="bg-white rounded-lg p-6 w-[500px] max-w-md shadow-xl relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                Solicitar Férias
              </h2>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <Input
                type="text"
                placeholder="Ex: Férias de verão"
                value={formData.dscObservacao}
                onChange={(e) => handleInputChange("dscObservacao", e.target.value)}
                error={errors.dscObservacao}
                disabled={isSubmitting}
              />
            </div>

            {/* Data de Início */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Início
              </label>
              <Input
                type="date"
                value={formData.datInicioFerias}
                onChange={(e) => handleInputChange("datInicioFerias", e.target.value)}
                error={errors.datInicioFerias}
                disabled={isSubmitting}
                min={format(new Date(), "yyyy-MM-dd")}
              />
            </div>

            {/* Data de Fim */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Fim
              </label>
              <Input
                type="date"
                value={formData.datFimFerias}
                onChange={(e) => handleInputChange("datFimFerias", e.target.value)}
                error={errors.datFimFerias}
                disabled={isSubmitting}
                min={formData.datInicioFerias || format(new Date(), "yyyy-MM-dd")}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            <Button
              text={isSubmitting ? "Enviando..." : "Solicitar"}
              backgroundColor="bg-blue-600"
              textColor="text-white"
              onClick={handleSubmit}
              hoverSwapColors={false}
              disabled={isSubmitting}
              className="flex-1"
            />
            <Button
              text="Cancelar"
              backgroundColor="bg-gray-500"
              textColor="text-white"
              onClick={handleClose}
              hoverSwapColors={false}
              disabled={isSubmitting}
              className="flex-1"
            />
          </div>
        </div>
      </SlideUp>
    </div>
  );
};