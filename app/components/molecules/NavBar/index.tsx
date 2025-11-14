"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Assets
import logo from "@/public/images/Logo.png";

// Atoms
import Container from "../../atoms/container";
import Button from "../../atoms/Button";
import { Modal } from "@/app/components/molecules/Modal";
import ConfirmationModal from "../../atoms/ConfirmationModal";
import SimpleLanguageSelector from "../../atoms/SimpleLanguageSelector";

// Components
import MobileNav from "./MobileNav";
import { tokenUtils } from "@/utils/token";
import { useLanguage } from "@/app/contexts/LanguageContext";

interface NavBarProps {
    itens: string[];
    userName?: string;
}

const getNavItemNames = (t: (key: string) => string) => ({
    "/perfil": t('nav.profile'),
    "/history": t('nav.history'),
    "/calendar": t('nav.calendar'),
    "/feedback": t('nav.feedback'),
    "/solicitar-ausencia": t('nav.request-absence'),
    "/minhas-solicitacoes": t('nav.my-requests')
});

export default function NavBar({
    itens,
    userName = "Usuário"
}: NavBarProps) {
    const { t } = useLanguage();
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [userPhoto, setUserPhoto] = useState<string>("/images/User.png");
    
    const navItemNames = getNavItemNames(t);

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
            {/* Mobile Nav */}
            <div className="lg:hidden">
                <MobileNav itens={itens} navItemNames={navItemNames} />
            </div>

            {/* Desktop Nav */}
            <div className="hidden lg:block border-b-2 border-[#002085] fixed top-0 left-0 right-0 z-50 bg-white">
                <Container>
                    {/* Primeira linha - Logo e Navegação */}
                    <div className="flex items-center justify-between py-2">
                        {/* Logo */}
                        <div
                            className="cursor-pointer flex-shrink-0"
                            onClick={() => router.push('/home')}
                        >
                            <Image 
                                src={logo.src} 
                                alt="logo" 
                                width={60} 
                                height={60} 
                                className="xl:w-[80px] xl:h-[80px]"
                            />
                        </div>

                        {/* Navegação Central */}
                        <nav className="flex items-center justify-center flex-1 max-w-4xl">
                            <div className="flex items-center gap-3 xl:gap-6">
                                {itens.map((item, index) => (
                                    <Link 
                                        key={index} 
                                        href={item}
                                        className="text-gray-700 hover:text-blue-600 transition-colors whitespace-nowrap text-sm xl:text-base font-medium px-2 py-1 rounded-md hover:bg-blue-50"
                                    >
                                        {navItemNames[item as keyof typeof navItemNames]}
                                    </Link>
                                ))}
                            </div>
                        </nav>

                        {/* Espaçador para manter logo e navegação alinhados */}
                        <div className="w-[60px] xl:w-[80px]"></div>
                    </div>

                    {/* Segunda linha - Elementos de ação */}
                    <div className="flex items-center justify-between py-2 border-t border-gray-100">
                        {/* Lado esquerdo - Seletor de idioma */}
                        <div className="flex items-center">
                            <SimpleLanguageSelector />
                        </div>

                        {/* Lado direito - Perfil, Logout e Bater Ponto */}
                        <div className="flex items-center gap-3 xl:gap-4">
                            <div 
                                className="w-[35px] h-[35px] xl:w-[40px] xl:h-[40px] rounded-full bg-cover bg-center border-2 border-[#002085] cursor-pointer hover:border-blue-400 transition-colors"
                                style={{
                                    backgroundImage: `url(${userPhoto})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }}
                            />
                            
                            <Button 
                                text={t('nav.logout')} 
                                backgroundColor="bg-white"
                                textColor="text-[#002085]"
                                fullWidth={false}
                                style={{
                                    borderRadius: '30px',
                                    borderColor: '#002085',
                                    borderWidth: '1px',
                                    padding: '0.4rem 0.8rem'
                                 }}
                                className="font-medium text-xs xl:text-sm hover:bg-gray-50 transition-colors"
                                onClick={handleLogoutClick}
                            />
                            
                            <Button 
                                text={t('home.punch-in')} 
                                backgroundColor="bg-[#002085]"
                                textColor="text-white"
                                fullWidth={false}
                                style={{
                                   borderRadius: '30px',
                                   padding: '0.4rem 0.8rem'
                                }}
                                className="text-xs xl:text-sm hover:bg-blue-700 transition-colors"
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
                title={t('nav.logout')}
                message={t('common.logout-confirmation')}
                confirmText={t('nav.logout')}
                cancelText={t('common.cancel')}
            />
        </>
    )
}
