"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Assets
import logo from "@/public/images/Logo.png";

// Atoms
import Container from "@/shared/ui/Container";
import Button from "@/shared/ui/Button";
import { Modal } from "@/features/ponto/components/RegistrarPontoModal";
import ConfirmationModal from "@/shared/ui/ConfirmationModal";

// Components
import MobileNav from "@/app/(pages)/(authenticated)/_components/MobileNav";
import { tokenUtils } from "@/shared/lib/token";

interface NavBarProps {
    itens: string[];
    userName?: string;
}

const navItemNames: { [key: string]: string } = {
    "/perfil": "Meu Perfil",
    "/history": "Histórico de Pontos",
    "/calendar": "Calendário",
    "/feedback": "Feedback",
    "/solicitar-ausencia": "Solicitar Ausência",
    "/minhas-solicitacoes": "Minhas Solicitações",
    "/dashboard": "Painel admin"
};

export default function NavBar({
    itens,
    userName = "Usuário"
}: NavBarProps) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [userPhoto, setUserPhoto] = useState<string>("/images/User.png");

    useEffect(() => {
        // Carregar foto do usuário do localStorage
        const savedPhoto = localStorage.getItem('userProfilePhoto');
        if (savedPhoto) {
            setUserPhoto(savedPhoto);
        }
    }, []);

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleConfirmPonto = () => {
        handleCloseModal();
    };

    const handleLogoutClick = () => {
        setIsLogoutModalOpen(true);
    };

    const handleConfirmLogout = () => {
        tokenUtils.logout();
        router.push('/');
    };

    const handleCloseLogoutModal = () => {
        setIsLogoutModalOpen(false);
    };

 
    return (
        <>
            {/* Menu mobile até xl: com 7-8 links a barra completa só cabe a partir de ~1280px */}
            <div className="xl:hidden">
                <MobileNav itens={itens} navItemNames={navItemNames} />
            </div>

            {/* Desktop Nav */}
            <div className="hidden xl:block border-b-2 border-[#002085] fixed top-0 left-0 right-0 z-50 bg-white">
                <Container>
                    <div className="flex justify-between items-center py-4">
                        <div
                            className="cursor-pointer shrink-0 mr-6"
                            onClick={() => router.push('/home')}
                        >
                            <Image src={logo.src} alt="logo" width={100} height={100} />
                        </div>

                        <div className="flex items-center gap-5">
                            <nav className="flex gap-5">
                                {itens.map((item, index) => (
                                    <Link 
                                        key={index} 
                                        href={item}
                                        className="text-sm text-gray-700 hover:text-blue-600 transition-colors whitespace-nowrap"
                                    >
                                        {navItemNames[item]}
                                    </Link>
                                ))}
                            </nav>
                            <div 
                                className="w-[40px] h-[40px] rounded-full bg-cover bg-center border-2 border-[#002085]"
                                style={{
                                    backgroundImage: `url(${userPhoto})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }}
                            />
                            <Button 
                                text="Sair" 
                                backgroundColor="bg-white"
                                textColor="text-[#002085]"
                                fullWidth={false}
                                style={{
                                    borderRadius: '30px',
                                    borderColor: '#002085',
                                    borderWidth: '1px',
                                    padding: '0.5rem 1.5rem'
                                 }}
                                className="px-6 font-medium whitespace-nowrap"
                                onClick={handleLogoutClick}
                            />
                            <Button 
                                text="Bater Ponto" 
                                backgroundColor="bg-[#002085]"
                                textColor="text-white"
                                fullWidth={false}
                                style={{
                                   borderRadius: '30px',
                                   padding: '0.5rem 1.5rem'
                                }}
                                hoverSwapColors={false}
                                className="whitespace-nowrap"
                                onClick={handleOpenModal}
                            />
                        </div>
                    </div>
                </Container>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onConfirm={handleConfirmPonto}
                userName={userName}
            />

            <ConfirmationModal
                isOpen={isLogoutModalOpen}
                onCancel={handleCloseLogoutModal}
                onConfirm={handleConfirmLogout}
                title="Confirmar Logout"
                message="Tem certeza que deseja sair do sistema?"
                confirmText="Sair"
                cancelText="Cancelar"
            />
        </>
    )
}
