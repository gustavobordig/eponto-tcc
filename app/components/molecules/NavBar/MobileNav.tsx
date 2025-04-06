import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Assets
import logo from "@/public/images/Logo.png";
import user from "@/public/images/User.png";

// Atoms
import Container from "../../atoms/container";
import Button from "../../atoms/Button";

interface MobileNavProps {
    itens: string[];
    navItemNames: { [key: string]: string };
}

export default function MobileNav({ itens, navItemNames }: MobileNavProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b-2 border-[#002085] fixed top-0 left-0 right-0 z-50 bg-white">
            <Container>
                <div className="flex justify-between items-center py-4">
                    <div>
                        <Image src={logo.src} alt="logo" width={100} height={100} />
                    </div>

                    {/* Botão do Menu */}
                    <motion.button 
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-2 rounded-md hover:bg-gray-100 focus:outline-none"
                        whileTap={{ scale: 0.95 }}
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
                            <motion.div 
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="fixed inset-0 top-[72px] bg-white z-40"
                            >
                                <Container>
                                    <motion.div 
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="flex flex-col gap-4 items-start pt-4"
                                    >
                                        <Image 
                                            src={user.src} 
                                            alt="user" 
                                            width={40} 
                                            height={40} 
                                            className="rounded-full"
                                        />
                                    </motion.div>
                                    <nav className="flex flex-col gap-4 py-4">
                                        {itens.map((item, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.1 + index * 0.1 }}
                                            >
                                                <Link 
                                                    href={item}
                                                    className="text-gray-700 hover:text-blue-600 transition-colors text-lg"
                                                    onClick={() => setIsOpen(false)}
                                                >
                                                    {navItemNames[item]}
                                                </Link>
                                            </motion.div>
                                        ))}
                                    </nav>
                                    <motion.div 
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="flex flex-col gap-4 items-start py-4"
                                    >
                                        <Button 
                                            text="Bater Ponto" 
                                            backgroundColor="bg-transparent"
                                            textColor="text-[#002085]"
                                            fullWidth={true}
                                            style={{
                                                borderRadius: '30px',
                                                borderColor: '#002085',
                                                borderWidth: '1px',
                                            }}
                                        />
                                    </motion.div>
                                </Container>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </Container>
        </div>
    );
} 