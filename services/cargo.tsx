import api from './api';

interface CargoPayload {
  idCargo: number;
  nomeCargo: string;
  salario: string;
  formacaoMinima: string;
  indAtivo: number;
}

export const insertCargo = async (cargo: CargoPayload) => {
  try {
    const response = await api.post('/api/Cargo/Inserir', cargo);
    return response.data;
  } catch (error) {
    console.error('Erro ao inserir cargo:', error);
    throw error;
  }
};

export const listCargos = async () => {
  try {
    const response = await api.get('/api/Cargo/Listar');
    return response.data;
  } catch (error) {
    console.error('Erro ao listar cargos:', error);
    throw error;
  }
};

export const updateCargo = async (cargo: CargoPayload) => {
  try {
    const response = await api.put(`/api/Cargo/Atualizar/${cargo.idCargo}`, cargo);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar cargo:', error);
    throw error;
  }
};

export const deleteCargo = async (idCargo: number) => {
  try {
    const response = await api.put(`/api/Cargo/Deletar/${idCargo}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao deletar cargo:', error);
    throw error;
  }
};

export const getCargo = async (idCargo: number) => {
  try {
    const response = await api.get(`/api/Cargo/${idCargo}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar cargo:', error);
    throw error;
  }
}; 