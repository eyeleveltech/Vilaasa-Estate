import { useState } from "react";
import { SplashGateway } from "@/components/SplashGateway";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { FilterSection } from "@/components/FilterSection";
import { QuoteSection } from "@/components/QuoteSection";
import { DualPortfolioSection } from "@/components/DualPortfolioSection";
import { ChannelPartnerSection } from "@/components/ChannelPartnerSection";
import { CTASection } from "@/components/CTASection";
import { Footer } from "@/components/Footer";

const Index = () => {
  // const [showSplash, setShowSplash] = useState(true);

  return (
    <div className="overflow-x-hidden">
     
      <Navbar />
      <main>
        <HeroSection />
        <FilterSection />
        <QuoteSection />
        <DualPortfolioSection />
        <ChannelPartnerSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
