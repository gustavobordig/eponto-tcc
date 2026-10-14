/** Iniciais do nome, no lugar da foto genérica que aparecia para todo mundo. */
export default function Avatar({
  nome,
  foto,
  tamanho = 'md',
  className = '',
}: {
  nome: string;
  foto?: string | null;
  tamanho?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const classes = {
    sm: 'h-[34px] w-[34px] text-xs',
    md: 'h-10 w-10 text-[13px]',
    lg: 'h-16 w-16 text-xl',
    xl: 'h-24 w-24 text-3xl',
  }[tamanho];
  const iniciais =
    nome
      .split(' ')
      .filter(Boolean)
      .filter((_, i, partes) => i === 0 || i === partes.length - 1)
      .map((p) => p[0]?.toUpperCase())
      .join('') || '?';

  // A API guarda o base64 puro; o app às vezes já manda com o prefixo data:
  const src = foto && !/^(data:|https?:|blob:)/.test(foto) ? `data:image/jpeg;base64,${foto}` : foto;

  if (src) {
    // eslint-disable-next-line @next/next/no-img-element -- foto em base64 vinda da API
    return <img src={src} alt={nome} className={`${classes} shrink-0 rounded-full object-cover ${className}`} />;
  }
  return (
    <span
      className={`${classes} inline-flex shrink-0 items-center justify-center rounded-full bg-primary-soft font-extrabold text-primary ${className}`}
      aria-hidden
    >
      {iniciais}
    </span>
  );
}
