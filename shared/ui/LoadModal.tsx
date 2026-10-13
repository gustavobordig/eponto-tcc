import LoadingText from "@/shared/ui/LoadingText";

interface LoadModalProps {
  title: string;
}

/** Carregamento de página inteira (antes cobria a tela com um fundo preto) */
export default function LoadModal({ title }: LoadModalProps) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <LoadingText title={title} />
    </div>
  );
}
