import { useState } from "react";
import { Link } from "react-router-dom";
import vilaasaLogo from "@/assets/vilaasa-logo.svg";
import { PartnerLoginDialog } from "@/components/PartnerLoginDialog";

const socialLinks = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/vilaasaestate",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/vilaasaestate",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: "X",
    href: "https://x.com/vilaasaestates",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2H21.5l-7.11 8.127L22.75 22h-6.56l-5.137-6.708L5.18 22H1.92l7.605-8.69L1.5 2h6.727l4.643 6.135L18.244 2zm-1.142 18h1.804L7.254 3.896H5.32L17.102 20z" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@vilaasaestate",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
];

export const Footer = () => {
  const [partnerLoginOpen, setPartnerLoginOpen] = useState(false);

  return (
    <>
      <footer className="bg-[hsl(150_30%_3%)] text-foreground pt-20 pb-24 md:pb-10 border-t border-border">
        <div className="px-4 md:px-10 max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
            {/* Brand */}
            <div className="flex flex-col gap-6 md:col-span-2 lg:col-span-2">
              <img
                src={vilaasaLogo}
                alt="Vilaasa Estate"
                className="h-10 w-fit"
              />
              <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
                The intersection of luxury real estate and high-yield franchise
                aggregation.
              </p>
              <div className="flex flex-col gap-3 mt-2 max-w-md">
                <div className="flex items-start gap-2 text-muted-foreground text-sm">
                  <span className="material-symbols-outlined text-primary text-base mt-0.5">
                    location_on
                  </span>
                  <span>
                    43, 2nd Cross Street, 2nd Main Road, Navarathna Garden,
                    Defence Colony, Ekkatuthangal, Chennai, Tamil Nadu 600032
                  </span>
                </div>
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=info@vilaasaestates.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground"
                  aria-label="Email Vilaasa Estate"
                >
                  <span className="material-symbols-outlined text-primary text-base">
                    mail
                  </span>
                  <span>info@vilaasaestates.com</span>
                </a>
                <a
                  href="tel:+914443570713"
                  className="inline-flex items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground"
                  aria-label="Call Vilaasa Estate at 044 4357 0713"
                >
                  <span className="material-symbols-outlined text-primary text-base">
                    call
                  </span>
                  <span>044 4357 0713</span>
                </a>
              </div>
            </div>

            {/* Explore */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-2">
                Explore
              </h4>
              <Link
                to="/domestic/real-estate"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                India Real Estate
              </Link>
              <Link
                to="/domestic/franchise"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                Franchise Opportunities
              </Link>
              <Link
                to="/international"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                International Properties
              </Link>
              <Link
                to="/calendar"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                Book a Site Visit
              </Link>
            </div>

            {/* Legal */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-2">
                Legal
              </h4>
              <Link
                to="/privacy"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                to="/disclaimer"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                Disclaimer
              </Link>
              <Link
                to="/partner/login"
                className="text-muted-foreground hover:text-primary text-sm transition-colors text-left font-medium"
              >
                Partner Portal
              </Link>
              <Link
                to="/partner/register"
                className="text-muted-foreground hover:text-primary text-sm transition-colors text-left font-medium"
              >
                Become a Partner
              </Link>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col items-center md:items-start gap-1">
              <p className="text-muted-foreground text-xs">
                © {new Date().getFullYear()} Vilaasa Estate. All rights reserved.
              </p>
              <p className="text-muted-foreground/60 text-xs">
                Website designed by{" "}
                <a
                  href="https://www.theeyelevelstudio.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary/70 hover:text-primary transition-colors"
                >
                  EyeLevel Growth Studio
                </a>
              </p>
            </div>
            <div className="flex items-center gap-4 mr-10">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <PartnerLoginDialog
        open={partnerLoginOpen}
        onOpenChange={setPartnerLoginOpen}
      />
    </>
  );
};
