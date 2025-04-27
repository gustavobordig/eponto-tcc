"use client";

import NavBar from "@/app/components/molecules/NavBar";
import { useEffect } from "react";
import { tokenUtils } from "@/utils/token";
import { userService } from "@/services/user";
import { useRouter } from "next/navigation";
import { showErrorToast } from "@/utils/toast";

export default function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const navItems = [
        "/home",
        "/meu-perfil",
        "/history"
    ];

    useEffect(() => {
        const checkUser = async () => {
            
            const userId = tokenUtils.getId();
            
            console.log("userId: ", userId);
            
            if (!userId) {
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
                        data_Nascimento: response.usuario.data_Nascimento,
                        telefone: response.usuario.telefone
                    };
                    
                    localStorage.setItem('user', JSON.stringify(userData));
                }
            } catch (error) {
                console.error('Erro ao buscar dados do usuário:', error);
                router.push('/');
            }
        };

        checkUser();
    }, [router]);

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="fixed top-0 left-0 right-0 z-50">
                <NavBar itens={navItems} userName={JSON.parse(localStorage.getItem('user') || '{}').nome} />
            </div>
            <main className="container mx-auto px-4 py-8 pt-24">
                {children}
            </main>
        </div>
    );
}
