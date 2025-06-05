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

export const mockData: {
  horasTrabalhadas: FuncionarioData;
  registrosPorDia: FuncionarioData;
  horasExtras: FuncionarioData;
  atrasos: FuncionarioData;
  registrosPorPeriodo: FuncionarioData;
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
}; 