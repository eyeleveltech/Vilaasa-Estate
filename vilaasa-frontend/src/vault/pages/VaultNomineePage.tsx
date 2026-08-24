import React from "react";
import { motion } from "framer-motion";
import { VaultNominee } from "@/components/vault/VaultNominee";

export const VaultNomineePage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <VaultNominee />
    </motion.div>
  );
};

export default VaultNomineePage;
