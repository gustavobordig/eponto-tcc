"use client";

import { useAreaFuncionario } from "@/app/(pages)/(authenticated)/_components/AreaFuncionario";
import HistoricoContainer from "@/features/ponto/components/HistoricoPontos";

export default function HistoricoPage() {
  const { pedidos } = useAreaFuncionario();
  // Um ajuste novo entra em Solicitações (e no contador da aba)
  return <HistoricoContainer onAjusteEnviado={pedidos.recarregar} />;
}
