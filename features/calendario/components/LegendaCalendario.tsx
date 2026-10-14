// Mesmas cores de app/styles/calendar.scss
const ITENS = [
  { cor: '#e53e3e', label: 'Feriado' },
  { cor: '#38a169', label: 'Férias da empresa' },
  { cor: '#805ad5', label: 'Minhas férias' },
];

export default function LegendaCalendario({ semMinhasFerias = false }: { semMinhasFerias?: boolean }) {
  return (
    <ul className="flex flex-wrap items-center gap-4 text-sm text-muted" aria-label="Legenda">
      {ITENS.filter((i) => !(semMinhasFerias && i.label === 'Minhas férias')).map(({ cor, label }) => (
        <li key={label} className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: cor }} aria-hidden />
          {label}
        </li>
      ))}
    </ul>
  );
}
