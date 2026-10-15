'use client';

import { DashboardContainer } from "@/features/analytics/components/DashboardContainer";
import { LineChart } from "@/features/analytics/components/LineChart";
import { BarChart } from "@/features/analytics/components/BarChart";
import { FuncionarioFilter } from "@/features/analytics/components/FuncionarioFilter";
import { mockData, funcionarios } from "@/features/analytics/demoData";
import { useState } from "react";
import DemoBadge from "@/shared/ui/DemoBadge";

export default function DashboardPage() {
  const [selectedFuncionario, setSelectedFuncionario] = useState(1);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold text-foreground">Estatísticas</h1>
          <DemoBadge label="Dados de exemplo: ainda não ligado à API" />
        </div>
        <FuncionarioFilter 
          selectedFuncionario={selectedFuncionario}
          onFuncionarioChange={setSelectedFuncionario}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardContainer title="Horas Trabalhadas por Mês">
          <LineChart 
            data={mockData.horasTrabalhadas[selectedFuncionario]} 
            color="#2563eb"
            title="Evolução Mensal"
            description={`Total de horas trabalhadas por mês - ${funcionarios.find(f => f.id === selectedFuncionario)?.nome}`}
          />
        </DashboardContainer>

        <DashboardContainer title="Registros por Dia da Semana">
          <BarChart 
            data={mockData.registrosPorDia[selectedFuncionario]} 
            color="#16a34a"
            title="Distribuição Semanal"
            description={`Quantidade de registros por dia da semana - ${funcionarios.find(f => f.id === selectedFuncionario)?.nome}`}
          />
        </DashboardContainer>

        <DashboardContainer title="Horas Extras por Mês">
          <LineChart 
            data={mockData.horasExtras[selectedFuncionario]} 
            color="#dc2626"
            title="Acumulado Mensal"
            description={`Total de horas extras realizadas por mês - ${funcionarios.find(f => f.id === selectedFuncionario)?.nome}`}
          />
        </DashboardContainer>

        <DashboardContainer title="Atrasos por Mês">
          <LineChart 
            data={mockData.atrasos[selectedFuncionario]} 
            color="#ca8a04"
            title="Frequência de Atrasos"
            description={`Quantidade de atrasos registrados por mês - ${funcionarios.find(f => f.id === selectedFuncionario)?.nome}`}
          />
        </DashboardContainer>

        <DashboardContainer title="Registros por Período do Dia">
          <BarChart 
            data={mockData.registrosPorPeriodo[selectedFuncionario]} 
            color="#7c3aed"
            title="Distribuição por Período"
            description={`Quantidade de registros por período do dia - ${funcionarios.find(f => f.id === selectedFuncionario)?.nome}`}
          />
        </DashboardContainer>
      </div>
    </div>
  );
} 