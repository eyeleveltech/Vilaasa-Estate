import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { VaultSidebar } from "@/components/vault/VaultSidebar";
import { VaultOverview } from "@/components/vault/VaultOverview";
import { VaultAssets } from "@/components/vault/VaultAssets";
import { VaultConstruction } from "@/components/vault/VaultConstruction";
import { VaultTenancy } from "@/components/vault/VaultTenancy";
import { VaultDocuments } from "@/components/vault/VaultDocuments";
import { VaultPayments } from "@/components/vault/VaultPayments";
import { VaultConcierge } from "@/components/vault/VaultConcierge";
import { VaultNominee } from "@/components/vault/VaultNominee";

import vilaasaLogo from "@/assets/vilaasa-logo.png";

// Mock data
const portfolioData = {
  totalValue: 45000000,
  totalROI: 18.5,
  monthlyIncome: 375000,
  assets: [
    {
      id: "1",
      name: "Colton Beach Resort",
      type: "Resort",
      category: "real-estate" as const,
      location: "Goa, India",
      value: 15000000,
      purchasePrice: 12500000,
      currentEstimate: 15000000,
      status: "Active",
      roi: 21,
      image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80",
    },
    {
      id: "2",
      name: "Zen Wellness Spa",
      type: "Franchise",
      category: "franchise" as const,
      location: "Goa, India",
      value: 8000000,
      purchasePrice: 6500000,
      currentEstimate: 8000000,
      status: "Active",
      roi: 24,
      image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&q=80",
    },
    {
      id: "3",
      name: "Palm Royale Villa",
      type: "Villa",
      category: "real-estate" as const,
      location: "Dubai, UAE",
      value: 22000000,
      purchasePrice: 20000000,
      currentEstimate: 22000000,
      status: "Under Construction",
      roi: 8,
      image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80",
    },
  ],
};

const documentsData = [
  { id: "1", name: "Sale Deed - Colton Beach Resort", type: "Legal", date: "2024-03-15", size: "2.4 MB", icon: "description", property: "Colton Beach Resort" },
  { id: "2", name: "Franchise Agreement - Zen Wellness", type: "Agreement", date: "2024-02-28", size: "1.8 MB", icon: "handshake", property: "Zen Wellness Spa" },
  { id: "3", name: "Payment Receipt - Q4 2024", type: "Receipt", date: "2024-12-01", size: "456 KB", icon: "receipt_long" },
  { id: "4", name: "Tax Certificate - FY 2024", type: "Tax", date: "2024-07-15", size: "890 KB", icon: "receipt" },
  { id: "5", name: "Property Insurance - Dubai Villa", type: "Insurance", date: "2024-01-10", size: "1.2 MB", icon: "verified_user", property: "Palm Royale Villa" },
  { id: "6", name: "Construction Agreement - Palm Royale", type: "Agreement", date: "2024-06-20", size: "3.1 MB", icon: "gavel", property: "Palm Royale Villa" },
];

const paymentsData = [
  { id: "1", property: "Palm Royale Villa", milestone: "2nd Tranche - Structure Complete", amount: 5500000, dueDate: "2025-02-15", status: "upcoming" as const },
  { id: "2", property: "Palm Royale Villa", milestone: "3rd Tranche - Interior Works", amount: 5500000, dueDate: "2025-06-30", status: "pending" as const },
  { id: "3", property: "Colton Beach Resort", milestone: "Annual Maintenance Fee", amount: 150000, dueDate: "2025-04-01", status: "pending" as const },
];

const actionItems = [
  { id: "1", type: "lease" as const, message: "Lakeside Villa lease expires in 8 days — renewal required", urgency: "high" as const },
  { id: "2", type: "construction" as const, message: "Palm Royale Villa reached Structure Level 18", urgency: "low" as const },
  { id: "3", type: "payment" as const, message: "2nd Tranche payment due in 40 days", urgency: "medium" as const },
];

const nextPayment = {
  amount: 5500000,
  dueDate: "2025-02-15",
  property: "Palm Royale Villa",
};

const VaultDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    navigate("/vault");
  };

  const handleNavigate = (section: string) => {
    setActiveSection(section);
  };

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <VaultOverview 
            portfolioData={portfolioData}
            nextPayment={nextPayment}
            actionItems={actionItems}
            onNavigate={handleNavigate}
          />
        );
      case "real-estate":
        return <VaultAssets assets={portfolioData.assets} filter="real-estate" />;
      case "franchise":
        return <VaultAssets assets={portfolioData.assets} filter="franchise" />;
      case "construction":
        return <VaultConstruction />;
      case "tenancy":
        return <VaultTenancy />;
      case "documents":
        return <VaultDocuments documents={documentsData} />;
      case "payments":
        return <VaultPayments payments={paymentsData} />;
      case "concierge":
        return <VaultConcierge />;
      case "nominee":
        return <VaultNominee />;
      default:
        return (
          <VaultOverview 
            portfolioData={portfolioData}
            nextPayment={nextPayment}
            actionItems={actionItems}
            onNavigate={handleNavigate}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <VaultSidebar 
        onNavigate={handleNavigate}
        activeSection={activeSection}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div className={cn(
        "transition-all duration-300",
        sidebarCollapsed ? "ml-16" : "ml-64"
      )}>
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
          <div className="px-6 py-4 flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-xl font-light text-foreground font-serif">
                Good afternoon, <span className="text-gold">Rajesh</span>
              </h1>
              <p className="text-muted-foreground text-sm">Welcome to your private vault</p>
            </motion.div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <span className="material-symbols-outlined text-xl">notifications</span>
                <span className="absolute top-1 right-1 w-2 h-2 bg-gold rounded-full"></span>
              </button>

              {/* User Menu */}
              <div className="hidden sm:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">Rajesh Kumar</p>
                  <p className="text-xs text-muted-foreground">Premium Client</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                  <span className="text-gold font-bold">RK</span>
                </div>
              </div>

              {/* Logout */}
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
                <span className="material-symbols-outlined text-lg">logout</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default VaultDashboard;
