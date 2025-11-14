import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/contexts/LanguageContext";

// Assets
import logo from "@/public/images/Logo.png";
import user from "@/public/images/User.png";

// Atoms
import Container from "../../atoms/container";
import Button from "../../atoms/Button";
import SimpleLanguageSelector from "../../atoms/SimpleLanguageSelector";
import ConfirmationModal from "../../atoms/ConfirmationModal";
import { tokenUtils } from "@/utils/token";

interface MobileNavProps {
    itens: string[];
    navItemNames: { [key: string]: string };
}

export default function MobileNav({ itens, navItemNames }: MobileNavProps) {
    const { t } = useLanguage();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [userPhoto, setUserPhoto] = useState<string>("/images/User.png");

    useEffect(() => {
        // Carregar foto do usuário do localStorage
        const savedPhoto = localStorage.getItem('userProfilePhoto');
        if (savedPhoto) {
            setUserPhoto(savedPhoto);
        }
    }, []);

    useEffect(() => {
        // Bloquear scroll quando menu está aberto
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        // Cleanup
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

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
        <div className="border-b-2 border-[#002085] fixed top-0 left-0 right-0 z-50 bg-white">
            <Container>
                <div className="flex justify-between items-center py-3 md:py-4">
                    {/* Logo centralizado */}
                    <div className="flex-1 flex justify-center md:justify-start">
                        <Image 
                            src={logo.src} 
                            alt="logo" 
                            width={70} 
                            height={70} 
                            className="md:w-[90px] md:h-[90px]"
                        />
                    </div>

                    {/* Botão do Menu */}
                    <motion.button 
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#002085] focus:ring-opacity-50"
                        whileTap={{ scale: 0.95 }}
                        aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
                        aria-expanded={isOpen}
                        aria-controls="mobile-menu"
                    >
                        <div className="relative w-6 h-6">
                            <motion.svg 
                                className="w-6 h-6 text-[#002085] absolute"
                                initial={{ opacity: 1 }}
                                animate={{ opacity: isOpen ? 0 : 1 }}
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M4 6h16M4 12h16M4 18h16" 
                                />
                            </motion.svg>
                            <motion.svg 
                                className="w-6 h-6 text-[#002085] absolute"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: isOpen ? 1 : 0 }}
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M6 18L18 6M6 6l12 12" 
                                />
                            </motion.svg>
                        </div>
                    </motion.button>

                    {/* Menu Mobile */}
                    <AnimatePresence>
                        {isOpen && (
                            <>
                                {/* Overlay */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="fixed inset-0 bg-black bg-opacity-25 z-30"
                                    onClick={() => setIsOpen(false)}
                                />
                                
                                <motion.div 
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="fixed inset-0 top-[72px] bg-white z-40"
                                    id="mobile-menu"
                                    role="navigation"
                                    aria-label="Menu principal"
                                >
                                <Container>
                                    {/* Header do menu mobile */}
                                    <motion.div 
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="flex flex-col items-center pt-6 pb-4"
                                    >
                                        <div 
                                            className="w-[60px] h-[60px] rounded-full bg-cover bg-center border-2 border-[#002085] mb-3"
                                            style={{
                                                backgroundImage: `url(${userPhoto})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center'
                                            }}
                                        />
                                        <h3 className="text-lg font-semibold text-gray-800">Menu</h3>
                                    </motion.div>
                                    
                                    {/* Navegação centralizada */}
                                    <nav className="flex flex-col gap-3 py-4">
                                        {itens.map((item, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.1 + index * 0.1 }}
                                                className="w-full"
                                            >
                                                <Link 
                                                    href={item}
                                                    className="block w-full text-center py-3 px-4 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors text-lg font-medium rounded-lg"
                                                    onClick={() => setIsOpen(false)}
                                                >
                                                    {navItemNames[item]}
                                                </Link>
                                            </motion.div>
                                        ))}
                                    </nav>
                                    
                                    {/* Seletor de idioma centralizado */}
                                    <motion.div 
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="flex justify-center py-4"
                                    >
                                        <div className="w-full max-w-xs">
                                            <SimpleLanguageSelector />
                                        </div>
                                    </motion.div>
                                    
                                    {/* Botões de ação centralizados */}
                                    <motion.div 
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="flex flex-col gap-3 py-4 px-4"
                                    >
                                        <Button 
                                            text={t('home.punch-in')} 
                                            backgroundColor="bg-[#002085]"
                                            textColor="text-white"
                                            fullWidth={true}
                                            style={{
                                                borderRadius: '30px',
                                                padding: '0.75rem 1.5rem'
                                            }}
                                            className="text-base font-medium"
                                        />
                                        <Button 
                                            text={t('nav.logout')} 
                                            backgroundColor="bg-transparent"
                                            textColor="text-[#002085]"
                                            fullWidth={true}
                                            style={{
                                                borderRadius: '30px',
                                                borderColor: '#002085',
                                                borderWidth: '1px',
                                                padding: '0.75rem 1.5rem'
                                            }}
                                            className="text-base font-medium"
                                            onClick={handleLogoutClick}
                                        />
                                    </motion.div>
                                </Container>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </Container>
            
            <ConfirmationModal
                isOpen={isLogoutModalOpen}
                onClose={handleCloseLogoutModal}
                onConfirm={handleConfirmLogout}
                title={t('nav.logout')}
                message={t('common.logout-confirmation')}
                confirmText={t('nav.logout')}
                cancelText={t('common.cancel')}
            />
        </div>
    );
} 