import { motion } from "framer-motion";
import { useCurrency } from "@/contexts/CurrencyContext";

interface TenancyAsset {
  id: string;
  name: string;
  location: string;
  image: string;
  status: "occupied" | "vacant";
  tenant?: {
    name: string;
    leaseStart: string;
    leaseExpiry: string;
    monthlyRent: number;
    rentStatus: "paid" | "overdue" | "pending";
    lastPayment?: string;
  };
}

const mockTenancyAssets: TenancyAsset[] = [
  {
    id: "1",
    name: "Colton Beach Resort",
    location: "Goa, India",
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80",
    status: "occupied",
    tenant: {
      name: "Paradise Hospitality Pvt Ltd",
      leaseStart: "2024-04-01",
      leaseExpiry: "2027-03-31",
      monthlyRent: 250000,
      rentStatus: "paid",
      lastPayment: "2025-01-01",
    },
  },
  {
    id: "4",
    name: "Lakeside Villa",
    location: "Kerala, India",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80",
    status: "occupied",
    tenant: {
      name: "Mr. Arun Sharma",
      leaseStart: "2024-01-15",
      leaseExpiry: "2025-01-14",
      monthlyRent: 85000,
      rentStatus: "overdue",
      lastPayment: "2024-11-15",
    },
  },
  {
    id: "5",
    name: "Business Park Office",
    location: "Bangalore, India",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80",
    status: "vacant",
  },
];

export function VaultTenancy() {
  const { formatAmount } = useCurrency();

  const getDaysToExpiry = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getRentStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-primary text-primary-foreground";
      case "overdue": return "bg-destructive text-destructive-foreground";
      case "pending": return "bg-gold text-gold-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const occupiedCount = mockTenancyAssets.filter(a => a.status === "occupied").length;
  const totalMonthlyRent = mockTenancyAssets.reduce((sum, a) => sum + (a.tenant?.monthlyRent || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-light text-foreground font-serif">Tenancy Manager</h2>
          <p className="text-muted-foreground text-sm">Monitor your rental properties and lease status</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card p-4 rounded-xl border border-border"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">apartment</span>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Occupied</p>
              <p className="text-xl font-bold text-foreground">{occupiedCount} / {mockTenancyAssets.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card p-4 rounded-xl border border-border"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-gold">payments</span>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Monthly Rent Income</p>
              <p className="text-xl font-bold text-foreground font-mono">{formatAmount(totalMonthlyRent)}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card p-4 rounded-xl border border-border"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-destructive">warning</span>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Overdue Rents</p>
              <p className="text-xl font-bold text-destructive">
                {mockTenancyAssets.filter(a => a.tenant?.rentStatus === "overdue").length}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Property Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockTenancyAssets.map((asset, index) => (
          <motion.div
            key={asset.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="bg-card rounded-xl border border-border overflow-hidden"
          >
            <div className="flex">
              {/* Image */}
              <div className="w-32 h-full flex-shrink-0">
                <img src={asset.image} alt={asset.name} className="w-full h-full object-cover" />
              </div>

              {/* Content */}
              <div className="flex-1 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-foreground">{asset.name}</h3>
                    <p className="text-muted-foreground text-sm">{asset.location}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    asset.status === "occupied" 
                      ? "bg-primary/20 text-primary" 
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {asset.status === "occupied" ? "Occupied" : "Vacant"}
                  </span>
                </div>

                {asset.tenant ? (
                  <div className="space-y-3">
                    {/* Tenant Info */}
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-muted-foreground text-sm">person</span>
                      <span className="text-sm text-foreground">{asset.tenant.name}</span>
                    </div>

                    {/* Lease Expiry */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-muted-foreground text-sm">event</span>
                        <span className="text-sm text-muted-foreground">Lease Expiry</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          {new Date(asset.tenant.leaseExpiry).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                        {getDaysToExpiry(asset.tenant.leaseExpiry) <= 60 && (
                          <span className="text-xs text-gold">
                            {getDaysToExpiry(asset.tenant.leaseExpiry)} days to renewal
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Rent Status */}
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div>
                        <p className="text-xs text-muted-foreground">Monthly Rent</p>
                        <p className="font-bold text-foreground font-mono">{formatAmount(asset.tenant.monthlyRent)}</p>
                      </div>
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${getRentStatusColor(asset.tenant.rentStatus)}`}>
                        <span className="material-symbols-outlined text-sm">
                          {asset.tenant.rentStatus === "paid" ? "check_circle" : asset.tenant.rentStatus === "overdue" ? "error" : "schedule"}
                        </span>
                        <span className="text-xs font-semibold capitalize">{asset.tenant.rentStatus}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center">
                    <p className="text-muted-foreground text-sm mb-3">This property is currently vacant</p>
                    <button className="text-primary text-sm font-medium hover:underline">
                      Request Tenant Sourcing →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
