// Dados mockados para o dashboard
export interface Funcionario {
  id: number;
  nome: string;
}

export interface DataPoint {
  name: string;
  value: number;
}

export type FuncionarioData = {
  [key: number]: DataPoint[];
};

export const funcionarios: Funcionario[] = [
  { id: 1, nome: "João Silva" },
  { id: 2, nome: "Maria Santos" },
  { id: 3, nome: "Pedro Oliveira" },
  { id: 4, nome: "Ana Costa" },
  { id: 5, nome: "Carlos Souza" },
];

export interface ComposedDataPoint {
  name: string;
  value1: number;
  value2: number;
}

export interface ComposedData {
  [key: number]: ComposedDataPoint[];
}

export interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down';
  icon?: string;
}

export const mockData: {
  horasTrabalhadas: FuncionarioData;
  registrosPorDia: FuncionarioData;
  horasExtras: FuncionarioData;
  atrasos: FuncionarioData;
  registrosPorPeriodo: FuncionarioData;
  saldoHoras: FuncionarioData;
  statusAusencias: FuncionarioData;
  horasVsExtras: ComposedData;
  pontualidade: FuncionarioData;
  metricasGerais: {
    [key: number]: MetricCard[];
  };
} = {
  // Horas trabalhadas por mês por funcionário
  horasTrabalhadas: {
    1: [
      { name: "Jan", value: 168 },
      { name: "Fev", value: 152 },
      { name: "Mar", value: 176 },
      { name: "Abr", value: 160 },
      { name: "Mai", value: 184 },
      { name: "Jun", value: 168 },
    ],
    2: [
      { name: "Jan", value: 176 },
      { name: "Fev", value: 160 },
      { name: "Mar", value: 184 },
      { name: "Abr", value: 168 },
      { name: "Mai", value: 176 },
      { name: "Jun", value: 160 },
    ],
    3: [
      { name: "Jan", value: 160 },
      { name: "Fev", value: 168 },
      { name: "Mar", value: 160 },
      { name: "Abr", value: 176 },
      { name: "Mai", value: 168 },
      { name: "Jun", value: 176 },
    ],
    4: [
      { name: "Jan", value: 184 },
      { name: "Fev", value: 176 },
      { name: "Mar", value: 168 },
      { name: "Abr", value: 184 },
      { name: "Mai", value: 176 },
      { name: "Jun", value: 168 },
    ],
    5: [
      { name: "Jan", value: 168 },
      { name: "Fev", value: 184 },
      { name: "Mar", value: 176 },
      { name: "Abr", value: 168 },
      { name: "Mai", value: 184 },
      { name: "Jun", value: 176 },
    ],
  },

  // Registros por dia da semana por funcionário
  registrosPorDia: {
    1: [
      { name: "Segunda", value: 42 },
      { name: "Terça", value: 45 },
      { name: "Quarta", value: 38 },
      { name: "Quinta", value: 47 },
      { name: "Sexta", value: 40 },
    ],
    2: [
      { name: "Segunda", value: 45 },
      { name: "Terça", value: 40 },
      { name: "Quarta", value: 42 },
      { name: "Quinta", value: 38 },
      { name: "Sexta", value: 45 },
    ],
    3: [
      { name: "Segunda", value: 38 },
      { name: "Terça", value: 42 },
      { name: "Quarta", value: 45 },
      { name: "Quinta", value: 40 },
      { name: "Sexta", value: 42 },
    ],
    4: [
      { name: "Segunda", value: 40 },
      { name: "Terça", value: 38 },
      { name: "Quarta", value: 45 },
      { name: "Quinta", value: 42 },
      { name: "Sexta", value: 38 },
    ],
    5: [
      { name: "Segunda", value: 42 },
      { name: "Terça", value: 45 },
      { name: "Quarta", value: 40 },
      { name: "Quinta", value: 38 },
      { name: "Sexta", value: 45 },
    ],
  },

  // Horas extras por mês por funcionário
  horasExtras: {
    1: [
      { name: "Jan", value: 12 },
      { name: "Fev", value: 8 },
      { name: "Mar", value: 15 },
      { name: "Abr", value: 10 },
      { name: "Mai", value: 18 },
      { name: "Jun", value: 14 },
    ],
    2: [
      { name: "Jan", value: 15 },
      { name: "Fev", value: 12 },
      { name: "Mar", value: 8 },
      { name: "Abr", value: 14 },
      { name: "Mai", value: 10 },
      { name: "Jun", value: 18 },
    ],
    3: [
      { name: "Jan", value: 8 },
      { name: "Fev", value: 15 },
      { name: "Mar", value: 12 },
      { name: "Abr", value: 18 },
      { name: "Mai", value: 14 },
      { name: "Jun", value: 10 },
    ],
    4: [
      { name: "Jan", value: 14 },
      { name: "Fev", value: 10 },
      { name: "Mar", value: 18 },
      { name: "Abr", value: 12 },
      { name: "Mai", value: 15 },
      { name: "Jun", value: 8 },
    ],
    5: [
      { name: "Jan", value: 10 },
      { name: "Fev", value: 14 },
      { name: "Mar", value: 8 },
      { name: "Abr", value: 15 },
      { name: "Mai", value: 12 },
      { name: "Jun", value: 18 },
    ],
  },

  // Atrasos por mês por funcionário
  atrasos: {
    1: [
      { name: "Jan", value: 3 },
      { name: "Fev", value: 2 },
      { name: "Mar", value: 4 },
      { name: "Abr", value: 1 },
      { name: "Mai", value: 2 },
      { name: "Jun", value: 3 },
    ],
    2: [
      { name: "Jan", value: 2 },
      { name: "Fev", value: 3 },
      { name: "Mar", value: 1 },
      { name: "Abr", value: 4 },
      { name: "Mai", value: 2 },
      { name: "Jun", value: 1 },
    ],
    3: [
      { name: "Jan", value: 4 },
      { name: "Fev", value: 1 },
      { name: "Mar", value: 3 },
      { name: "Abr", value: 2 },
      { name: "Mai", value: 1 },
      { name: "Jun", value: 4 },
    ],
    4: [
      { name: "Jan", value: 1 },
      { name: "Fev", value: 4 },
      { name: "Mar", value: 2 },
      { name: "Abr", value: 3 },
      { name: "Mai", value: 4 },
      { name: "Jun", value: 2 },
    ],
    5: [
      { name: "Jan", value: 3 },
      { name: "Fev", value: 2 },
      { name: "Mar", value: 1 },
      { name: "Abr", value: 4 },
      { name: "Mai", value: 3 },
      { name: "Jun", value: 1 },
    ],
  },

  // Registros por período do dia por funcionário
  registrosPorPeriodo: {
    1: [
      { name: "Manhã", value: 35 },
      { name: "Tarde", value: 28 },
      { name: "Noite", value: 15 },
    ],
    2: [
      { name: "Manhã", value: 28 },
      { name: "Tarde", value: 35 },
      { name: "Noite", value: 15 },
    ],
    3: [
      { name: "Manhã", value: 15 },
      { name: "Tarde", value: 35 },
      { name: "Noite", value: 28 },
    ],
    4: [
      { name: "Manhã", value: 35 },
      { name: "Tarde", value: 15 },
      { name: "Noite", value: 28 },
    ],
    5: [
      { name: "Manhã", value: 28 },
      { name: "Tarde", value: 15 },
      { name: "Noite", value: 35 },
    ],
  },

  // Saldo de horas acumulado por mês
  saldoHoras: {
    1: [
      { name: "Jan", value: 8 },
      { name: "Fev", value: 12 },
      { name: "Mar", value: 5 },
      { name: "Abr", value: 15 },
      { name: "Mai", value: 20 },
      { name: "Jun", value: 18 },
    ],
    2: [
      { name: "Jan", value: 12 },
      { name: "Fev", value: 8 },
      { name: "Mar", value: 15 },
      { name: "Abr", value: 10 },
      { name: "Mai", value: 18 },
      { name: "Jun", value: 22 },
    ],
    3: [
      { name: "Jan", value: 5 },
      { name: "Fev", value: 10 },
      { name: "Mar", value: 8 },
      { name: "Abr", value: 12 },
      { name: "Mai", value: 15 },
      { name: "Jun", value: 20 },
    ],
    4: [
      { name: "Jan", value: 15 },
      { name: "Fev", value: 18 },
      { name: "Mar", value: 12 },
      { name: "Abr", value: 20 },
      { name: "Mai", value: 22 },
      { name: "Jun", value: 25 },
    ],
    5: [
      { name: "Jan", value: 10 },
      { name: "Fev", value: 15 },
      { name: "Mar", value: 18 },
      { name: "Abr", value: 12 },
      { name: "Mai", value: 20 },
      { name: "Jun", value: 18 },
    ],
  },

  // Status de solicitações de ausência
  statusAusencias: {
    1: [
      { name: "Pendente", value: 2 },
      { name: "Aprovada", value: 5 },
      { name: "Reprovada", value: 1 },
    ],
    2: [
      { name: "Pendente", value: 1 },
      { name: "Aprovada", value: 6 },
      { name: "Reprovada", value: 0 },
    ],
    3: [
      { name: "Pendente", value: 3 },
      { name: "Aprovada", value: 4 },
      { name: "Reprovada", value: 2 },
    ],
    4: [
      { name: "Pendente", value: 0 },
      { name: "Aprovada", value: 7 },
      { name: "Reprovada", value: 1 },
    ],
    5: [
      { name: "Pendente", value: 2 },
      { name: "Aprovada", value: 5 },
      { name: "Reprovada", value: 1 },
    ],
  },

  // Horas trabalhadas vs Horas extras (combinado)
  horasVsExtras: {
    1: [
      { name: "Jan", value1: 168, value2: 12 },
      { name: "Fev", value1: 152, value2: 8 },
      { name: "Mar", value1: 176, value2: 15 },
      { name: "Abr", value1: 160, value2: 10 },
      { name: "Mai", value1: 184, value2: 18 },
      { name: "Jun", value1: 168, value2: 14 },
    ],
    2: [
      { name: "Jan", value1: 176, value2: 15 },
      { name: "Fev", value1: 160, value2: 12 },
      { name: "Mar", value1: 184, value2: 8 },
      { name: "Abr", value1: 168, value2: 14 },
      { name: "Mai", value1: 176, value2: 10 },
      { name: "Jun", value1: 160, value2: 18 },
    ],
    3: [
      { name: "Jan", value1: 160, value2: 8 },
      { name: "Fev", value1: 168, value2: 15 },
      { name: "Mar", value1: 160, value2: 12 },
      { name: "Abr", value1: 176, value2: 18 },
      { name: "Mai", value1: 168, value2: 14 },
      { name: "Jun", value1: 176, value2: 10 },
    ],
    4: [
      { name: "Jan", value1: 184, value2: 14 },
      { name: "Fev", value1: 176, value2: 10 },
      { name: "Mar", value1: 168, value2: 18 },
      { name: "Abr", value1: 184, value2: 12 },
      { name: "Mai", value1: 176, value2: 15 },
      { name: "Jun", value1: 168, value2: 8 },
    ],
    5: [
      { name: "Jan", value1: 168, value2: 10 },
      { name: "Fev", value1: 184, value2: 14 },
      { name: "Mar", value1: 176, value2: 8 },
      { name: "Abr", value1: 168, value2: 15 },
      { name: "Mai", value1: 184, value2: 12 },
      { name: "Jun", value1: 176, value2: 18 },
    ],
  },

  // Pontualidade (percentual de dias no horário)
  pontualidade: {
    1: [
      { name: "Jan", value: 92 },
      { name: "Fev", value: 95 },
      { name: "Mar", value: 88 },
      { name: "Abr", value: 96 },
      { name: "Mai", value: 94 },
      { name: "Jun", value: 91 },
    ],
    2: [
      { name: "Jan", value: 94 },
      { name: "Fev", value: 91 },
      { name: "Mar", value: 97 },
      { name: "Abr", value: 89 },
      { name: "Mai", value: 95 },
      { name: "Jun", value: 98 },
    ],
    3: [
      { name: "Jan", value: 89 },
      { name: "Fev", value: 97 },
      { name: "Mar", value: 91 },
      { name: "Abr", value: 94 },
      { name: "Mai", value: 97 },
      { name: "Jun", value: 88 },
    ],
    4: [
      { name: "Jan", value: 97 },
      { name: "Fev", value: 89 },
      { name: "Mar", value: 95 },
      { name: "Abr", value: 91 },
      { name: "Mai", value: 88 },
      { name: "Jun", value: 95 },
    ],
    5: [
      { name: "Jan", value: 91 },
      { name: "Fev", value: 94 },
      { name: "Mar", value: 97 },
      { name: "Abr", value: 89 },
      { name: "Mai", value: 95 },
      { name: "Jun", value: 97 },
    ],
  },

  // Métricas gerais (cards de resumo)
  metricasGerais: {
    1: [
      { title: "Total de Horas", value: "1.008h", change: 5.2, trend: "up" },
      { title: "Horas Extras", value: "77h", change: -2.1, trend: "down" },
      { title: "Atrasos", value: "15", change: -10.5, trend: "down" },
      { title: "Pontualidade", value: "93%", change: 2.3, trend: "up" },
      { title: "Ausências", value: "8", change: 0, trend: "up" },
      { title: "Saldo de Horas", value: "+78h", change: 8.7, trend: "up" },
    ],
    2: [
      { title: "Total de Horas", value: "1.024h", change: 3.8, trend: "up" },
      { title: "Horas Extras", value: "77h", change: 5.4, trend: "up" },
      { title: "Atrasos", value: "13", change: -15.2, trend: "down" },
      { title: "Pontualidade", value: "94%", change: 1.8, trend: "up" },
      { title: "Ausências", value: "7", change: -12.5, trend: "down" },
      { title: "Saldo de Horas", value: "+85h", change: 6.2, trend: "up" },
    ],
    3: [
      { title: "Total de Horas", value: "992h", change: -1.2, trend: "down" },
      { title: "Horas Extras", value: "77h", change: 3.1, trend: "up" },
      { title: "Atrasos", value: "15", change: 8.3, trend: "up" },
      { title: "Pontualidade", value: "91%", change: -2.1, trend: "down" },
      { title: "Ausências", value: "9", change: 12.5, trend: "up" },
      { title: "Saldo de Horas", value: "+70h", change: 4.5, trend: "up" },
    ],
    4: [
      { title: "Total de Horas", value: "1.056h", change: 7.5, trend: "up" },
      { title: "Horas Extras", value: "77h", change: -1.8, trend: "down" },
      { title: "Atrasos", value: "14", change: -6.7, trend: "down" },
      { title: "Pontualidade", value: "92%", change: 3.2, trend: "up" },
      { title: "Ausências", value: "8", change: 0, trend: "up" },
      { title: "Saldo de Horas", value: "+112h", change: 10.3, trend: "up" },
    ],
    5: [
      { title: "Total de Horas", value: "1.040h", change: 4.6, trend: "up" },
      { title: "Horas Extras", value: "77h", change: 2.7, trend: "up" },
      { title: "Atrasos", value: "14", change: -7.1, trend: "down" },
      { title: "Pontualidade", value: "94%", change: 1.5, trend: "up" },
      { title: "Ausências", value: "8", change: 0, trend: "up" },
      { title: "Saldo de Horas", value: "+93h", change: 7.8, trend: "up" },
    ],
  },
}; 