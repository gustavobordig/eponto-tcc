'use client';

import { DashboardContainer } from "@/components/dashboard/DashboardContainer";
import { LineChart } from "@/components/dashboard/LineChart";
import { BarChart } from "@/components/dashboard/BarChart";
import { FuncionarioFilter } from "@/components/dashboard/FuncionarioFilter";
import { mockData, funcionarios } from "@/lib/mockData";
import { useState, useEffect } from "react";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { relatorioService } from "@/services/relatorio";
import Input from "@/app/components/atoms/Input";
import Button from "@/app/components/atoms/Button";

export default function DashboardPage() {
  const [selectedFuncionario, setSelectedFuncionario] = useState(1);
  const { t } = useLanguage();
  
  // Estados para o relatório de horas extras
  const [dataInicio, setDataInicio] = useState<string>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [dataFim, setDataFim] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [relatorioData, setRelatorioData] = useState<Array<{ name: string; value: number }>>([]);
  const [loadingRelatorio, setLoadingRelatorio] = useState(false);

  // Buscar dados do relatório
  const fetchRelatorio = async () => {
    try {
      setLoadingRelatorio(true);
      const response = await relatorioService.relatorioHorasExtras({
        datInicio: dataInicio,
        datFim: dataFim,
      });

      if (response.sucesso && response.listaItens) {
        // Converter dados para o formato do gráfico
        const chartData = response.listaItens.map((item) => ({
          name: item.nomeUsuario,
          value: parseFloat(item.saldoHoras),
        }));
        setRelatorioData(chartData);
      } else {
        setRelatorioData([]);
      }
    } catch (error) {
      console.error('Erro ao buscar relatório:', error);
      setRelatorioData([]);
    } finally {
      setLoadingRelatorio(false);
    }
  };

  useEffect(() => {
    fetchRelatorio();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-black">{t('dashboard.analytics')}</h1>
        <FuncionarioFilter 
          selectedFuncionario={selectedFuncionario}
          onFuncionarioChange={setSelectedFuncionario}
        />
      </div>

      {/* Relatório de Horas Extras */}
      <div className="mb-6">
        <DashboardContainer title="Relatório de Saldo de Horas">
          <div className="mb-4 flex gap-4 items-end flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Input
                label="Data Início"
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <Input
                label="Data Fim"
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>
            <Button
              text={loadingRelatorio ? 'Carregando...' : 'Buscar'}
              onClick={fetchRelatorio}
              disabled={loadingRelatorio}
              isLoading={loadingRelatorio}
              fullWidth={false}
              className="min-w-[120px]"
            />
          </div>
          {relatorioData.length > 0 ? (
            <BarChart 
              data={relatorioData} 
              color="#dc2626"
              title="Saldo de Horas por Usuário"
              description={`Período: ${new Date(dataInicio).toLocaleDateString('pt-BR')} até ${new Date(dataFim).toLocaleDateString('pt-BR')}`}
            />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              {loadingRelatorio ? 'Carregando dados...' : 'Nenhum dado encontrado para o período selecionado'}
            </div>
          )}
        </DashboardContainer>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardContainer title={t('dashboard.hours-worked-month')}>
          <LineChart 
            data={mockData.horasTrabalhadas[selectedFuncionario]} 
            color="#2563eb"
            title={t('dashboard.monthly-evolution')}
            description={`${t('dashboard.total-hours-month')} - ${funcionarios.find(f => f.id === selectedFuncionario)?.nome}`}
          />
        </DashboardContainer>

        <DashboardContainer title={t('dashboard.records-day-week')}>
          <BarChart 
            data={mockData.registrosPorDia[selectedFuncionario]} 
            color="#16a34a"
            title={t('dashboard.weekly-distribution')}
            description={`${t('dashboard.records-week-day')} - ${funcionarios.find(f => f.id === selectedFuncionario)?.nome}`}
          />
        </DashboardContainer>

        <DashboardContainer title={t('dashboard.overtime-month')}>
          <LineChart 
            data={mockData.horasExtras[selectedFuncionario]} 
            color="#dc2626"
            title={t('dashboard.monthly-accumulated')}
            description={`${t('dashboard.overtime-month-total')} - ${funcionarios.find(f => f.id === selectedFuncionario)?.nome}`}
          />
        </DashboardContainer>

        <DashboardContainer title={t('dashboard.delays-month')}>
          <LineChart 
            data={mockData.atrasos[selectedFuncionario]} 
            color="#ca8a04"
            title={t('dashboard.delay-frequency')}
            description={`${t('dashboard.delays-month-total')} - ${funcionarios.find(f => f.id === selectedFuncionario)?.nome}`}
          />
        </DashboardContainer>

        <DashboardContainer title={t('dashboard.records-time-day')}>
          <BarChart 
            data={mockData.registrosPorPeriodo[selectedFuncionario]} 
            color="#7c3aed"
            title={t('dashboard.records-by-time')}
            description={`${t('dashboard.records-time-period')} - ${funcionarios.find(f => f.id === selectedFuncionario)?.nome}`}
          />
        </DashboardContainer>
      </div>
    </div>
  );
} 