'use client';

import { funcionarios } from "@/features/analytics/demoData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/primitives/select";

interface FuncionarioFilterProps {
  selectedFuncionario: number;
  onFuncionarioChange: (value: number) => void;
}

export function FuncionarioFilter({ selectedFuncionario, onFuncionarioChange }: FuncionarioFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0 text-sm font-medium text-foreground">Funcionário:</span>
      <Select
        value={selectedFuncionario.toString()}
        onValueChange={(value: string) => onFuncionarioChange(Number(value))}
      >
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="Selecione um funcionário" />
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