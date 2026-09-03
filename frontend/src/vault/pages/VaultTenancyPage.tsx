import React from "react";
import { motion } from "framer-motion";
import { VaultTenancy } from "@/components/vault/VaultTenancy";

export const VaultTenancyPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <VaultTenancy />
    </motion.div>
  );
};

export default VaultTenancyPage;
