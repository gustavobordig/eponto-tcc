/**
 * Contas de teste do deploy público (as mesmas do db/seed.sql da API). Só
 * aparecem com NEXT_PUBLIC_DEMO=true; a API protege essas contas e limita as
 * gravações no modo demonstração.
 */
export const DEMO_ATIVA = process.env.NEXT_PUBLIC_DEMO === 'true';

export const CONTAS_DEMO = [
  { rotulo: 'RH (admin)', descricao: 'Cadastros e aprovações', email: 'rh.teste@eponto.local', senha: 'Teste-b56bdd' },
  { rotulo: 'Funcionária', descricao: 'Bater ponto e pedidos', email: 'ana.teste@eponto.local', senha: 'Teste-308484' },
] as const;
