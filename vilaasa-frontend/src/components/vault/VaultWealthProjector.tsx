import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, ComposedChart } from "recharts";
import { useCurrency } from "@/contexts/CurrencyContext";

interface Asset {
  id: string;
  name: string;
  value: number;
  purchasePrice?: number;
  currentEstimate?: number;
}

interface VaultWealthProjectorProps {
  assets: Asset[];
}

export function VaultWealthProjector({ assets }: VaultWealthProjectorProps) {
  const { formatAmount, symbol } = useCurrency();

  // Generate mock historical and projected data
  const chartData = useMemo(() => {
    const totalPurchase = assets.reduce((sum, a) => sum + (a.purchasePrice || a.value * 0.85), 0);
    const totalCurrent = assets.reduce((sum, a) => sum + (a.currentEstimate || a.value), 0);
    
    const months = [
      { month: "Jan '24", purchase: totalPurchase, market: totalPurchase * 0.98 },
      { month: "Mar '24", purchase: totalPurchase, market: totalPurchase * 1.02 },
      { month: "Jun '24", purchase: totalPurchase, market: totalPurchase * 1.06 },
      { month: "Sep '24", purchase: totalPurchase, market: totalPurchase * 1.09 },
      { month: "Dec '24", purchase: totalPurchase, market: totalPurchase * 1.12 },
      { month: "Now", purchase: totalPurchase, market: totalCurrent },
      { month: "Jun '25", purchase: totalPurchase, market: totalCurrent * 1.04, projected: true },
      { month: "Dec '25", purchase: totalPurchase, market: totalCurrent * 1.08, projected: true },
    ];
    
    return months;
  }, [assets]);

  const totalPurchasePrice = assets.reduce((sum, a) => sum + (a.purchasePrice || a.value * 0.85), 0);
  const totalCurrentValue = assets.reduce((sum, a) => sum + (a.currentEstimate || a.value), 0);
  const unrealizedGain = totalCurrentValue - totalPurchasePrice;
  const gainPercentage = ((unrealizedGain / totalPurchasePrice) * 100).toFixed(1);

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">show_chart</span>
          <div>
            <h3 className="font-semibold text-foreground">Wealth Projector</h3>
            <p className="text-muted-foreground text-xs">Portfolio value over time</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-lg font-bold font-mono ${unrealizedGain >= 0 ? "text-primary" : "text-destructive"}`}>
            {unrealizedGain >= 0 ? "+" : ""}{formatAmount(unrealizedGain)}
          </p>
          <p className="text-xs text-muted-foreground">
            Unrealized Gain ({gainPercentage}%)
          </p>
        </div>
      </div>

      <div className="p-4">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMarket" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(145, 84%, 45%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(145, 84%, 45%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 20%, 15%)" />
              <XAxis 
                dataKey="month" 
                tick={{ fill: 'hsl(150, 10%, 55%)', fontSize: 11 }}
                axisLine={{ stroke: 'hsl(150, 20%, 15%)' }}
              />
              <YAxis 
                tickFormatter={(value) => `${symbol}${(value / 10000000).toFixed(1)}Cr`}
                tick={{ fill: 'hsl(150, 10%, 55%)', fontSize: 11 }}
                axisLine={{ stroke: 'hsl(150, 20%, 15%)' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(150, 25%, 6%)', 
                  border: '1px solid hsl(150, 20%, 15%)',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: 'white' }}
                formatter={(value: number) => formatAmount(value)}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="purchase" 
                stroke="hsl(43, 74%, 52%)" 
                strokeWidth={2}
                dot={false}
                name="Purchase Price"
                strokeDasharray="5 5"
              />
              <Area
                type="monotone"
                dataKey="market"
                stroke="hsl(145, 84%, 45%)"
                fill="url(#colorMarket)"
                strokeWidth={2}
                name="Market Estimate"
                dot={{ fill: 'hsl(145, 84%, 45%)', r: 3 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Per-Asset Breakdown */}
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-3">Per-Asset Unrealized Gains</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {assets.slice(0, 3).map((asset) => {
              const purchase = asset.purchasePrice || asset.value * 0.85;
              const current = asset.currentEstimate || asset.value;
              const gain = current - purchase;
              return (
                <div key={asset.id} className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground truncate">{asset.name}</p>
                  <p className={`font-bold font-mono text-sm ${gain >= 0 ? "text-primary" : "text-destructive"}`}>
                    {gain >= 0 ? "+" : ""}{formatAmount(gain)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
