import React from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import Button from "@/app/components/atoms/Button";
import { TimeEntryInput, TimeEntry } from "@/app/components/atoms/TimeEntryInput";
import { ajusteService } from "@/services/ajuste";
import { toast } from "react-hot-toast";
import { tokenUtils } from "@/utils/token";

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
  selectedDate?: string;
  registrosDoDia?: {
    entrada: number;
    inicioAlmoco: number;
    fimAlmoco: number;
    saida: number;
  };
}

export const TimeAdjustmentModal: React.FC<TimeAdjustmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  selectedDate,
  registrosDoDia,
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

  React.useEffect(() => {
    setFormData(prevData => ({
      ...prevData,
      entrada: initialData.entrada,
      inicioAlmoco: initialData.inicioAlmoco,
      fimAlmoco: initialData.fimAlmoco,
      saida: initialData.saida,
    }));
  }, [initialData]);

  if (!isOpen) return null;

  console.log("initialData", initialData);

  const handleSubmit = async () => {
    try {
      // Validar os dados do formulário antes de prosseguir
      const validateTimeFormat = (time: string) => {
        if (!time) return true; // Tempo vazio é permitido
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(time);
      };

      // Verificar se todos os tempos estão no formato correto
      if (
        (formData.entrada.time && !validateTimeFormat(formData.entrada.time)) ||
        (formData.inicioAlmoco.time && !validateTimeFormat(formData.inicioAlmoco.time)) ||
        (formData.fimAlmoco.time && !validateTimeFormat(formData.fimAlmoco.time)) ||
        (formData.saida.time && !validateTimeFormat(formData.saida.time))
      ) {
        toast.error('Formato de hora inválido. Use o formato HH:MM (ex: 09:30)');
        return;
      }

      const userId = tokenUtils.getId();
      if (!userId) {
        toast.error('Usuário não identificado. Por favor, faça login novamente.');
        return;
      }

      // Função para formatar data no formato YYYY-MM-DD
      const formatDate = (date: Date) => {
        try {
          if (isNaN(date.getTime())) {
            console.error('Data inválida fornecida para formatDate:', date);
            return new Date().toISOString().split('T')[0];
          }
          
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const formatted = `${year}-${month}-${day}`;
          console.log("Data formatada:", formatted);
          return formatted;
        } catch (error) {
          console.error('Erro ao formatar data:', error);
          return new Date().toISOString().split('T')[0];
        }
      };

      // Converter a data do formato pt-BR para Date
      const parseDate = (dateStr: string) => {
        if (!dateStr) return new Date();
        
        console.log("Data recebida para parse:", dateStr);
        
        // Remove o dia da semana e espaços extras
        const cleanDateStr = dateStr.replace(/^[a-záàâãéèêíïóôõöúçñ]+,?\s*/i, '').trim();
        console.log("Data limpa:", cleanDateStr);
        
        // Verifica se a string está no formato correto (DD/MM/YYYY)
        const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        const match = cleanDateStr.match(dateRegex);
        
        if (!match) {
          console.error('Formato de data inválido:', cleanDateStr);
          return new Date();
        }

        const [, day, month, year] = match;
        console.log("Componentes da data:", { day, month, year });
        
        // Criar a data no timezone local
        const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0);
        console.log("Data após parse:", parsedDate.toISOString());
        
        // Validação adicional para garantir que a data é válida
        if (isNaN(parsedDate.getTime())) {
          console.error('Data inválida após conversão:', cleanDateStr);
          return new Date();
        }
        
        return parsedDate;
      };

      const targetDate = selectedDate ? formatDate(parseDate(selectedDate)) : formatDate(new Date());
      console.log("Data selecionada original:", selectedDate);
      console.log("Data final formatada:", targetDate);
      
      if (!targetDate || targetDate === 'Invalid Date') {
        toast.error('Data selecionada inválida. Por favor, selecione uma data válida.');
        return;
      }

      console.log("targetDate: ", targetDate);

      const payload = {
        idSolicitante: parseInt(userId),
        dataRegistroAlteracao: targetDate,
        justificativa: formData.justificativa,
        itens: [
          ...(formData.entrada.time ? [{
            ...(registrosDoDia?.entrada ? { idRegistro: registrosDoDia.entrada } : {}),
            horaRegistro: `${targetDate}T${formData.entrada.time}:00`,
            idTipoRegistroPonto: 1
          }] : []),
          ...(formData.inicioAlmoco.time ? [{
            ...(registrosDoDia?.inicioAlmoco ? { idRegistro: registrosDoDia.inicioAlmoco } : {}),
            horaRegistro: `${targetDate}T${formData.inicioAlmoco.time}:00`,
            idTipoRegistroPonto: 2
          }] : []),
          ...(formData.fimAlmoco.time ? [{
            ...(registrosDoDia?.fimAlmoco ? { idRegistro: registrosDoDia.fimAlmoco } : {}),
            horaRegistro: `${targetDate}T${formData.fimAlmoco.time}:00`,
            idTipoRegistroPonto: 3
          }] : []),
          ...(formData.saida.time ? [{
            ...(registrosDoDia?.saida ? { idRegistro: registrosDoDia.saida } : {}),
            horaRegistro: `${targetDate}T${formData.saida.time}:00`,
            idTipoRegistroPonto: 4
          }] : [])
        ]
      };

      await ajusteService(payload);
      toast.success('Ajuste de ponto solicitado com sucesso!');
      onClose();
      onSubmit(formData);
    } catch (error) {
      console.error('Erro ao solicitar ajuste:', error);
      toast.error('Erro ao solicitar ajuste de ponto. Tente novamente.');
    }
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
        className="bg-white rounded-lg p-6 w-[90%] max-w-lg shadow-xl relative z-10 h-fit overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-red-500 cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-[#002085] mb-6">
          Ajuste de Ponto {selectedDate && `- ${selectedDate}`}
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