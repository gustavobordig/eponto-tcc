'use client';

import { funcionarios } from "@/lib/mockData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/app/contexts/LanguageContext";

interface FuncionarioFilterProps {
  selectedFuncionario: number;
  onFuncionarioChange: (value: number) => void;
}

export function FuncionarioFilter({ selectedFuncionario, onFuncionarioChange }: FuncionarioFilterProps) {
  const { t } = useLanguage();
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-black">{t('dashboard.employee')}:</span>
      <Select
        value={selectedFuncionario.toString()}
        onValueChange={(value: string) => onFuncionarioChange(Number(value))}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder={t('dashboard.select-employee')} />
        </SelectTrigger>
        <SelectContent>
          {funcionarios.map((funcionario) => (
            <SelectItem key={funcionario.id} value={funcionario.id.toString()}>
              {funcionario.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
} 