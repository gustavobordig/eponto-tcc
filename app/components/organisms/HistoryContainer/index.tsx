"use client";

import { motion } from "framer-motion";
import { AnimatedContainer } from "@/app/components/atoms/AnimatedContainer";
import { AnimatedTableRow } from "@/app/components/atoms/AnimatedTableRow";
import { AnimatedButton } from "@/app/components/atoms/AnimatedButton";
import { TimeAdjustmentModal } from "@/app/components/molecules/TimeAdjustmentModal";
import { useState, useEffect } from "react";
import { registroPontoService, RegistroPonto as ApiRegistroPonto } from "@/services/registroPonto";
import { bancoHorasService } from "@/services/bancoHoras";
import { tokenUtils } from "@/utils/token";
import { getHorariosDoDia } from "@/utils/timeUtils";
import { formatInTimeZone } from 'date-fns-tz';
import { ptBR } from 'date-fns/locale';
import { getIdRegistroDoDia } from "@/utils/registroUtils";
import { formatSaldo } from "@/utils/timeUtils";

interface RegistroPonto {
  data: string;
  entradaSaida: string;
  horasExtras: string;
  faltantes: string;
  dataOriginal: string;
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

        const response = await registroPontoService.listarPorUsuario(Number(userId));

        if (response.sucesso && response.registros) {
          setRegistrosApi(response.registros);

          const registrosPorData = response.registros.reduce((acc: { [key: string]: ApiRegistroPonto[] }, reg: ApiRegistroPonto) => {
            const data = reg.dataRegistro.split('T')[0];
            if (!acc[data]) {
              acc[data] = [];
            }
            acc[data].push(reg);
            return acc;
          }, {});

          // Uma chamada só para os saldos; antes era uma por dia, sempre com a lista inteira
          const saldoPorData = new Map<string, string>();
          try {
            const saldos = await bancoHorasService.obterSaldosDiarios(Number(userId));
            saldos.saldosDiarios?.forEach((saldo) => {
              saldoPorData.set(saldo.dataReferencia.split('T')[0], saldo.saldoDiario);
            });
          } catch (error) {
            console.error('Erro ao obter saldos diários:', error);
          }

          const registrosFormatados = Object.entries(registrosPorData).map(([data, regs]) => {
            const [ano, mes, dia] = data.split('-').map(Number);
            const dataObj = new Date(ano, mes - 1, dia);
            const dataFormatada = formatInTimeZone(dataObj, 'America/Sao_Paulo', 'EEE, dd/MM/yyyy', {
              locale: ptBR
            });

            regs.sort((a, b) => new Date(a.horaRegistro).getTime() - new Date(b.horaRegistro).getTime());

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

            const entradaSaida = regs.length === 1 ? `${entrada} - xx` : `${entrada} - ${saida}`;

            const saldo = saldoPorData.get(data);
            const negativo = saldo?.startsWith('-') ?? false;

            return {
              data: dataFormatada,
              dataOriginal: data,
              entradaSaida,
              horasExtras: saldo && !negativo ? formatSaldo(saldo) : "0h",
              faltantes: saldo && negativo ? formatSaldo(saldo.substring(1)) : "0h"
            };
          });

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

    setSelectedDate(registro.data);
    setSelectedRegistro(registro);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedRegistro(null);
  };

  const handleModalSubmit = () => {
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
                <th className="p-4 text-center">Ajuste</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">
                    Carregando registros...
                  </td>
                </tr>
              ) : registros.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">
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