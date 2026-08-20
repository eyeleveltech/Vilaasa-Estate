import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DeskOption {
  id: string;
  label: string;
  description: string;
  icon: string;
  whatsappNumber: string;
  message: string;
}

const desks: DeskOption[] = [
  {
    id: "india",
    label: "India Investment Desk",
    description: "Domestic real estate & land opportunities",
    icon: "location_on",
    whatsappNumber: "917550001123",
    message: "Hello, I'm interested in learning more about investment opportunities in India.",
  },
  {
    id: "dubai",
    label: "Dubai Investment Desk",
    description: "International properties & global assets",
    icon: "public",
    whatsappNumber: "917550001123", // Placeholder - replace with actual Dubai number
    message: "Hello, I'm interested in learning more about Dubai investment opportunities.",
  },
  {
    id: "franchise",
    label: "Franchise Support",
    description: "Premium brand franchise investments",
    icon: "storefront",
    whatsappNumber: "917550001123", // Placeholder - replace with actual Franchise number
    message: "Hello, I'm interested in learning more about franchise investment opportunities.",
  },
];

export const LiveConcierge = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDeskClick = (desk: DeskOption) => {
    const encodedMessage = encodeURIComponent(desk.message);
    window.open(`https://wa.me/${desk.whatsappNumber}?text=${encodedMessage}`, "_blank");
    setIsOpen(false);
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[998]"
          />
        )}
      </AnimatePresence>

      {/* Options Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-28 right-6 z-[999] w-[320px] bg-card rounded-xl shadow-2xl border border-border overflow-hidden"
          >
            <div className="p-4 bg-[#0c1a14] border-b border-border">
              <h3 className="text-white font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-gold">support_agent</span>
                Which desk do you wish to speak to?
              </h3>
              <p className="text-white/60 text-xs mt-1">Connect directly with our specialists</p>
            </div>

            <div className="p-2">
              {desks.map((desk, index) => (
                <motion.button
                  key={desk.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleDeskClick(desk)}
                  className="w-full p-4 rounded-lg hover:bg-muted transition-colors text-left group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-gold">{desk.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground group-hover:text-gold transition-colors">
                        {desk.label}
                      </p>
                      <p className="text-muted-foreground text-xs mt-0.5">{desk.description}</p>
                    </div>
                    <span className="material-symbols-outlined text-muted-foreground group-hover:text-gold transition-colors">
                      arrow_forward
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-[999] w-16 h-16 rounded-full bg-gradient-to-br from-gold to-[#B8860B] shadow-xl flex items-center justify-center group"
        aria-label="Live Concierge"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              className="material-symbols-outlined text-[#0c1a14] text-2xl"
            >
              close
            </motion.span>
          ) : (
            <motion.span
              key="concierge"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              className="material-symbols-outlined text-[#0c1a14] text-2xl"
            >
              support_agent
            </motion.span>
          )}
        </AnimatePresence>

        {/* Pulse ring */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-gold animate-ping opacity-30" />
        )}
      </motion.button>

      {/* Label tooltip */}
      {!isOpen && (
        <div className="fixed bottom-[88px] right-6 z-[999] pointer-events-none">
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 2 }}
            className="bg-[#0c1a14] text-white text-xs px-3 py-2 rounded-lg shadow-lg"
          >
            <span className="text-gold font-medium">Concierge</span> • Instant Connect
          </motion.div>
        </div>
      )}
    </>
  );
};
