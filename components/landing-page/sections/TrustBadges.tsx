'use client';

import { useEffect, useRef, useState } from 'react';
import { ShieldCheck, Award, FileCheck, Lock } from 'lucide-react';

export default function TrustBadges() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const badges = [
    {
      icon: ShieldCheck,
      title: 'Licensed & Regulated',
      description: 'Fully compliant with financial regulations and licensed to operate as a secure escrow service provider.',
      highlight: 'Regulated Entity',
    },
    {
      icon: Award,
      title: 'Insurance Protected*',
      description: 'Escrow funds are protected with comprehensive insurance coverage for added peace of mind.',
      highlight: 'Insured Funds',
    },
    {
      icon: FileCheck,
      title: 'Audited & Verified',
      description: 'Regular third-party audits ensure compliance with the highest security and transparency standards.',
      highlight: 'Regular Audits',
    }
  ];

  return (
    <section
      ref={sectionRef}
      id="trust-badges"
      className="section-flowing bg-white z-[75] py-24"
    >
      {/* Grid Background */}
      <div className="absolute inset-0 grid-background opacity-50" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Headline */}
        <div
          className={`text-center mb-12 transition-all duration-600 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <span className="micro-label block mb-4">Trust & Security</span>
          <h2 className="text-[clamp(32px,3.6vw,52px)] font-semibold mb-4">
            Licensed, Regulated & Insured*
          </h2>
          <p className="text-lg text-[#6B7280] max-w-2xl mx-auto">
            Your funds are protected by industry-leading security measures, regulatory compliance, and comprehensive insurance coverage.
          </p>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {badges.map((badge, index) => (
            <div
              key={index}
              className={`relative bg-gradient-to-br from-[#F6F7FA] to-white rounded-2xl p-8 border border-[#e5e5e5] hover:border-[#C8FF2E] hover:shadow-lg transition-all duration-300 group ${
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${200 + index * 100}ms` }}
            >
              {/* Highlight Badge */}
              <div className="absolute -top-3 left-6">
                <span className="inline-block px-3 py-1 bg-[#C8FF2E] text-[#0B0C10] text-xs font-semibold rounded-full">
                  {badge.highlight}
                </span>
              </div>

              {/* Icon */}
              <div className="w-16 h-16 rounded-xl bg-white border border-[#e5e5e5] flex items-center justify-center mb-5 mt-4 group-hover:border-[#C8FF2E] group-hover:bg-[#C8FF2E]/10 transition-all duration-300">
                <badge.icon size={32} className="text-[#0B0C10]" />
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold mb-3">{badge.title}</h3>

              {/* Description */}
              <p className="text-sm text-[#6B7280] leading-relaxed">
                {badge.description}
              </p>
            </div>
          ))}
        </div>

        {/* Insurance Disclaimer */}
        <div
          className={`mt-10 text-center transition-all duration-600 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '600ms' }}
        >
          <p className="text-xs text-[#6B7280] max-w-3xl mx-auto">
            *Insurance coverage subject to terms and conditions. Coverage limits and eligibility criteria apply. 
            Please refer to our Terms of Service for complete details on insurance protection and coverage scope.
          </p>
        </div>
      </div>
    </section>
  );
}
