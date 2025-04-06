"use client";

import { motion } from "framer-motion";
import { AnimatedContainer } from "@/app/components/atoms/AnimatedContainer";
import { AnimatedTableRow } from "@/app/components/atoms/AnimatedTableRow";
import { AnimatedButton } from "@/app/components/atoms/AnimatedButton";
import { TimeAdjustmentModal } from "@/app/components/molecules/TimeAdjustmentModal";
import { useState } from "react";

interface RegistroPonto {
  data: string;
  entradaSaida: string;
  horasExtras: string;
  faltantes: string;
  saldo: string;
}

export default function HistoricoContainer() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRegistro, setSelectedRegistro] = useState<RegistroPonto | null>(null);

  const registros: RegistroPonto[] = [
    { data: "Dom - 23/02", entradaSaida: "9:00 - 18:00", horasExtras: "00:00", faltantes: "00:00", saldo: "00:00" },
    { data: "Dom - 23/02", entradaSaida: "9:00 - 18:00", horasExtras: "00:00", faltantes: "02:00", saldo: "02:00" },
    { data: "Dom - 23/02", entradaSaida: "9:00 - 18:00", horasExtras: "00:30", faltantes: "00:00", saldo: "00:00" },
    { data: "Dom - 23/02", entradaSaida: "9:00 - 18:00", horasExtras: "00:30", faltantes: "00:00", saldo: "00:00" },
  ];

  const handleEditClick = (registro: RegistroPonto) => {
    setSelectedRegistro(registro);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedRegistro(null);
  };

  const handleModalSubmit = (data: any) => {
    console.log('Adjustment data:', data);
    // TODO: Implement the adjustment logic
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
              {registros.map((registro, index) => (
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
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <TimeAdjustmentModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        initialData={{
          entrada: { time: "09:00", location: "Escritório" },
          inicioAlmoco: { time: "12:00", location: "Escritório" },
          fimAlmoco: { time: "13:00", location: "Escritório" },
          saida: { time: "18:00", location: "Escritório" },
        }}
      />
    </AnimatedContainer>
  );
} 