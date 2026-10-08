"use client";

import { motion } from "framer-motion";
import { AnimatedContainer } from "@/shared/ui/animations/AnimatedContainer";
import { AnimatedTableRow } from "@/shared/ui/animations/AnimatedTableRow";
import { Pencil } from "lucide-react";
import { TimeAdjustmentModal } from "@/features/ponto/components/AjustePontoModal";
import { useState, useEffect } from "react";
import { registroPontoService, RegistroPonto as ApiRegistroPonto } from "@/features/ponto/api";
import { bancoHorasService } from "@/features/bancoHoras/api";
import { tokenUtils } from "@/shared/lib/token";
import { getHorariosDoDia } from "@/features/ponto/lib/horarios";
import { formatInTimeZone } from 'date-fns-tz';
import { ptBR } from 'date-fns/locale';
import { getIdRegistroDoDia } from "@/features/ponto/lib/registroUtils";
import { formatSaldo } from "@/shared/lib/format";

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

            // Só com a entrada, a saída ainda está em aberto
            const entradaSaida = regs.length === 1 ? `${entrada} – …` : `${entrada} – ${saida}`;

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
        className="w-full overflow-hidden rounded-2xl bg-white shadow-sm"
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
                      <button
                        type="button"
                        onClick={() => handleEditClick(registro)}
                        aria-label={`Pedir ajuste do ponto de ${registro.data}`}
                        title="Pedir ajuste"
                        className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary-soft"
                      >
                        <Pencil className="h-4 w-4" aria-hidden />
                        <span className="hidden sm:inline">Ajustar</span>
                      </button>
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