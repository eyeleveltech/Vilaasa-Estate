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
    { label: "Asset Management", href: "/asset-management" },
    { label: "Property Management", href: "/property-management" },
    { label: "Wealth Projector", href: "/wealth-projector" },
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
        <div className="flex justify-center px-4 md:px-8 xl:px-12">
          <div
            className={`flex w-full max-w-[1440px] 2xl:max-w-[1600px] items-center justify-between border-b pb-3 transition-colors md:pb-4 ${
              isScrolled ? "border-border/20" : "border-foreground/10"
            }`}
          >
            {/* Logo */}
            <Link to="/home" className="flex shrink-0 items-center mr-4 lg:mr-8 xl:mr-12">
              <img
                src={vilaasaLogo}
                alt="Vilaasa Estates"
                className="h-6 w-auto shrink-0 sm:h-7 md:h-8"
              />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center justify-center gap-4 lg:gap-5 xl:gap-7 2xl:gap-9 flex-1 min-w-0">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`whitespace-nowrap text-[11px] xl:text-xs font-medium uppercase tracking-[0.08em] transition-colors py-1 ${
                    isActivePath(link.href)
                      ? "text-primary font-semibold"
                      : "text-foreground/80 hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2 md:gap-3 xl:gap-4 shrink-0 ml-4 lg:ml-8 xl:ml-12">
              {/* Currency Toggle - Desktop */}
              <div className="hidden md:block">
                <CurrencyToggle />
              </div>

              <Link to="/contact">
                <Button variant="ghost" size="sm" className="hidden sm:flex gap-2 text-xs uppercase tracking-wider font-semibold px-3.5">
                  <span className="material-symbols-outlined text-base">
                    mail
                  </span>
                  <span>Contact</span>
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


              <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" className="mt-4 w-full gap-2">
                  <span className="material-symbols-outlined text-base">
                    mail
                  </span>
                  Contact
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </motion.nav>
    </>
  );
};
