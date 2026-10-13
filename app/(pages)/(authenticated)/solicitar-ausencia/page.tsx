import { redirect } from "next/navigation";

// O pedido de ausência agora fica ao lado da lista, em Solicitações
export default function SolicitarAusenciaPage() {
  redirect("/minhas-solicitacoes");
}
