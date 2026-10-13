import { useEffect, useState } from 'react';
import { bancoHorasService, SaldoDiario } from '@/features/bancoHoras/api';
import { tokenUtils } from '@/shared/lib/token';

/** Saldos diários do banco de horas do usuário logado, do mais antigo ao mais recente. */
export function useSaldosDiarios() {
  const [saldos, setSaldos] = useState<SaldoDiario[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const idUsuario = tokenUtils.getId();
    if (!idUsuario) {
      setCarregando(false);
      return;
    }
    bancoHorasService
      .obterSaldosDiarios(Number(idUsuario))
      .then((r) =>
        setSaldos([...(r.saldosDiarios ?? [])].sort((a, b) => a.dataReferencia.localeCompare(b.dataReferencia)))
      )
      .catch((error) => console.error('Erro ao buscar saldos diários:', error))
      .finally(() => setCarregando(false));
  }, []);

  return { saldos, carregando };
}
