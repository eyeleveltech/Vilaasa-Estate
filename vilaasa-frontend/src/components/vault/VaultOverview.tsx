import { motion } from "framer-motion";
import { useCurrency } from "@/contexts/CurrencyContext";
import { VaultWealthProjector } from "./VaultWealthProjector";

interface Asset {
  id: string;
  name: string;
  type: string;
  location: string;
  value: number;
  status: string;
  roi: number;
  image: string;
  purchasePrice?: number;
  currentEstimate?: number;
  tenancy?: {
    status: "occupied" | "vacant";
    tenant?: string;
    leaseExpiry?: string;
    rentStatus?: "paid" | "overdue" | "pending";
  };
  construction?: {
    structureProgress: number;
    interiorProgress: number;
  };
}

interface VaultOverviewProps {
  portfolioData: {
    totalValue: number;
    totalROI: number;
    monthlyIncome: number;
    assets: Asset[];
  };
  nextPayment: {
    amount: number;
    dueDate: string;
    property: string;
  };
  actionItems: Array<{
    id: string;
    type: "lease" | "construction" | "payment" | "document";
    message: string;
    urgency: "high" | "medium" | "low";
  }>;
  onNavigate: (section: string) => void;
}

export function VaultOverview({ portfolioData, nextPayment, actionItems, onNavigate }: VaultOverviewProps) {
  const { formatAmount } = useCurrency();

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high": return "text-destructive bg-destructive/10 border-destructive/20";
      case "medium": return "text-gold bg-gold/10 border-gold/20";
      default: return "text-primary bg-primary/10 border-primary/20";
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case "lease": return "key";
      case "construction": return "construction";
      case "payment": return "payments";
      case "document": return "description";
      default: return "info";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Row: Key Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card p-6 rounded-xl border border-border"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-2xl">account_balance</span>
            </div>
            <div>
              <span className="text-muted-foreground text-sm">Total Asset Value</span>
              <p className="text-2xl font-bold text-foreground font-mono">
                {formatAmount(portfolioData.totalValue)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-primary text-sm">
            <span className="material-symbols-outlined text-lg">trending_up</span>
            <span>+12.4% from last quarter</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card p-6 rounded-xl border border-border"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-gold text-2xl">trending_up</span>
            </div>
            <div>
              <span className="text-muted-foreground text-sm">Total ROI</span>
              <p className="text-2xl font-bold text-gold font-mono">{portfolioData.totalROI}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <span className="material-symbols-outlined text-lg">info</span>
            <span>Annualized average across assets</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card p-6 rounded-xl border border-border"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-destructive text-2xl">event</span>
            </div>
            <div>
              <span className="text-muted-foreground text-sm">Next Payment Due</span>
              <p className="text-2xl font-bold text-foreground font-mono">
                {formatAmount(nextPayment.amount)}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm truncate">{nextPayment.property}</span>
            <span className="text-destructive text-sm font-medium">
              {new Date(nextPayment.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Middle Row: Wealth Projector Graph */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <VaultWealthProjector assets={portfolioData.assets} />
      </motion.div>

      {/* Bottom Row: Action Items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card rounded-xl border border-border overflow-hidden"
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-gold">notifications_active</span>
            <h3 className="font-semibold text-foreground">Action Items</h3>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-gold/20 text-gold font-medium">
            {actionItems.length} pending
          </span>
        </div>

        <div className="divide-y divide-border">
          {actionItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.05 }}
              className="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors cursor-pointer group"
              onClick={() => onNavigate(item.type === "lease" ? "tenancy" : item.type === "construction" ? "construction" : "payments")}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getUrgencyColor(item.urgency)}`}>
                <span className="material-symbols-outlined">{getActionIcon(item.type)}</span>
              </div>
              <p className="flex-1 text-foreground text-sm">{item.message}</p>
              <span className="material-symbols-outlined text-muted-foreground group-hover:text-foreground transition-colors">
                chevron_right
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
