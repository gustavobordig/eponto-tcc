import Image from 'next/image';
import logo from '@/public/images/logo-mk.png';
import logoBranco from '@/public/images/logo-mk-branco.png';

/** Logotipo MK Ponto: marinho sobre fundo claro, branco sobre o marinho. */
export default function Logo({ branco = false, altura = 24, className = '' }: { branco?: boolean; altura?: number; className?: string }) {
  const img = branco ? logoBranco : logo;
  return (
    <Image
      src={img}
      alt="MK Ponto"
      height={altura}
      width={Math.round((img.width / img.height) * altura)}
      className={className}
      priority
    />
  );
}
