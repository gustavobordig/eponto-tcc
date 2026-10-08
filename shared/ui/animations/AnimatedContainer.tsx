"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedContainerProps {
    children: ReactNode;
    className?: string;
    delay?: number;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.5,
            delay: 0
        }
    }
};

export function AnimatedContainer({ children, className = "", delay = 0 }: AnimatedContainerProps) {
    return (
        <motion.div 
            className={className}
            initial="hidden"
            animate="visible"
            variants={{
                ...containerVariants,
                visible: {
                    opacity: 1,
                    transition: {
                        duration: 0.5,
                        delay
                    }
                }
            }}
        >
            {children}
        </motion.div>
    );
} 