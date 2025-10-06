import api  from './api';

export interface UsuarioHierarquia {
  idUsuario: number;
  nome: string;
  dataNascimento: string;
  senha: string;
  email: string;
  telefone: number;
  idCargo: number;
  idJornada: number;
  indAtivo: number;
  fotoPerfil: string;
  idChefe: number;
  chefe: string;
  subordinados: string[];
  nivel: number;
}

export const hierarquiaService = {
  async getHierarquia(): Promise<UsuarioHierarquia[]> {
    try {
      const response = await api.get('api/Usuario/Hierarquia');
      // A API retorna { sucesso, mensagem, usuario, usuarios }
      // Precisamos extrair o array 'usuarios' da resposta
      return response.data.usuarios || [];
    } catch (error) {
      console.error('Erro ao buscar hierarquia:', error);
      throw error;
    }
  }
};
