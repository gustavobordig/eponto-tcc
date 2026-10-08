/** Marca na tela os gráficos que ainda usam dados de exemplo, e não os da API. */
export default function DemoBadge({ label = 'Dados de exemplo' }: { label?: string }) {
  return (
    <span
      title="Este gráfico ainda não está ligado à API"
      className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800"
    >
      {label}
    </span>
  );
}
