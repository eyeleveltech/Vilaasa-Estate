import React from "react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { ArrowLeft, Home, Building2, Briefcase, MessageSquare } from "lucide-react";
import vilaasaLogo from "@/assets/vilaasa-logo.svg";

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-[hsl(150_30%_3%)] text-foreground flex flex-col justify-between px-6 py-12 relative overflow-hidden">
      {/* Dynamic SEO Tag with noindex to eliminate Soft 404 indexing */}
      <SEO
        title="404 - Page Not Found"
        description="The requested luxury estate, franchise opportunity, or page could not be located."
        noindex
      />

      {/* Subtle Luxury Ambient Background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between z-10">
        <Link to="/" className="inline-block" aria-label="Return to Vilaasa Estate homepage">
          <img src={vilaasaLogo} alt="Vilaasa Estate" className="h-9 w-auto" />
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Discovery</span>
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-2xl mx-auto text-center py-16 z-10">
        <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4 block">
          Error 404 • Destination Unreachable
        </span>

        <h1 className="text-8xl md:text-9xl font-serif font-light tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-[#f3e8d2] via-[#dfc499] to-[#997f59] mb-6">
          404
        </h1>

        <h2 className="text-2xl md:text-3xl font-serif font-normal text-foreground mb-4">
          This Private Reserve Is Unavailable
        </h2>

        <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-lg mx-auto mb-10">
          The estate, franchise opportunity, or dossier you requested may have been private-listed,
          acquired, or relocated to our private archives.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-lg bg-primary text-primary-foreground text-xs uppercase font-semibold tracking-wider hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
          <Link
            to="/domestic/real-estate"
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-lg border border-border bg-card/60 hover:bg-card text-foreground text-xs uppercase font-semibold tracking-wider transition-colors"
          >
            <Building2 className="w-4 h-4 text-primary" />
            <span>Explore Estates</span>
          </Link>
          <Link
            to="/domestic/franchise"
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-lg border border-border bg-card/60 hover:bg-card text-foreground text-xs uppercase font-semibold tracking-wider transition-colors"
          >
            <Briefcase className="w-4 h-4 text-primary" />
            <span>Franchises</span>
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-lg border border-border bg-card/60 hover:bg-card text-foreground text-xs uppercase font-semibold tracking-wider transition-colors"
          >
            <MessageSquare className="w-4 h-4 text-primary" />
            <span>Concierge</span>
          </Link>
        </div>
      </main>

      {/* Footer Meta */}
      <footer className="w-full max-w-6xl mx-auto text-center text-xs text-muted-foreground/50 z-10">
        © {new Date().getFullYear()} Vilaasa Estate • The Luxury of Certainty
      </footer>
    </div>
  );
};

export default NotFound;
