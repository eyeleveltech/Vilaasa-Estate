import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CurrencyToggle } from "@/components/CurrencyToggle";
import vilaasaLogo from "@/assets/vilaasa-logo.svg";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const navLinks = [
    { label: "Domestic", href: "/domestic" },
    { label: "International", href: "/international" },
    { label: "Wealth Projector", href: "/wealth-projector" },
    { label: "Contact", href: "/contact" },
  ];

  const isActivePath = (href: string) =>
    location.pathname === href || location.pathname.startsWith(`${href}/`);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-background/90 py-3 backdrop-blur-md md:py-4"
            : "bg-gradient-to-b from-black/80 to-transparent pb-6 pt-3 md:pb-8 md:pt-4"
        }`}
      >
        <div className="flex justify-center px-4 md:px-10">
          <div
            className={`flex w-full max-w-[1280px] items-center justify-between border-b pb-3 transition-colors md:pb-4 ${
              isScrolled ? "border-border/20" : "border-foreground/10"
            }`}
          >
            {/* Logo */}
            <Link to="/home" className="flex shrink-0 items-center">
              <img
                src={vilaasaLogo}
                alt="Vilaasa Estates"
                className="h-7 w-auto shrink-0 md:h-8 lg:h-9"
              />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-6 xl:gap-10">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`text-xs font-medium uppercase tracking-[0.1em] transition-colors ${
                    isActivePath(link.href)
                      ? "text-primary"
                      : "text-foreground/80 hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Currency Toggle - Desktop */}
              <div className="hidden md:block">
                <CurrencyToggle />
              </div>


              <Link to="/calendar">
                <Button variant="ghost" className="hidden sm:flex gap-2">
                  <span className="material-symbols-outlined text-base">
                    calendar_month
                  </span>
                  Book a Site Visit
                </Button>
              </Link>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
                className="p-2 -mr-2 text-foreground transition-colors hover:text-primary lg:hidden"
              >
                <span className="material-symbols-outlined text-[28px]">
                  {isMobileMenuOpen ? "close" : "menu"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-t border-border bg-background/95 backdrop-blur-md lg:hidden"
          >
            <div className="max-h-[calc(100vh-76px)] overflow-y-auto px-4 py-6 md:px-6">
              {/* Mobile Currency Toggle */}
              <div className="flex items-center justify-between border-b border-border pb-5">
                <span className="text-sm font-medium text-muted-foreground">Currency</span>
                <CurrencyToggle />
              </div>

              <div className="mt-6 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`py-3 text-sm font-medium uppercase tracking-[0.1em] transition-colors ${
                      isActivePath(link.href)
                        ? "text-primary"
                        : "text-foreground/80 hover:text-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>


              <Link to="/calendar" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" className="mt-4 w-full gap-2">
                  <span className="material-symbols-outlined text-base">
                    calendar_month
                  </span>
                  Book a Site Visit
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </motion.nav>
    </>
  );
};
