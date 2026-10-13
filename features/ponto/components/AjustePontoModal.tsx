import React from "react";
import { Clock } from "lucide-react";
import Modal, { BotaoModal } from "@/shared/ui/Modal";
import TextArea from "@/shared/ui/TextArea";
import { ETAPAS_DO_DIA } from "@/features/ponto/etapas";
import { TimeEntryInput, TimeEntry } from "@/features/ponto/components/TimeEntryInput";
import { registroPontoService } from "@/features/ponto/api";
import { toast } from "react-hot-toast";
import { tokenUtils } from "@/shared/lib/token";

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

// Fora do componente: um objeto novo a cada render disparava o efeito que
// reinicia o formulário, em loop ("Maximum update depth exceeded")
const HORARIOS_VAZIOS = {
  entrada: { time: "", location: "" },
  inicioAlmoco: { time: "", location: "" },
  fimAlmoco: { time: "", location: "" },
  saida: { time: "", location: "" },
};

export const TimeAdjustmentModal: React.FC<TimeAdjustmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  selectedDate,
  registrosDoDia,
  initialData = HORARIOS_VAZIOS,
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
          return formatted;
        } catch (error) {
          console.error('Erro ao formatar data:', error);
          return new Date().toISOString().split('T')[0];
        }
      };

      // Converter a data do formato pt-BR para Date
      const parseDate = (dateStr: string) => {
        if (!dateStr) return new Date();
        
        
        // Remove o dia da semana e espaços extras
        const cleanDateStr = dateStr.replace(/^[a-záàâãéèêíïóôõöúçñ]+,?\s*/i, '').trim();
        
        // Verifica se a string está no formato correto (DD/MM/YYYY)
        const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        const match = cleanDateStr.match(dateRegex);
        
        if (!match) {
          console.error('Formato de data inválido:', cleanDateStr);
          return new Date();
        }

        const [, day, month, year] = match;
        
        // Criar a data no timezone local
        const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0);
        
        // Validação adicional para garantir que a data é válida
        if (isNaN(parsedDate.getTime())) {
          console.error('Data inválida após conversão:', cleanDateStr);
          return new Date();
        }
        
        return parsedDate;
      };

      const targetDate = selectedDate ? formatDate(parseDate(selectedDate)) : formatDate(new Date());
      
      if (!targetDate || targetDate === 'Invalid Date') {
        toast.error('Data selecionada inválida. Por favor, selecione uma data válida.');
        return;
      }


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

      await registroPontoService.solicitarAlteracao(payload);
      toast.success('Ajuste de ponto solicitado com sucesso!');
      onClose();
      onSubmit(formData);
    } catch (error) {
      console.error('Erro ao solicitar ajuste:', error);
      toast.error('Erro ao solicitar ajuste de ponto. Tente novamente.');
    }
  };  

  const campos = [
    { chave: 'entrada', tipo: 1 },
    { chave: 'inicioAlmoco', tipo: 2 },
    { chave: 'fimAlmoco', tipo: 3 },
    { chave: 'saida', tipo: 4 },
  ] as const;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      titulo="Pedir ajuste de ponto"
      descricao={selectedDate ? `Dia ${selectedDate}. Corrija os horários e explique ao RH o que aconteceu.` : undefined}
      icone={<Clock className="h-5 w-5" />}
      rodape={
        <>
          <BotaoModal variante="secundario" onClick={onClose}>
            Cancelar
          </BotaoModal>
          <BotaoModal onClick={handleSubmit}>Pedir Ajuste</BotaoModal>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          {campos.map(({ chave, tipo }) => {
            const etapa = ETAPAS_DO_DIA.find((e) => e.tipo === tipo)!;
            return (
              <TimeEntryInput
                key={chave}
                label={etapa.label}
                icone={etapa.icone('h-3.5 w-3.5')}
                value={formData[chave]}
                onChange={(value) => setFormData({ ...formData, [chave]: value })}
              />
            );
          })}
        </div>
        <TextArea
          id="ajuste-justificativa"
          label="Justificativa"
          value={formData.justificativa}
          onChange={(e) => setFormData({ ...formData, justificativa: e.target.value })}
          placeholder="Ex.: esqueci de registrar a volta do almoço."
        />
      </div>
    </Modal>
  );
};
