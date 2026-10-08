/** Iniciais do nome, no lugar da foto genérica que aparecia para todo mundo. */
export default function Avatar({ nome, foto, tamanho = 'md' }: { nome: string; foto?: string | null; tamanho?: 'md' | 'lg' }) {
  const classes = tamanho === 'lg' ? 'h-16 w-16 text-xl' : 'h-10 w-10 text-sm';
  const iniciais =
    nome
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || '?';

  if (foto) {
    // eslint-disable-next-line @next/next/no-img-element -- foto em base64 vinda da API
    return <img src={foto} alt={nome} className={`${classes} rounded-full object-cover`} />;
  }
  return (
    <span className={`${classes} inline-flex shrink-0 items-center justify-center rounded-full bg-primary-soft font-semibold text-primary`} aria-hidden>
      {iniciais}
    </span>
  );
}
