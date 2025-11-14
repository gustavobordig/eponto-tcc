'use client';

import { DashboardContainer } from "@/components/dashboard/DashboardContainer";
import { LineChart } from "@/components/dashboard/LineChart";
import { BarChart } from "@/components/dashboard/BarChart";
import { PieChart } from "@/components/dashboard/PieChart";
import { AreaChart } from "@/components/dashboard/AreaChart";
import { ComposedChart } from "@/components/dashboard/ComposedChart";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { FuncionarioFilter } from "@/components/dashboard/FuncionarioFilter";
import { mockData, funcionarios } from "@/lib/mockData";
import { useLanguage } from '@/app/contexts/LanguageContext';
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ChartType = 
  | 'horas-trabalhadas'
  | 'saldo-horas'
  | 'horas-vs-extras'
  | 'status-ausencias'
  | 'pontualidade'
  | 'atrasos'
  | 'registros-dia'
  | 'registros-periodo'
  | 'horas-extras'
  | 'registros-periodo-barras';

interface ChartOption {
  value: ChartType;
  label: string;
  description: string;
}

const chartOptions: ChartOption[] = [
  { 
    value: 'horas-trabalhadas', 
    label: 'Horas Trabalhadas por Mês', 
    description: 'Evolução mensal das horas trabalhadas' 
  },
  { 
    value: 'saldo-horas', 
    label: 'Saldo de Horas Acumulado', 
    description: 'Saldo de horas acumulado ao longo dos meses' 
  },
  { 
    value: 'horas-vs-extras', 
    label: 'Horas Trabalhadas vs Horas Extras', 
    description: 'Comparativo entre horas trabalhadas e horas extras' 
  },
  { 
    value: 'status-ausencias', 
    label: 'Status de Solicitações de Ausência', 
    description: 'Distribuição de status das solicitações de ausência' 
  },
  { 
    value: 'pontualidade', 
    label: 'Pontualidade Mensal', 
    description: 'Percentual de pontualidade por mês' 
  },
  { 
    value: 'atrasos', 
    label: 'Atrasos por Mês', 
    description: 'Quantidade de atrasos registrados por mês' 
  },
  { 
    value: 'registros-dia', 
    label: 'Registros por Dia da Semana', 
    description: 'Distribuição de registros por dia da semana' 
  },
  { 
    value: 'registros-periodo', 
    label: 'Registros por Período do Dia (Pizza)', 
    description: 'Distribuição de registros por turno' 
  },
  { 
    value: 'horas-extras', 
    label: 'Horas Extras por Mês', 
    description: 'Acumulado de horas extras trabalhadas' 
  },
  { 
    value: 'registros-periodo-barras', 
    label: 'Registros por Período (Barras)', 
    description: 'Registros por período do dia em formato de barras' 
  },
];

export default function DashboardPage() {
  const { t } = useLanguage();
  const [selectedFuncionario, setSelectedFuncionario] = useState(1);
  const [selectedChart, setSelectedChart] = useState<ChartType>('horas-trabalhadas');

  const funcionarioNome = funcionarios.find(f => f.id === selectedFuncionario)?.nome || "";
  const selectedChartOption = chartOptions.find(opt => opt.value === selectedChart);

  const renderChart = () => {
    switch (selectedChart) {
      case 'horas-trabalhadas':
        return (
          <DashboardContainer title="Horas Trabalhadas por Mês">
            <LineChart 
              data={mockData.horasTrabalhadas[selectedFuncionario]} 
              color="#2563eb"
              title="Evolução Mensal"
              description={`Total de horas trabalhadas - ${funcionarioNome}`}
            />
          </DashboardContainer>
        );

      case 'saldo-horas':
        return (
          <DashboardContainer title="Saldo de Horas Acumulado">
            <AreaChart 
              data={mockData.saldoHoras[selectedFuncionario]} 
              color="#16a34a"
              title="Saldo Mensal"
              description={`Saldo de horas acumulado - ${funcionarioNome}`}
            />
          </DashboardContainer>
        );

      case 'horas-vs-extras':
        return (
          <DashboardContainer title="Horas Trabalhadas vs Horas Extras">
            <ComposedChart 
              data={mockData.horasVsExtras[selectedFuncionario]} 
              barColor="#2563eb"
              lineColor="#dc2626"
              barName="Horas Trabalhadas"
              lineName="Horas Extras"
              title="Comparativo Mensal"
              description={`Análise comparativa - ${funcionarioNome}`}
            />
          </DashboardContainer>
        );

      case 'status-ausencias':
        return (
          <DashboardContainer title="Status de Solicitações de Ausência">
            <PieChart 
              data={mockData.statusAusencias[selectedFuncionario]} 
              colors={['#ca8a04', '#16a34a', '#dc2626']}
              title="Distribuição de Status"
              description={`Solicitações de ausência - ${funcionarioNome}`}
            />
          </DashboardContainer>
        );

      case 'pontualidade':
        return (
          <DashboardContainer title="Pontualidade Mensal">
            <LineChart 
              data={mockData.pontualidade[selectedFuncionario]} 
              color="#7c3aed"
              title="Percentual de Pontualidade"
              description={`Taxa de pontualidade por mês - ${funcionarioNome}`}
            />
          </DashboardContainer>
        );

      case 'atrasos':
        return (
          <DashboardContainer title="Atrasos por Mês">
            <BarChart 
              data={mockData.atrasos[selectedFuncionario]} 
              color="#dc2626"
              title="Frequência de Atrasos"
              description={`Quantidade de atrasos - ${funcionarioNome}`}
            />
          </DashboardContainer>
        );

      case 'registros-dia':
        return (
          <DashboardContainer title="Registros por Dia da Semana">
            <BarChart 
              data={mockData.registrosPorDia[selectedFuncionario]} 
              color="#16a34a"
              title="Distribuição Semanal"
              description={`Registros de ponto por dia - ${funcionarioNome}`}
            />
          </DashboardContainer>
        );

      case 'registros-periodo':
        return (
          <DashboardContainer title="Registros por Período do Dia">
            <PieChart 
              data={mockData.registrosPorPeriodo[selectedFuncionario]} 
              colors={['#2563eb', '#16a34a', '#7c3aed']}
              title="Distribuição por Turno"
              description={`Registros por período - ${funcionarioNome}`}
            />
          </DashboardContainer>
        );

      case 'horas-extras':
        return (
          <DashboardContainer title="Horas Extras por Mês">
            <AreaChart 
              data={mockData.horasExtras[selectedFuncionario]} 
              color="#dc2626"
              title="Acumulado de Horas Extras"
              description={`Horas extras trabalhadas - ${funcionarioNome}`}
            />
          </DashboardContainer>
        );

      case 'registros-periodo-barras':
        return (
          <DashboardContainer title="Registros por Período">
            <BarChart 
              data={mockData.registrosPorPeriodo[selectedFuncionario]} 
              color="#7c3aed"
              title="Distribuição Diária"
              description={`Registros por período do dia - ${funcionarioNome}`}
            />
          </DashboardContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-black">Analytics</h1>
          <p className="text-sm text-gray-600 mt-1">Análise detalhada de dados de ponto e ausências</p>
        </div>
        <FuncionarioFilter 
          selectedFuncionario={selectedFuncionario}
          onFuncionarioChange={setSelectedFuncionario}
        />
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {mockData.metricasGerais[selectedFuncionario].map((metric, index) => (
          <MetricCard key={index} metric={metric} />
        ))}
      </div>

      {/* Seletor de Gráfico */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecione o Gráfico
            </label>
            <Select
              value={selectedChart}
              onValueChange={(value: string) => setSelectedChart(value as ChartType)}
            >
              <SelectTrigger className="w-full sm:w-[400px]">
                <SelectValue placeholder="Selecione um gráfico" />
              </SelectTrigger>
              <SelectContent>
                {chartOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedChartOption && (
              <p className="text-xs text-gray-500 mt-2">
                {selectedChartOption.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Gráfico Selecionado */}
      <div className="w-full">
        {renderChart()}
      </div>
    </div>
  );
}
