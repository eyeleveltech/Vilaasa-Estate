import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Progress } from "@/components/ui/progress";

interface Payment {
  id: string;
  property: string;
  milestone: string;
  amount: number;
  dueDate: string;
  status: "upcoming" | "pending" | "completed";
  paidAmount?: number;
  totalAmount?: number;
}

interface VaultPaymentsProps {
  payments: Payment[];
}

export function VaultPayments({ payments }: VaultPaymentsProps) {
  const { formatAmount } = useCurrency();

  const upcomingPayments = payments.filter(p => p.status === "upcoming");
  const pendingPayments = payments.filter(p => p.status === "pending");
  const completedPayments = payments.filter(p => p.status === "completed");

  const totalUpcoming = upcomingPayments.reduce((sum, p) => sum + p.amount, 0);

  // Mock payment progress data
  const paymentProgress = [
    { property: "Palm Royale Villa", paid: 11000000, total: 22000000 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-light text-foreground font-serif">Payments & Milestones</h2>
          <p className="text-muted-foreground text-sm">Track and manage your payment schedule</p>
        </div>
      </div>

      {/* Payment Progress Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {paymentProgress.map((progress) => (
          <motion.div
            key={progress.property}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card p-5 rounded-xl border border-border"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-foreground">{progress.property}</h3>
              <span className="text-sm text-gold font-mono">
                {((progress.paid / progress.total) * 100).toFixed(0)}% Paid
              </span>
            </div>
            <Progress value={(progress.paid / progress.total) * 100} className="h-3 mb-3" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Paid: {formatAmount(progress.paid)}</span>
              <span className="text-muted-foreground">Total: {formatAmount(progress.total)}</span>
            </div>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-gold/20 to-gold/5 p-5 rounded-xl border border-gold/30"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-gold">calendar_month</span>
            <span className="text-muted-foreground text-sm">Upcoming Payments</span>
          </div>
          <p className="text-2xl font-bold text-foreground font-mono">{formatAmount(totalUpcoming)}</p>
          <p className="text-sm text-gold mt-1">
            {upcomingPayments.length} milestone{upcomingPayments.length !== 1 && "s"} due
          </p>
        </motion.div>
      </div>

      {/* Upcoming Payments */}
      {upcomingPayments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl border border-border overflow-hidden"
        >
          <div className="p-4 border-b border-border bg-gold/5">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <span className="material-symbols-outlined text-gold">schedule</span>
              Upcoming Payments
            </h3>
          </div>

          <div className="divide-y divide-border">
            {upcomingPayments.map((payment, index) => (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className="p-4 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-gold">event</span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{payment.milestone}</p>
                  <p className="text-muted-foreground text-sm">{payment.property}</p>
                </div>

                <div className="text-right mr-4">
                  <p className="font-bold text-foreground font-mono">{formatAmount(payment.amount)}</p>
                  <p className="text-gold text-sm">
                    Due: {new Date(payment.dueDate).toLocaleDateString("en-IN", { 
                      day: "numeric", 
                      month: "short", 
                      year: "numeric" 
                    })}
                  </p>
                </div>

                <Button variant="hero" size="sm">
                  Pay Now
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Pending Payments */}
      {pendingPayments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-xl border border-border overflow-hidden"
        >
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <span className="material-symbols-outlined text-muted-foreground">pending</span>
              Scheduled Payments
            </h3>
          </div>

          <div className="divide-y divide-border">
            {pendingPayments.map((payment, index) => (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="p-4 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-muted-foreground">event</span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{payment.milestone}</p>
                  <p className="text-muted-foreground text-sm">{payment.property}</p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-foreground font-mono">{formatAmount(payment.amount)}</p>
                  <p className="text-muted-foreground text-sm">
                    {new Date(payment.dueDate).toLocaleDateString("en-IN", { 
                      day: "numeric", 
                      month: "short", 
                      year: "numeric" 
                    })}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="p-4 bg-muted/50 border-t border-border">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <span className="material-symbols-outlined text-lg">info</span>
              Payment reminders will be sent 7 days before each milestone
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
