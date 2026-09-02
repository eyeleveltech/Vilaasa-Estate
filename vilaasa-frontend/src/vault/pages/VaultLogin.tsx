import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, ShieldCheck, ArrowLeft, KeyRound } from "lucide-react";
import { useVaultLogin } from "../hooks/useVault";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import vilaasaLogo from "@/assets/vilaasa-logo.svg";

export const VaultLogin: React.FC = () => {
  const { login, loading } = useVaultLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    try {
      await login(email, password);
    } catch {
      // toast is already handled in hook
    }
  };

  return (
    <div className="relative flex min-h-screen w-full max-w-full items-center justify-center overflow-hidden bg-background px-3 sm:px-4 py-8 sm:py-12 text-foreground font-display antialiased">
      {/* Background Ambience Orbs matching public showcase */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-40 right-1/4 h-[400px] w-[400px] rounded-full bg-[#D4AF37]/5 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Main Vault Box */}
        <div className="rounded-2xl border border-border bg-card/95 p-4 sm:p-6 md:p-8 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Link to="/home">
                <img
                  src={vilaasaLogo}
                  alt="Vilaasa Estates"
                  className="h-8 w-auto hover:opacity-90 transition-opacity"
                />
              </Link>
            </div>

            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37] shadow-inner">
              <Lock className="h-5 w-5" />
            </div>

            <h1 className="font-serif text-2xl font-light italic tracking-wider text-foreground sm:text-3xl">
              THE VAULT
            </h1>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
              Private Investor Portal
            </p>

            {/* Decorative Gold Divider */}
            <div className="mx-auto my-5 flex items-center justify-center gap-3">
              <div className="h-px w-12 bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent" />
              <ShieldCheck className="h-3.5 w-3.5 text-[#D4AF37]" />
              <div className="h-px w-12 bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent" />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Investor Email Address
              </Label>
              <Input
                type="email"
                required
                placeholder="investor@familyoffice.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-secondary/40 text-xs border-border h-10 focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Vault Security Password
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-secondary/40 pr-10 text-xs border-border h-10 focus:border-primary font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold uppercase tracking-wider text-xs h-10 mt-2 shadow-lg shadow-primary/20"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span>Unlocking Vault...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <KeyRound className="h-3.5 w-3.5" />
                  <span>Access Vault</span>
                </div>
              )}
            </Button>
          </form>

          {/* Demo Credentials Helper Box */}
          <div className="mt-6 rounded-lg border border-border/70 bg-secondary/20 p-3 text-[11px] text-muted-foreground font-mono">
            <p className="font-semibold text-foreground mb-1 font-sans text-xs">
              Demonstration Investor Account:
            </p>
            <p className="truncate">Email: investor@vilaasa.com</p>
            <p>Password: investor123</p>
          </div>

          {/* Back link */}
          <div className="mt-6 text-center">
            <Link
              to="/home"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Return to main showcase</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VaultLogin;
