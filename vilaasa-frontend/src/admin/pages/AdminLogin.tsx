import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight } from "lucide-react";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import vilaasaLogo from "@/assets/vilaasa-logo.svg";

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { login, loading } = useAdminAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    await login(email, password);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 text-foreground antialiased font-display">
      {/* Background Decorative Gradient Orbs matching public splash */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 right-1/4 h-[400px] w-[400px] rounded-full bg-accent/5 blur-[120px]" />

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
              Private Executive Portal
            </span>
            <h2 className="text-2xl font-light tracking-tight text-foreground sm:text-3xl mt-1">
              Admin <span className="font-serif italic text-primary">Authentication</span>
            </h2>
          </div>
        </div>



        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-foreground/90">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@vilaasa.com"
                className="bg-background/80 pl-9 border-input text-xs sm:text-sm h-10 placeholder:text-foreground/50"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="pass" className="text-xs font-semibold uppercase tracking-wider text-foreground/90">
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
                placeholder="••••••••••••"
                className="bg-background/80 pl-9 pr-10 border-input text-xs sm:text-sm h-10 font-mono placeholder:text-foreground/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
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
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-[0.1em] text-xs font-semibold h-11 mt-2 shadow-lg shadow-primary/10 transition-all group"
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              <span className="flex items-center justify-center space-x-1.5 sm:space-x-2">
                <span className="hidden sm:inline">Access Management Console</span>
                <span className="sm:hidden">Access Console</span>
                <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
              </span>
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};
