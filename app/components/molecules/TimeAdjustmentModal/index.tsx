import React from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import Button from "@/app/components/atoms/Button";
import { TimeEntryInput, TimeEntry } from "@/app/components/atoms/TimeEntryInput";

interface TimeAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    entrada: TimeEntry;
    inicioAlmoco: TimeEntry;
    fimAlmoco: TimeEntry;
    saida: TimeEntry;
    justificativa: string;
  }) => void;
  initialData?: {
    entrada: TimeEntry;
    inicioAlmoco: TimeEntry;
    fimAlmoco: TimeEntry;
    saida: TimeEntry;
  };
}

export const TimeAdjustmentModal: React.FC<TimeAdjustmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = {
    entrada: { time: "", location: "" },
    inicioAlmoco: { time: "", location: "" },
    fimAlmoco: { time: "", location: "" },
    saida: { time: "", location: "" },
  },
}) => {
  const [formData, setFormData] = React.useState({
    entrada: initialData.entrada,
    inicioAlmoco: initialData.inicioAlmoco,
    fimAlmoco: initialData.fimAlmoco,
    saida: initialData.saida,
    justificativa: "",
  });

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg p-6 w-[90%] max-w-lg shadow-xl relative z-10"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-red-500 cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-[#002085] mb-6">
          Ajuste de Ponto
        </h2>

        <div>
          <TimeEntryInput
            label="Entrada"
            value={formData.entrada}
            onChange={(value) => setFormData({ ...formData, entrada: value })}
          />
          <TimeEntryInput
            label="Início do Almoço"
            value={formData.inicioAlmoco}
            onChange={(value) => setFormData({ ...formData, inicioAlmoco: value })}
          />
          <TimeEntryInput
            label="Fim do Almoço"
            value={formData.fimAlmoco}
            onChange={(value) => setFormData({ ...formData, fimAlmoco: value })}
          />
          <TimeEntryInput
            label="Saída"
            value={formData.saida}
            onChange={(value) => setFormData({ ...formData, saida: value })}
          />

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Justificativa
            </label>
            <textarea
              value={formData.justificativa}
              onChange={(e) =>
                setFormData({ ...formData, justificativa: e.target.value })
              }
              placeholder="Digite sua justificativa para o ajuste..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#002085] min-h-[100px]
              text-gray-800"
            />
          </div>

          <div className="flex gap-4">
            <Button
              text="Cancelar"
              backgroundColor="bg-gray-100"
              textColor="text-gray-700"
              onClick={onClose}
              fullWidth={false}
            />
            <Button
              text="Pedir Ajuste"
              backgroundColor="bg-[#002085]"
              textColor="text-white"
              onClick={handleSubmit}
              fullWidth={false}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}; 