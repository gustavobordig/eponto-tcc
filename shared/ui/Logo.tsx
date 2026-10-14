import Image from 'next/image';
import logo from '@/public/images/logo-mk.png';
import logoBranco from '@/public/images/logo-mk-branco.png';

/**
 * Logotipo MK Ponto: marinho sobre fundo claro, branco sobre o marinho.
 * No modo escuro, o marinho vira o branco.
 */
export default function Logo({ branco = false, altura = 24, className = '' }: { branco?: boolean; altura?: number; className?: string }) {
  const imagem = (img: typeof logo, extra: string) => (
    <Image
      src={img}
      alt="MK Ponto"
      height={altura}
      width={Math.round((img.width / img.height) * altura)}
      className={extra}
      priority
    />
  );
  if (branco) return imagem(logoBranco, className);
  // A classe fica no invólucro para não brigar com o dark:hidden das imagens
  return (
    <span className={`inline-flex ${className}`}>
      {imagem(logo, 'dark:hidden')}
      {imagem(logoBranco, 'hidden dark:block')}
    </span>
  );
}
