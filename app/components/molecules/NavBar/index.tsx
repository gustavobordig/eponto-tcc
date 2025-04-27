"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Assets
import logo from "@/public/images/Logo.png";
import user from "@/public/images/User.png";

// Atoms
import Container from "../../atoms/container";
import Button from "../../atoms/Button";
import { Modal } from "@/app/components/molecules/Modal";
import ConfirmationModal from "../../atoms/ConfirmationModal";

// Components
import MobileNav from "./MobileNav";
import { tokenUtils } from "@/utils/token";

interface NavBarProps {
    itens: string[];
    userName?: string;
}

const navItemNames: { [key: string]: string } = {
    "/perfil": "Meu Perfil",
    "/history": "Histórico de Pontos"
};

export default function NavBar({
    itens,
    userName = "Usuário"
}: NavBarProps) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

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
            {/* Mobile Nav */}
            <div className="md:hidden">
                <MobileNav itens={itens} navItemNames={navItemNames} />
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:block border-b-2 border-[#002085] fixed top-0 left-0 right-0 z-50 bg-white">
                <Container>
                    <div className="flex justify-between items-center py-4">
                        <div
                            className="cursor-pointer"
                            onClick={() => router.push('/home')}
                        >
                            <Image src={logo.src} alt="logo" width={100} height={100} />
                        </div>

                        <div className="flex items-center gap-8">
                            <nav className="flex gap-6">
                                {itens.map((item, index) => (
                                    <Link 
                                        key={index} 
                                        href={item}
                                        className="text-gray-700 hover:text-blue-600 transition-colors whitespace-nowrap"
                                    >
                                        {navItemNames[item]}
                                    </Link>
                                ))}
                            </nav>
                            <div 
                                className="w-[40px] h-[40px] rounded-full bg-cover bg-center"
                                style={{
                                    backgroundImage: `url(${user.src})`
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
                                className="px-6 font-medium"
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
                onClose={handleCloseLogoutModal}
                onConfirm={handleConfirmLogout}
                title="Confirmar Logout"
                message="Tem certeza que deseja sair do sistema?"
                confirmText="Sair"
                cancelText="Cancelar"
            />
        </>
    )
}
