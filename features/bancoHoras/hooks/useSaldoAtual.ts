import { useEffect, useState } from 'react';
import { bancoHorasService, BancoHoras } from '@/features/bancoHoras/api';
import { tokenUtils } from '@/shared/lib/token';

/** Saldo atual do banco de horas do usuário logado (null se não houver). */
export function useSaldoAtual() {
  const [saldo, setSaldo] = useState<BancoHoras | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const idUsuario = tokenUtils.getId();
    if (!idUsuario) {
      setCarregando(false);
      return;
    }
    bancoHorasService
      .obterSaldoAtual(Number(idUsuario))
      .then((response) => setSaldo(response.sucesso ? response.bancoHoras?.[0] ?? null : null))
      .finally(() => setCarregando(false));
  }, []);

  return { saldo, carregando };
}
