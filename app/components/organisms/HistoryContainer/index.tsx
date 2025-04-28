"use client";

import { motion } from "framer-motion";
import { AnimatedContainer } from "@/app/components/atoms/AnimatedContainer";
import { AnimatedTableRow } from "@/app/components/atoms/AnimatedTableRow";
import { AnimatedButton } from "@/app/components/atoms/AnimatedButton";
import { TimeAdjustmentModal } from "@/app/components/molecules/TimeAdjustmentModal";
import { useState, useEffect } from "react";
import { getUserTimeRecords } from "@/services/timeRecord";
import { tokenUtils } from "@/utils/token";
import { getHorariosDoDia } from "@/utils/timeUtils";
import { formatInTimeZone } from 'date-fns-tz';
import { ptBR } from 'date-fns/locale';
import { getIdRegistroDoDia } from "@/utils/registroUtils";

interface RegistroPonto {
  data: string;
  entradaSaida: string;
  horasExtras: string;
  faltantes: string;
  saldo: string;
}

interface ApiRegistroPonto {
  id_Usuario: number;
  horaRegistro: string;
  dataRegistro: string;
  idTipoRegistroPonto: number;
  idRegistro: number;
}

export default function HistoricoContainer() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [registros, setRegistros] = useState<RegistroPonto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedRegistro, setSelectedRegistro] = useState<RegistroPonto | null>(null);
  const [registrosApi, setRegistrosApi] = useState<ApiRegistroPonto[]>([]);

  useEffect(() => {
    const fetchRegistros = async () => {
      try {
        const userId = tokenUtils.getId();
        if (!userId) return;

        const response = await getUserTimeRecords(Number(userId));

        if (response.sucesso && response.registros) {
          // Armazena os registros da API para uso posterior
          setRegistrosApi(response.registros);

          // Agrupa os registros por data
          const registrosPorData = response.registros.reduce((acc: { [key: string]: ApiRegistroPonto[] }, reg: ApiRegistroPonto) => {
            const data = reg.dataRegistro.split('T')[0];
            if (!acc[data]) {
              acc[data] = [];
            }
            acc[data].push(reg);
            return acc;
          }, {});

          // Formata os registros para exibição
          const registrosFormatados = (Object.entries(registrosPorData) as [string, ApiRegistroPonto[]][]).map(([data, regs]) => {
            
            console.log("data kkk: ", data);

            // Extrair ano, mês e dia da string de data
            const [ano, mes, dia] = data.split('-').map(Number);
            
            // Criar uma data usando os componentes extraídos
            const dataObj = new Date(ano, mes - 1, dia);
            
            // Formatar a data usando formatInTimeZone
            const dataFormatada = formatInTimeZone(dataObj, 'America/Sao_Paulo', 'EEE, dd/MM', {
              locale: ptBR
            });


            // Ordena os registros por hora
            regs.sort((a: ApiRegistroPonto, b: ApiRegistroPonto) => 
              new Date(a.horaRegistro).getTime() - new Date(b.horaRegistro).getTime()
            );

            // Pega o primeiro e último registro do dia
            const primeiroRegistro = regs[0];
            const ultimoRegistro = regs[regs.length - 1];

            const entrada = primeiroRegistro ? new Date(primeiroRegistro.horaRegistro).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit'
            }) : '--:--';

            const saida = ultimoRegistro ? new Date(ultimoRegistro.horaRegistro).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit'
            }) : '--:--';

            // Se houver apenas um registro, mostra a entrada com 'xx'
            const entradaSaida = regs.length === 1 ? `${entrada} - xx` : `${entrada} - ${saida}`;

            return {
              data: dataFormatada,
              entradaSaida,
              horasExtras: "00:00", // TODO: Calcular horas extras
              faltantes: "00:00", // TODO: Calcular horas faltantes
              saldo: "00:00" // TODO: Calcular saldo
            };
          });

          console.log("registrosApi: ", registrosApi);
          console.log("registrosFormatados: ", registrosFormatados);

          setRegistros(registrosFormatados);
        }
      } catch (error) {
        console.error('Erro ao buscar registros:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistros();
  }, []);


  const handleEditClick = (registro: RegistroPonto) => {

    console.log("registros api", registrosApi);
    setSelectedDate(registro.data);
    setSelectedRegistro(registro);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedRegistro(null);
  };

  interface TimeAdjustmentData {
    entrada: { time: string; location: string };
    inicioAlmoco: { time: string; location: string };
    fimAlmoco: { time: string; location: string };
    saida: { time: string; location: string };
  }

  const handleModalSubmit = (data: TimeAdjustmentData) => {
    console.log('Adjustment data:', data);
    handleModalClose();
  };

  return (
    <AnimatedContainer className="flex flex-col items-center justify-start min-h-screen">
      <motion.div 
        className="w-full border-2 border-[#002085] rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#002085] text-white">
                <th className="p-4 text-center">Data</th>
                <th className="p-4 text-center">Entrada/saída</th>
                <th className="p-4 text-center">Horas extras</th>
                <th className="p-4 text-center">Faltantes</th>
                <th className="p-4 text-center">Saldo</th>
                <th className="p-4 text-center">Ajuste</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-500">
                    Carregando registros...
                  </td>
                </tr>
              ) : registros.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-500">
                    Nenhum registro encontrado
                  </td>
                </tr>
              ) : (
                registros.map((registro, index) => (
                  <AnimatedTableRow 
                    key={index} 
                    className="border-b border-gray-200"
                  >
                    <td className="p-4 text-[#002085] text-center">{registro.data}</td>
                    <td className="p-4 text-[#002085] text-center">{registro.entradaSaida}</td>
                    <td className="p-4 text-green-500 text-center">{registro.horasExtras}</td>
                    <td className="p-4 text-red-500 text-center">{registro.faltantes}</td>
                    <td className="p-4 text-[#002085] text-center">{registro.saldo}</td>
                    <td className="p-4 text-center">
                      <AnimatedButton 
                        className="text-gray-500 hover:text-gray-700 p-2
                        hover:bg-gray-200 cursor-pointer hover:rounded-full"
                        onClick={() => handleEditClick(registro)}
                      >
                        ✏️
                      </AnimatedButton>
                    </td>
                  </AnimatedTableRow>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <TimeAdjustmentModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        selectedDate={selectedDate}
        initialData={getHorariosDoDia(selectedRegistro, registrosApi)}
        registrosDoDia={getIdRegistroDoDia(selectedRegistro, registrosApi)}
      />
    </AnimatedContainer>
  );
} 