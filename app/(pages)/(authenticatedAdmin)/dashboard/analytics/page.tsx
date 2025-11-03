'use client';

import { DashboardContainer } from "@/components/dashboard/DashboardContainer";
import { LineChart } from "@/components/dashboard/LineChart";
import { BarChart } from "@/components/dashboard/BarChart";
import { FuncionarioFilter } from "@/components/dashboard/FuncionarioFilter";
import { mockData, funcionarios } from "@/lib/mockData";
import { useState } from "react";
import { useLanguage } from "@/app/contexts/LanguageContext";

export default function DashboardPage() {
  const [selectedFuncionario, setSelectedFuncionario] = useState(1);
  const { t } = useLanguage();

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-black">{t('dashboard.analytics')}</h1>
        <FuncionarioFilter 
          selectedFuncionario={selectedFuncionario}
          onFuncionarioChange={setSelectedFuncionario}
        />
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