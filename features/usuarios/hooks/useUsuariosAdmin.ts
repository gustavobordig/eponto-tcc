import { useCallback, useEffect, useMemo, useState } from 'react';
import { Cargo, cargoService } from '@/features/cargos/api';
import { JornadaTrabalho, jornadaTrabalhoService } from '@/features/jornadas/api';
import { UserData, userService } from '@/features/usuarios/api';
import { showErrorToast, showSuccessToast } from '@/shared/lib/toast';

export interface UsuarioComDetalhes extends UserData {
  cargo: string;
  jornada: string;
}

/** Usuários com o nome do cargo e da jornada (painel admin). */
export function useUsuariosAdmin() {
  const [usuarios, setUsuarios] = useState<UserData[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [jornadas, setJornadas] = useState<JornadaTrabalho[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsuarios = useCallback(async () => {
    try {
      const response = await userService.getAll();
      setUsuarios(response.usuarios ?? []);
    } catch (error) {
      showErrorToast('Erro ao carregar usuários');
      console.error('Erro ao carregar usuários:', error);
      setUsuarios([]);
    }
  }, []);

  // Antes eram dois efeitos encadeados, e a lista de usuários era buscada duas vezes
  useEffect(() => {
    const carregar = async () => {
      const [respCargos, respJornadas] = await Promise.all([
        cargoService.listar().catch((error) => {
          console.error('Erro ao carregar cargos:', error);
          return null;
        }),
        jornadaTrabalhoService.listar().catch((error) => {
          console.error('Erro ao carregar jornadas:', error);
          return null;
        }),
        fetchUsuarios(),
      ]);
      setCargos(respCargos?.cargos ?? []);
      setJornadas(respJornadas?.jornadas ?? []);
      setLoading(false);
    };
    carregar();
  }, [fetchUsuarios]);

  const usuariosComDetalhes = useMemo<UsuarioComDetalhes[]>(
    () =>
      usuarios.map((user) => ({
        ...user,
        cargo: cargos.find((c) => c.idCargo === user.idCargo)?.nomeCargo || `Cargo ${user.idCargo}`,
        jornada: jornadas.find((j) => j.idJornada === user.idJornada)?.nomeJornada || `Jornada ${user.idJornada}`,
      })),
    [usuarios, cargos, jornadas]
  );

  const atualizar = useCallback(
    async (usuario: UserData) => {
      try {
        await userService.update(usuario);
        showSuccessToast('Usuário atualizado com sucesso!');
        fetchUsuarios();
        return true;
      } catch (error) {
        showErrorToast('Erro ao atualizar usuário. Tente novamente.');
        console.error('Erro ao atualizar usuário:', error);
        return false;
      }
    },
    [fetchUsuarios]
  );

  const excluir = useCallback(
    async (idUsuario: number) => {
      try {
        await userService.delete(idUsuario);
        showSuccessToast('Usuário excluído com sucesso!');
        fetchUsuarios();
      } catch (error) {
        showErrorToast('Erro ao excluir usuário. Tente novamente.');
        console.error('Erro ao excluir usuário:', error);
      }
    },
    [fetchUsuarios]
  );

  return { usuarios: usuariosComDetalhes, cargos, jornadas, loading, atualizar, excluir };
}
