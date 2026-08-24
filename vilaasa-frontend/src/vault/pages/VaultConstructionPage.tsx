import React from "react";
import { motion } from "framer-motion";
import { VaultConstruction } from "@/components/vault/VaultConstruction";

export const VaultConstructionPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <VaultConstruction />
    </motion.div>
  );
};

export default VaultConstructionPage;
