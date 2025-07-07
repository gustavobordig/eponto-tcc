"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import logo from "@/public/images/Logo.png";
import Button from "../../atoms/Button";
import { Modal } from "@/app/components/molecules/Modal";
import ConfirmationModal from "../../atoms/ConfirmationModal";
import { tokenUtils } from "@/utils/token";
import { LogIn, LogOut, User, Calendar, Clock, Home, ChevronLeft, ChevronRight, Moon } from "lucide-react";
import { usePathname } from "next/navigation";

const navItemNames: { [key: string]: string } = {
    "/home": "Início",
    "/history": "Histórico de Pontos",
    "/calendar": "Calendário",
};

const navItemIcons: { [key: string]: React.ReactNode } = {
    "/home": <Home size={22} />, 
    "/history": <Clock size={22} />, 
    "/calendar": <Calendar size={22} />,
};

interface SidebarProps {
    itens: string[];
    userName?: string;
    isOpen?: boolean;
    setIsOpen?: (open: boolean) => void;
}

export default function Sidebar({ itens, userName = "Usuário", isOpen: isOpenProp, setIsOpen }: SidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [internalOpen, setInternalOpen] = useState(true);
    const isOpen = typeof isOpenProp === 'boolean' ? isOpenProp : internalOpen;
    const handleSetOpen = setIsOpen || setInternalOpen;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [userPhoto, setUserPhoto] = useState<string>("/images/User.png");
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const savedPhoto = localStorage.getItem('userProfilePhoto');
        if (savedPhoto) {
            setUserPhoto(savedPhoto);
        }
    }, []);

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);
    const handleConfirmPonto = () => handleCloseModal();
    const handleLogoutClick = () => setIsLogoutModalOpen(true);
    const handleConfirmLogout = () => {
        tokenUtils.logout();
        router.push('/');
    };
    const handleCloseLogoutModal = () => setIsLogoutModalOpen(false);
    const toggleSidebar = () => {
        if (setIsOpen) {
            setIsOpen(!isOpen);
        } else {
            setInternalOpen((prev) => !prev);
        }
    };

    return (
        <>
            <div
                className={`fixed top-0 left-0 h-screen z-50 bg-[#002085] border-none shadow-xl rounded-r-3xl transition-all duration-300 flex flex-col justify-between ${isOpen ? 'w-64' : 'w-20'}`}
            >
                <div>
                    {/* Logo e nome */}
                    <div className="flex items-center justify-between px-4 py-6">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/home')}>
                            <Image src={logo.src} alt="logo" width={isOpen ? 40 : 32} height={isOpen ? 40 : 32} />
                            {isOpen && <span className="font-black text-xl text-white tracking-wider">E-PONTO</span>}
                        </div>
                        <button onClick={toggleSidebar} className="text-[#8F92A1] focus:outline-none">
                            {isOpen ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
                        </button>
                    </div>
                    {/* Usuário */}
                    <div className="flex items-center gap-3 px-4 pb-4">
                        <div
                            className="rounded-full border-2 border-[#6C63FF] bg-cover bg-center"
                            style={{
                                backgroundImage: `url(${userPhoto})`,
                                width: isOpen ? 56 : 40,
                                height: isOpen ? 56 : 40,
                                transition: 'width 0.3s, height 0.3s',
                            }}
                        />
                        {isOpen && (
                            <div className="flex flex-col">
                                <span className="font-semibold text-white leading-tight">{userName}</span>
                                <Link href="/perfil" className="text-xs text-[#B3C6FF] hover:underline">minha conta</Link>
                            </div>
                        )}
                    </div>
                    {/* Navegação */}
                    <nav className="flex flex-col gap-1 mt-2">
                        {itens.map((item, index) => {
                            const active = pathname === item;
                            return (
                                <Link
                                    key={index}
                                    href={item}
                                    className={`relative flex items-center gap-4 px-4 py-3 my-1 rounded-lg transition-colors group
                                        ${active ? 'bg-[#001A5C] text-white' : 'text-[#B3C6FF] hover:bg-[#001A5C] hover:text-white'}
                                        ${isOpen ? 'justify-start' : 'justify-center'}
                                    `}
                                >
                                    {active && (
                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded bg-[#6C63FF]" />
                                    )}
                                    <span>{navItemIcons[item]}</span>
                                    {isOpen && <span className="whitespace-nowrap text-base">{navItemNames[item]}</span>}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                {/* Rodapé */}
                <div className="flex flex-col items-center gap-3 mb-6 px-2">
                    {/* Dark mode switch visual */}
                    <div className={`flex items-center w-full ${isOpen ? 'justify-between' : 'justify-center'} px-2 py-2 rounded-lg hover:bg-[#001A5C] transition-colors`}> 
                        <span className="flex items-center gap-2">
                            <Moon size={20} className="text-[#B3C6FF]" />
                            {isOpen && <span className="text-[#B3C6FF] text-base">Dark Mode</span>}
                        </span>
                        {isOpen && (
                            <button
                                className={`w-10 h-5 flex items-center bg-[#001A5C] rounded-full p-1 duration-300 focus:outline-none ${darkMode ? 'justify-end' : 'justify-start'}`}
                                onClick={() => setDarkMode((d) => !d)}
                            >
                                <span className={`w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${darkMode ? 'bg-[#6C63FF]' : ''}`}></span>
                            </button>
                        )}
                    </div>
                    {/* Botão de logout */}
                    <button
                        onClick={handleLogoutClick}
                        className={`flex items-center gap-2 w-full px-2 py-2 rounded-lg hover:bg-[#001A5C] transition-colors text-[#B3C6FF] ${isOpen ? 'justify-start' : 'justify-center'}`}
                    >
                        <LogOut size={20} />
                        {isOpen && <span className="text-base">Sair</span>}
                    </button>
                    {/* Botão de bater ponto */}
                    <Button
                        text={isOpen ? "Bater Ponto" : ""}
                        backgroundColor="bg-[#6C63FF]"
                        textColor="text-white"
                        fullWidth={true}
                        style={{ borderRadius: '30px', padding: isOpen ? '0.5rem 1.5rem' : '0.5rem', minWidth: isOpen ? 120 : 40 }}
                        hoverSwapColors={false}
                        onClick={handleOpenModal}
                        className="w-full mt-2"
                        icon={!isOpen ? <LogIn size={20} /> : undefined}
                    />
                </div>
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
    );
} 