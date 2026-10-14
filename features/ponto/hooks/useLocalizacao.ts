import { useCallback, useEffect, useState } from 'react';

type Estado = 'buscando' | 'ok' | 'erro' | 'negada';

/**
 * Endereço aproximado da posição atual (OpenStreetMap). Só consulta quando
 * `ativo`. `tentarDeNovo` pede a posição outra vez; se a permissão foi negada,
 * o navegador não pergunta de novo e é preciso liberar nas configurações dele.
 */
export function useLocalizacao(ativo = true) {
  const [endereco, setEndereco] = useState<string | null>(null);
  const [estado, setEstado] = useState<Estado>('buscando');
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    if (!ativo) return;
    if (!navigator.geolocation) {
      setEstado('erro');
      return;
    }
    let cancelado = false;
    setEstado('buscando');

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const resposta = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&zoom=18&addressdetails=1&accept-language=pt-BR`
          );
          const dados = await resposta.json();
          if (cancelado) return;
          setEndereco(dados.display_name ?? null);
          setEstado(dados.display_name ? 'ok' : 'erro');
        } catch {
          if (!cancelado) setEstado('erro');
        }
      },
      (erro) => !cancelado && setEstado(erro.code === erro.PERMISSION_DENIED ? 'negada' : 'erro'),
      // Na nova tentativa não reaproveita uma posição antiga
      { enableHighAccuracy: true, timeout: 10000, maximumAge: tentativa > 0 ? 0 : 60000 }
    );

    return () => {
      cancelado = true;
    };
  }, [ativo, tentativa]);

  const tentarDeNovo = useCallback(() => setTentativa((t) => t + 1), []);

  const texto =
    estado === 'ok' && endereco
      ? endereco
      : estado === 'buscando'
        ? 'Obtendo localização…'
        : estado === 'negada'
          ? 'Localização bloqueada no navegador'
          : 'Localização indisponível';

  return { endereco, texto, falhou: estado === 'erro' || estado === 'negada', negada: estado === 'negada', buscando: estado === 'buscando', tentarDeNovo };
}
