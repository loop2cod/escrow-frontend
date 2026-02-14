'use client';

import ClosingCTA from "@/components/landing-page/sections/ClosingCTA";
import Features from "@/components/landing-page/sections/Features";
import Footer from "@/components/landing-page/sections/Footer";
import Hero from "@/components/landing-page/sections/Hero";
import HowItWorks from "@/components/landing-page/sections/HowItWorks";
import Navigation from "@/components/landing-page/sections/Navigation";
import Pricing from "@/components/landing-page/sections/Pricing";
import Problem from "@/components/landing-page/sections/Problem";
import SocialProof from "@/components/landing-page/sections/SocialProof";
import Solution from "@/components/landing-page/sections/Solution";
import Templates from "@/components/landing-page/sections/Templates";

export default function LandingPage() {
  return (
    <div className="relative">
      {/* Grain Overlay */}
      <div className="grain-overlay" />

      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main className="relative">
        <Hero />
        <Problem />
        <Solution />
        <Features />
        <Templates />
        <HowItWorks />
        <SocialProof />
        <Pricing />
        <ClosingCTA />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
