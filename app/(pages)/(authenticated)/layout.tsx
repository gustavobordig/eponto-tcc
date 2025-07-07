"use client";

import Sidebar from "@/app/components/molecules/Sidebar";
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
        "/history",
        "/calendar"
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
                        dataNascimento: response.usuario.dataNascimento,
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
            <Sidebar itens={navItems} userName={JSON.parse(localStorage.getItem('user') || '{}').nome} />
            <main className="ml-20 md:ml-64 px-4 py-8">
                {children}
            </main>
        </div>
    );
}
