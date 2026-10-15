"use client";

import { useAreaFuncionario } from "@/app/(pages)/(authenticated)/_components/AreaFuncionario";
import CardBancoHoras from "@/features/bancoHoras/components/CardBancoHoras";
import CardProximos from "@/features/calendario/components/CardProximos";
import { useEventosCalendario } from "@/features/calendario/hooks/useEventosCalendario";
import CardPontualidade from "@/features/ponto/components/CardPontualidade";
import HeroDoDia from "@/features/ponto/components/HeroDoDia";

export default function Home() {
  const { usuario, ponto, abrirRegistro } = useAreaFuncionario();
  const { eventos } = useEventosCalendario({ incluirMinhasFerias: true });

  return (
    <div className="flex flex-col gap-5">
      <HeroDoDia
        primeiroNome={usuario?.nome.split(" ")[0] ?? ""}
        horasDiarias={usuario?.horasDiarias ?? null}
        ponto={ponto}
        onRegistrar={abrirRegistro}
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,1fr)]">
        <CardBancoHoras />
        <CardPontualidade registros={ponto.todos} eventos={eventos} />
        <CardProximos eventos={eventos} />
      </div>
    </div>
  );
}
