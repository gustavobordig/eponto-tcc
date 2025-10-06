"use client";

import NavBar from "@/app/components/molecules/NavBar";
import { useEffect, useState } from "react";
import { tokenUtils } from "@/utils/token";
import { userService } from "@/services/user";
import { useRouter } from "next/navigation";
import { showErrorToast } from "@/utils/toast";
import FeedbackModal from "@/app/components/molecules/FeedbackModal";
import { FeedbackProvider, useFeedback } from "@/app/contexts/FeedbackContext";
    
function AuthenticatedLayoutContent({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { isFeedbackModalOpen, closeFeedbackModal } = useFeedback();
    const [refreshCallback, setRefreshCallback] = useState<(() => void) | null>(null);
    const [userName, setUserName] = useState<string>('');
    
    const navItems = [
        "/home",
        "/perfil",
        "/history",
        "/calendar",
        "/hierarquia",
        "/feedback",
        "/solicitar-ausencia",
        "/solicitar-ferias",
        "/minhas-solicitacoes",
        "/minhas-ferias"
    ];

    useEffect(() => {
        const checkUser = async () => {
            const token = tokenUtils.getToken();
            const tipoAcesso = tokenUtils.getTipoAcesso();
            const isAdmin = tokenUtils.isAdmin();
            
            // Verificar se tem token
            if (!token) {
                router.push('/');
                return;
            }
            
            // Se é admin e escolheu acesso como admin, redirecionar para dashboard
            if (isAdmin && tipoAcesso === 'admin') {
                router.push('/dashboard');
                return;
            }
            
            // Se é admin mas não tem tipo de acesso definido, redirecionar para seleção
            if (isAdmin && !tipoAcesso) {
                router.push('/selecionar-perfil');
                return;
            }
            
            const userId = tokenUtils.getId();
            
            console.log("userId: ", userId);
            
            if (false) {
                showErrorToast("Usuário não encontrado");
                router.push('/');
                return;
            }

            try {
                const response = await userService.getById(Number(userId));
                
                if (response.sucesso && response.usuario) {
                    const userData = {
                        nome: response.usuario.nome,
                        email: response.usuario.email,
                        dataNascimento: response.usuario.dataNascimento,
                        telefone: response.usuario.telefone
                    };
                    
                    setUserName(response.usuario.nome);
                    localStorage.setItem('user', JSON.stringify(userData));
                }
            } catch (error) {
                console.error('Erro ao buscar dados do usuário:', error);
                router.push('/');
            }
        };

        checkUser();
    }, [router]);

    // Função para registrar o callback de refresh da página atual
    const registerRefreshCallback = (callback: () => void) => {
        setRefreshCallback(() => callback);
    };

    // Expor a função para as páginas filhas
    useEffect(() => {
        (window as any).registerFeedbackRefresh = registerRefreshCallback;
        return () => {
            delete (window as any).registerFeedbackRefresh;
        };
    }, []);

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="fixed top-0 left-0 right-0 z-50">
                <NavBar itens={navItems} userName={userName} />
            </div>
            <main className="container mx-auto px-4 py-8 pt-24">
                {children}
            </main>

            <FeedbackModal 
                isOpen={isFeedbackModalOpen}
                onClose={closeFeedbackModal}
                onSolicitacaoCreated={refreshCallback || undefined}
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
            <AuthenticatedLayoutContent>
                {children}
            </AuthenticatedLayoutContent>
        </FeedbackProvider>
    );
}
