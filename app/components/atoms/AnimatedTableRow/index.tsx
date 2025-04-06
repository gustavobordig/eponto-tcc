"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedTableRowProps {
  children: ReactNode;
  className?: string;
}

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3
    }
  }
};

export function AnimatedTableRow({ children, className = "" }: AnimatedTableRowProps) {
  return (
    <motion.tr 
      className={className}
      variants={rowVariants}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.tr>
  );
} 