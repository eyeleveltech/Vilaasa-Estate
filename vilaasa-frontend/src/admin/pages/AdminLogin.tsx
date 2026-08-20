import React, { useState } from "react";
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight } from "lucide-react";
import { useAdminAuth } from "../hooks/useAdminAuth";

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState<string>("superadmin@vilaasa.com");
  const [password, setPassword] = useState<string>("SuperAdmin@Vilaasa2026");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { login, loading } = useAdminAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    await login(email, password);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4 text-white antialiased">
      {/* Background Decorative Gradient Orbs */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#D4AF37]/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 right-1/4 h-[400px] w-[400px] rounded-full bg-[#D4AF37]/5 blur-[100px]" />

      <div className="relative w-full max-w-md space-y-8 rounded-2xl border border-[#2a2a2a] bg-[#111111] p-8 shadow-2xl backdrop-blur-xl">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-[#D4AF37]/30 bg-[#1a1a1a] text-[#D4AF37] shadow-inner">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="font-serif text-2xl font-bold tracking-[0.15em] text-[#D4AF37]">
            VILAASA ESTATES
          </h2>
          <p className="text-xs uppercase tracking-widest text-[#a0a0a0]">
            Executive Admin Portal
          </p>
        </div>

        {/* Demo Hint Banner */}
        <div className="rounded-lg border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-3.5 text-xs text-[#dcdcdc]">
          <div className="flex items-center space-x-2 font-semibold text-[#D4AF37] mb-1">
            <span>Demo Super Admin Credentials</span>
          </div>
          <p className="text-[#a0a0a0]">
            Email: <span className="text-white font-mono">superadmin@vilaasa.com</span>
          </p>
          <p className="text-[#a0a0a0]">
            Password: <span className="text-white font-mono">SuperAdmin@Vilaasa2026</span>
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wider text-[#a0a0a0]">
              Email Address
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#666666]">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@vilaasa.com"
                className="w-full rounded-lg border border-[#2a2a2a] bg-[#181818] py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#555555] transition-colors focus:border-[#D4AF37] focus:bg-[#141414] focus:outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wider text-[#a0a0a0]">
              Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#666666]">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-lg border border-[#2a2a2a] bg-[#181818] py-2.5 pl-10 pr-10 text-sm text-white placeholder-[#555555] transition-colors focus:border-[#D4AF37] focus:bg-[#141414] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#666666] hover:text-[#a0a0a0]"
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
          <button
            type="submit"
            disabled={loading}
            className="group flex w-full items-center justify-center space-x-2 rounded-lg bg-[#D4AF37] py-3 text-sm font-bold text-black shadow-lg shadow-[#D4AF37]/20 transition-all hover:bg-[#b8952b] disabled:opacity-50"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
            ) : (
              <>
                <span>Sign In to Admin Portal</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
