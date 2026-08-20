import { motion } from "framer-motion";
import { useCurrency } from "@/contexts/CurrencyContext";

interface Asset {
  id: string;
  name: string;
  type: string;
  category: "real-estate" | "franchise";
  location: string;
  value: number;
  status: string;
  roi: number;
  image: string;
}

interface VaultAssetsProps {
  assets: Asset[];
  filter: "all" | "real-estate" | "franchise";
}

export function VaultAssets({ assets, filter }: VaultAssetsProps) {
  const { formatAmount } = useCurrency();

  const filteredAssets = filter === "all" 
    ? assets 
    : assets.filter(a => a.category === filter);

  const totalValue = filteredAssets.reduce((sum, a) => sum + a.value, 0);
  const avgROI = filteredAssets.reduce((sum, a) => sum + a.roi, 0) / filteredAssets.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-light text-foreground font-serif">
            {filter === "all" ? "All Assets" : filter === "real-estate" ? "Real Estate" : "Franchise"}
          </h2>
          <p className="text-muted-foreground text-sm">
            {filteredAssets.length} assets • Total Value: {formatAmount(totalValue)}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gold/10 rounded-lg border border-gold/20">
          <span className="text-gold text-sm">Avg. ROI</span>
          <span className="text-gold font-bold font-mono">{avgROI.toFixed(1)}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAssets.map((asset, index) => (
          <motion.div
            key={asset.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card rounded-xl border border-border overflow-hidden group hover:border-gold/50 transition-colors"
          >
            <div className="relative h-40 overflow-hidden">
              <img
                src={asset.image}
                alt={asset.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className={`absolute top-3 right-3 px-2 py-1 rounded text-xs font-medium ${
                asset.status === "Active" 
                  ? "bg-primary/90 text-primary-foreground" 
                  : "bg-gold/90 text-gold-foreground"
              }`}>
                {asset.status}
              </span>
              <span className="absolute top-3 left-3 px-2 py-1 rounded text-xs font-medium bg-black/50 text-white">
                {asset.category === "real-estate" ? "Real Estate" : "Franchise"}
              </span>
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-foreground">{asset.name}</h3>
                  <p className="text-muted-foreground text-sm">{asset.location}</p>
                </div>
                <span className="text-xs px-2 py-1 bg-muted rounded text-muted-foreground">
                  {asset.type}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Value</p>
                  <p className="font-bold text-foreground font-mono">{formatAmount(asset.value)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">ROI</p>
                  <p className="font-bold text-gold font-mono">{asset.roi}%</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
