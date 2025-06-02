'use client';

import { funcionarios } from "@/lib/mockData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FuncionarioFilterProps {
  selectedFuncionario: number;
  onFuncionarioChange: (value: number) => void;
}

export function FuncionarioFilter({ selectedFuncionario, onFuncionarioChange }: FuncionarioFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">Funcionário:</span>
      <Select
        value={selectedFuncionario.toString()}
        onValueChange={(value: string) => onFuncionarioChange(Number(value))}
      >
        <SelectTrigger className="w-[200px]">
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