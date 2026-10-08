import Container from "@/shared/ui/Container";
import HistoricoContainer from "@/features/ponto/components/HistoricoPontos";

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Container>
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold text-gray-800 w-full text-start my-8">
          Histórico de pontos
          </h1>
        </div>

        <HistoricoContainer />
      </Container>
    </div>
  );
} 