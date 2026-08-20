import React, { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Inbox,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { useAdminAuth } from "../hooks/useAdminAuth";

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAdminAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Properties",
      path: "/admin/properties",
      icon: Building2,
    },
    {
      label: "Inquiries",
      path: "/admin/inquiries",
      icon: Inbox,
    },
  ];

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("/admin/properties/new")) return "Add New Property";
    if (path.includes("/edit")) return "Edit Property";
    if (path.startsWith("/admin/properties/")) return "Property Details";
    if (path === "/admin/properties") return "Property Management";
    if (path === "/admin/inquiries") return "Client Inquiries Pipeline";
    return "Executive Dashboard";
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-white antialiased font-sans">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[240px] flex-col justify-between border-r border-[#2a2a2a] bg-[#111111] transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Logo Brand */}
          <div className="flex h-16 items-center justify-between border-b border-[#2a2a2a] px-6">
            <Link
              to="/admin/dashboard"
              className="flex items-center space-x-2"
              onClick={() => setMobileOpen(false)}
            >
              <span className="font-serif text-xl tracking-[0.2em] text-[#D4AF37] font-bold">
                VILAASA
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[#a0a0a0] font-mono">
                ADMIN
              </span>
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="text-[#a0a0a0] hover:text-white lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                (item.path !== "/admin/dashboard" &&
                  location.pathname.startsWith(item.path));

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`group flex items-center space-x-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "border border-[#D4AF37]/30 bg-[#1a1a1a] text-[#D4AF37] shadow-lg shadow-black/40 font-semibold"
                      : "text-[#a0a0a0] hover:bg-[#181818] hover:text-white"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 transition-colors ${
                      isActive
                        ? "text-[#D4AF37]"
                        : "text-[#a0a0a0] group-hover:text-white"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions & User Profile */}
        <div className="border-t border-[#2a2a2a] p-4 space-y-3">
          <Link
            to="/home"
            target="_blank"
            className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-[#a0a0a0] hover:bg-[#1a1a1a] hover:text-white transition-colors"
          >
            <span className="flex items-center space-x-2">
              <ExternalLink className="h-4 w-4 text-[#D4AF37]" />
              <span>Public Website</span>
            </span>
          </Link>

          <div className="flex items-center justify-between rounded-lg bg-[#181818] p-3 border border-[#262626]">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/10 text-xs font-bold text-[#D4AF37] border border-[#D4AF37]/30">
                {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
              </div>
              <div className="overflow-hidden">
                <p className="truncate text-xs font-semibold text-white">
                  {user?.name || "Super Admin"}
                </p>
                <div className="flex items-center space-x-1 text-[10px] text-[#D4AF37]">
                  <ShieldCheck className="h-3 w-3" />
                  <span>{user?.role || "SUPER_ADMIN"}</span>
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="text-[#a0a0a0] hover:text-[#ef4444] transition-colors p-1.5 rounded hover:bg-[#222222]"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:pl-[240px]">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#2a2a2a] bg-[#0a0a0a]/90 px-6 backdrop-blur-md">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg border border-[#2a2a2a] p-2 text-[#a0a0a0] hover:bg-[#181818] hover:text-white lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-bold tracking-tight text-white md:text-xl">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 rounded-full border border-[#2a2a2a] bg-[#141414] px-3.5 py-1 text-xs text-[#a0a0a0]">
              <span className="h-2 w-2 rounded-full bg-[#22c55e] animate-pulse" />
              <span>Production API: Connected</span>
            </div>
          </div>
        </header>

        {/* Page Content View */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
