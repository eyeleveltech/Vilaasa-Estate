import React, { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  LogOut,
  Menu,
  X,
  Shield,
  ExternalLink,
  Lock,
} from "lucide-react";
import { useVaultLogin, VaultUser } from "../hooks/useVault";
import vilaasaLogo from "@/assets/vilaasa-logo.svg";

export const VaultLayout: React.FC = () => {
  const location = useLocation();
  const { logout } = useVaultLogin();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Read current investor user from localStorage
  const savedUserJson =
    typeof window !== "undefined"
      ? localStorage.getItem("vilaasa-vault-user")
      : null;
  const user: VaultUser | null = savedUserJson
    ? JSON.parse(savedUserJson)
    : null;

  const navItems = [
    {
      label: "Dashboard",
      path: "/vault/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Portfolio Assets",
      path: "/vault/portfolio",
      icon: Building2,
    },
  ];

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("/vault/portfolio")) return "Investment Portfolio";
    return "Investor Command Dashboard";
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground antialiased font-display">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col justify-between border-r border-border bg-card transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Logo Brand Header */}
          <div className="flex h-20 items-center justify-between border-b border-border px-4">
            <Link
              to="/vault/dashboard"
              className="flex flex-col gap-1 min-w-0"
              onClick={() => setMobileOpen(false)}
            >
              <img
                src={vilaasaLogo}
                alt="Vilaasa Estates"
                className="h-[18px] w-auto max-w-[140px] object-contain shrink-0"
              />
              <div className="flex items-center gap-1.5">
                <span className="rounded-md bg-[#D4AF37]/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.15em] text-[#D4AF37] border border-[#D4AF37]/30 shrink-0 flex items-center gap-1">
                  <Lock className="h-2.5 w-2.5" />
                  The Vault
                </span>
                <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Investor Desk</span>
              </div>
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="text-muted-foreground hover:text-foreground lg:hidden p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5 p-3">
            <p className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
              Holdings &amp; Analytics
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`group flex items-center space-x-3 rounded-r-md px-3.5 py-2.5 text-xs uppercase tracking-[0.1em] font-medium transition-all duration-200 ${
                    isActive
                      ? "border-l-2 border-primary bg-primary/10 text-primary font-semibold shadow-sm"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground border-l-2 border-transparent"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions & User Profile */}
        <div className="border-t border-border p-3 space-y-2.5">
          <Link
            to="/home"
            target="_blank"
            className="flex items-center justify-between rounded-md px-3 py-2 text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <span className="flex items-center space-x-2">
              <ExternalLink className="h-3.5 w-3.5 text-primary" />
              <span>Public Showcase</span>
            </span>
          </Link>

          <div className="flex items-center justify-between rounded-lg bg-secondary/40 p-2.5 border border-border">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-400 border border-emerald-500/30 font-serif">
                {user?.name ? user.name.charAt(0).toUpperCase() : "V"}
              </div>
              <div className="overflow-hidden">
                <p className="truncate text-xs font-semibold text-foreground">
                  {user?.name || "Client Investor"}
                </p>
                <p className="truncate text-[10px] text-muted-foreground">
                  {user?.email || "investor@familyoffice.com"}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout from The Vault"
              className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded hover:bg-secondary"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:pl-[240px]">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/90 px-6 backdrop-blur-md">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-md border border-border p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-block h-px w-6 bg-primary/60" />
              <h1 className="text-base font-light tracking-tight text-foreground sm:text-lg">
                {getPageTitle()}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3.5 py-1 text-[10px] font-bold tracking-[0.2em] text-[#D4AF37] uppercase">
              <Shield className="h-3 w-3" />
              <span>VAULT CLIENT</span>
            </div>
          </div>
        </header>

        {/* Page Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[1400px] mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default VaultLayout;
