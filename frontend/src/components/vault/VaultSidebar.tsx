import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import vilaasaLogo from "@/assets/vilaasa-logo.png";
import { cn } from "@/lib/utils";

interface VaultSidebarProps {
  onNavigate: (section: string) => void;
  activeSection: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const menuItems = [
  { id: "overview", label: "Overview", icon: "dashboard" },
  { id: "assets", label: "My Assets", icon: "home_work", submenu: [
    { id: "real-estate", label: "Real Estate" },
    { id: "franchise", label: "Franchise" },
  ]},
  { id: "construction", label: "Construction Feed", icon: "construction" },
  { id: "tenancy", label: "Tenancy Manager", icon: "key" },
  { id: "documents", label: "Documents", icon: "folder_open" },
  { id: "payments", label: "Payments & Milestones", icon: "calendar_month" },
  { id: "concierge", label: "Concierge Desk", icon: "support_agent" },
  { id: "nominee", label: "Nominee & Legacy", icon: "family_restroom" },
];

export function VaultSidebar({ onNavigate, activeSection, collapsed, onToggleCollapse }: VaultSidebarProps) {
  const [expandedMenu, setExpandedMenu] = useState<string | null>("assets");

  const handleMenuClick = (item: typeof menuItems[0]) => {
    if (item.submenu) {
      setExpandedMenu(expandedMenu === item.id ? null : item.id);
    } else {
      onNavigate(item.id);
    }
  };

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-full bg-[#0c1a14] border-r border-border z-40 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo Section */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <Link to="/" className={cn("transition-opacity", collapsed && "opacity-0 pointer-events-none")}>
          <img src={vilaasaLogo} alt="Vilaasa Estate" className="h-7" />
        </Link>
        <button 
          onClick={onToggleCollapse}
          className="w-8 h-8 rounded-lg bg-muted/10 flex items-center justify-center text-muted-foreground hover:text-white hover:bg-muted/20 transition-colors"
        >
          <span className="material-symbols-outlined text-lg">
            {collapsed ? "chevron_right" : "chevron_left"}
          </span>
        </button>
      </div>

      {/* Vault Badge */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2 px-3 py-2 bg-gold/10 rounded-lg border border-gold/20">
            <span className="material-symbols-outlined text-gold text-sm">lock</span>
            <span className="text-gold text-xs font-semibold tracking-wide">THE VAULT</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="p-2 space-y-1 overflow-y-auto h-[calc(100%-140px)]">
        {menuItems.map((item) => (
          <div key={item.id}>
            <button
              onClick={() => handleMenuClick(item)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                "hover:bg-white/5",
                (activeSection === item.id || item.submenu?.some(s => activeSection === s.id))
                  ? "bg-primary/10 text-primary" 
                  : "text-white/70"
              )}
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              {!collapsed && (
                <>
                  <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                  {item.submenu && (
                    <span className={cn(
                      "material-symbols-outlined text-lg transition-transform",
                      expandedMenu === item.id && "rotate-180"
                    )}>
                      expand_more
                    </span>
                  )}
                </>
              )}
            </button>

            {/* Submenu */}
            <AnimatePresence>
              {item.submenu && expandedMenu === item.id && !collapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="ml-8 mt-1 space-y-1">
                    {item.submenu.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => onNavigate(sub.id)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                          activeSection === sub.id
                            ? "text-gold bg-gold/10"
                            : "text-white/50 hover:text-white/80 hover:bg-white/5"
                        )}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>

      {/* User Section */}
      {!collapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-[#0a1510]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
              <span className="text-gold font-bold text-sm">RK</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">Rajesh Kumar</p>
              <p className="text-white/40 text-xs">Premium Client</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
