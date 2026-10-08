"use client";

import BarraFuncionario from "@/app/(pages)/(authenticated)/_components/BarraFuncionario";
import { AreaFuncionarioProvider } from "@/app/(pages)/(authenticated)/_components/AreaFuncionario";
import FeedbackModal from "@/features/feedback/components/FeedbackModal";
import { FeedbackProvider, useFeedback } from "@/features/feedback/FeedbackContext";

function AuthenticatedLayoutContent({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isFeedbackModalOpen, closeFeedbackModal, refreshSolicitacoes } = useFeedback();
    return (
        <div className="min-h-screen bg-background">
            <BarraFuncionario />
            <main className="mx-auto max-w-7xl px-4 pb-10 pt-24">
                {children}
            </main>

            <FeedbackModal 
                isOpen={isFeedbackModalOpen}
                onClose={closeFeedbackModal}
                onSolicitacaoCreated={refreshSolicitacoes}
            />
        </div>
    );
}

export default function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <FeedbackProvider>
            <AreaFuncionarioProvider>
                <AuthenticatedLayoutContent>
                    {children}
                </AuthenticatedLayoutContent>
            </AreaFuncionarioProvider>
        </FeedbackProvider>
    );
}
