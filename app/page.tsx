'use client';

import './landing-page.css';
import ClosingCTA from "@/components/landing-page/sections/ClosingCTA";
import Features from "@/components/landing-page/sections/Features";
import Footer from "@/components/landing-page/sections/Footer";
import Hero from "@/components/landing-page/sections/Hero";
import HowItWorks from "@/components/landing-page/sections/HowItWorks";
import Navigation from "@/components/landing-page/sections/Navigation";
import Pricing from "@/components/landing-page/sections/Pricing";
import ProblemSolution from "@/components/landing-page/sections/ProblemSolution";
import SocialProof from "@/components/landing-page/sections/SocialProof";
import Templates from "@/components/landing-page/sections/Templates";
import TrustBadges from "@/components/landing-page/sections/TrustBadges";
import WhyChoose from '@/components/landing-page/sections/WhyChoose';

export default function LandingPage() {
  return (
    <div className="landing-page-specific relative">
      {/* Grain Overlay */}
      <div className="grain-overlay" />

      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main className="relative">
        <Hero />
        <ProblemSolution />
        <Features />
        <Templates />
        <WhyChoose />
        <HowItWorks />
        <SocialProof />
        <TrustBadges />
        <Pricing />
        <ClosingCTA />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
