import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageEntranceProps {
  children: ReactNode;
}

export const PageEntrance = ({ children }: PageEntranceProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
}; 