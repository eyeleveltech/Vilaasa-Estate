import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Mail, Eye, EyeOff, Building, ArrowRight, UserPlus } from "lucide-react";
import { useAdminAuth } from "../../admin/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import vilaasaLogo from "@/assets/vilaasa-logo.svg";

export const PartnerLogin: React.FC = () => {
  const [email, setEmail] = useState<string>("partner@luxuryestates.com");
  const [password, setPassword] = useState<string>("Partner@Vilaasa2026");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { login, loading } = useAdminAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    await login(email, password);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 text-foreground antialiased font-display">
      {/* Background Decorative Gradient Orbs */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 right-1/4 h-[400px] w-[400px] rounded-full bg-emerald-500/5 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative w-full max-w-md space-y-8 rounded-xl border border-border bg-card/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl"
      >
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-2">
            <Link to="/home">
              <img
                src={vilaasaLogo}
                alt="Vilaasa Estates"
                className="h-8 w-auto hover:opacity-90 transition-opacity"
              />
            </Link>
          </div>
          <div>
            <span className="uppercase tracking-[0.2em] text-[11px] font-bold text-primary">
              Channel Partner Network
            </span>
            <h2 className="text-2xl font-light tracking-tight text-foreground sm:text-3xl mt-1">
              Broker <span className="font-serif italic text-primary">Concierge</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Institutional portal for certified luxury real estate partners
            </p>
          </div>
        </div>

        {/* Demo Credentials Box */}
        <div className="rounded-lg border border-border bg-secondary/40 p-4 text-xs text-muted-foreground space-y-1.5">
          <div className="flex items-center space-x-1.5 font-bold uppercase tracking-wider text-primary text-[11px]">
            <Building className="h-3.5 w-3.5" />
            <span>Sample Verified Channel Partner</span>
          </div>
          <p>
            Email: <span className="text-foreground font-mono font-medium">partner@luxuryestates.com</span>
          </p>
          <p>
            Password: <span className="text-foreground font-mono font-medium">Partner@Vilaasa2026</span>
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Partner Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="partner@luxuryestates.com"
                className="bg-background/80 pl-9 border-input text-xs sm:text-sm h-10"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="pass" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="pass"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-background/80 pl-9 pr-10 border-input text-xs sm:text-sm h-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 uppercase tracking-[0.15em] text-xs font-bold gap-2 mt-2"
          >
            <span>{loading ? "Authenticating..." : "Access Partner Portal"}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        {/* Onboarding Call to Action */}
        <div className="pt-2 text-center border-t border-border space-y-2">
          <p className="text-xs text-muted-foreground">
            Not yet registered as an institutional partner?
          </p>
          <Button asChild variant="outline" size="sm" className="gap-2 text-xs uppercase tracking-wider">
            <Link to="/partner/register">
              <UserPlus className="h-3.5 w-3.5 text-primary" />
              <span>Apply for Partnership</span>
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
