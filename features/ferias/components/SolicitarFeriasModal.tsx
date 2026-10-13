import React, { useState } from "react";
import { format } from "date-fns";
import { Calendar, Plane } from "lucide-react";
import Modal, { BotaoModal } from "@/shared/ui/Modal";
import { feriasService } from "@/features/ferias/api";
import { tokenUtils } from "@/shared/lib/token";
import { showErrorToast, showSuccessToast } from "@/shared/lib/toast";

// Atoms
import Input from "@/shared/ui/Input";

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
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      titulo="Solicitar férias"
      descricao="O pedido vai para o RH aprovar. Você acompanha em Solicitações."
      icone={<Plane className="h-5 w-5" />}
      bloqueado={isSubmitting}
      rodape={
        <>
          <BotaoModal variante="secundario" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </BotaoModal>
          <BotaoModal onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Enviando…" : "Solicitar"}
          </BotaoModal>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          id="ferias-descricao"
          label="Descrição"
          type="text"
          placeholder="Ex.: viagem em família"
          value={formData.dscObservacao}
          onChange={(e) => handleInputChange("dscObservacao", e.target.value)}
          error={errors.dscObservacao}
          disabled={isSubmitting}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            id="ferias-inicio"
            label="Primeiro dia"
            type="date"
            icon={<Calendar />}
            inputClassName="font-mono text-sm"
            value={formData.datInicioFerias}
            onChange={(e) => handleInputChange("datInicioFerias", e.target.value)}
            error={errors.datInicioFerias}
            disabled={isSubmitting}
            min={format(new Date(), "yyyy-MM-dd")}
          />
          <Input
            id="ferias-fim"
            label="Último dia"
            type="date"
            icon={<Calendar />}
            inputClassName="font-mono text-sm"
            value={formData.datFimFerias}
            onChange={(e) => handleInputChange("datFimFerias", e.target.value)}
            error={errors.datFimFerias}
            disabled={isSubmitting}
            min={formData.datInicioFerias || format(new Date(), "yyyy-MM-dd")}
          />
        </div>
      </div>
    </Modal>
  );
};
