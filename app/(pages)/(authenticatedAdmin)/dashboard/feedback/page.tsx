'use client';

import { useState } from 'react';
import { SolicitacaoData } from '@/features/feedback/api';
import { useFeedbackAdmin } from '@/features/feedback/hooks/useFeedbackAdmin';
import SolicitacoesFeedbackCard from '@/features/feedback/components/admin/SolicitacoesFeedbackCard';
import FeedbacksEnviadosCard from '@/features/feedback/components/admin/FeedbacksEnviadosCard';
import DetalhesSolicitacaoModal from '@/features/feedback/components/admin/DetalhesSolicitacaoModal';
import ResponderFeedbackModal from '@/features/feedback/components/admin/ResponderFeedbackModal';
import Container from '@/shared/ui/Container';
import LoadingText from '@/shared/ui/LoadingText';

export default function FeedbackPage() {
  const { solicitacoes, feedbacks, loading, feedbacksLoading, responder } = useFeedbackAdmin();
  const [detalhes, setDetalhes] = useState<SolicitacaoData | null>(null);
  const [respondendo, setRespondendo] = useState<SolicitacaoData | null>(null);

  if (loading) {
    return (
      <Container>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingText title="solicitações de feedback" />
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <SolicitacoesFeedbackCard solicitacoes={solicitacoes} onView={setDetalhes} onResponder={setRespondendo} />
      <FeedbacksEnviadosCard feedbacks={feedbacks} loading={feedbacksLoading} />

      {detalhes && (
        <DetalhesSolicitacaoModal
          solicitacao={detalhes}
          onClose={() => setDetalhes(null)}
          onResponder={setRespondendo}
        />
      )}

      {respondendo && (
        <ResponderFeedbackModal
          solicitacao={respondendo}
          onClose={() => setRespondendo(null)}
          onSubmit={(resposta) => responder(respondendo, resposta)}
        />
      )}
    </Container>
  );
}
