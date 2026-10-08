import { useEffect, useState } from 'react';

/** Endereço aproximado da posição atual (OpenStreetMap). Só consulta quando `ativo`. */
export function useLocalizacao(ativo = true) {
  const [endereco, setEndereco] = useState<string | null>(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    if (!ativo || !navigator.geolocation) return;
    let cancelado = false;

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const resposta = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&zoom=18&addressdetails=1&accept-language=pt-BR`
          );
          const dados = await resposta.json();
          if (!cancelado) setEndereco(dados.display_name ?? null);
        } catch {
          if (!cancelado) setErro(true);
        }
      },
      () => !cancelado && setErro(true),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
    );

    return () => {
      cancelado = true;
    };
  }, [ativo]);

  const texto = endereco ?? (erro ? 'Localização indisponível' : 'Obtendo localização…');
  return { endereco, texto };
}
