import { useEffect, useRef, useState } from 'react';
import { Check, ArrowRight } from 'lucide-react';

const features = [
  'Account Creation',
  'Wallet Generation',
  'Agreement Templates',
  'Contract Creation',
  'Escrow Wallet Creation',
  'Platform Fee (2%)',
  'Dispute Resolution',
];

export default function Pricing() {
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

  return (
    <section
      ref={sectionRef}
      id="pricing"
      className="section-flowing bg-[#F6F7FA] z-[80] py-24"
    >
      {/* Grid Background */}
      <div className="absolute inset-0 grid-background" />

      <div className="relative z-10 max-w-4xl mx-auto px-6">
        {/* Headline */}
        <div 
          className={`text-center mb-16 transition-all duration-600 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <span className="micro-label block mb-4">Pricing</span>
          <h2 className="text-[clamp(32px,3.6vw,52px)] font-semibold mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-[#6B7280] max-w-xl mx-auto">
            Start free and only pay when you transact. No hidden fees, no
            surprises.
          </p>
        </div>

        {/* Pricing Card */}
        <div
          className={`bg-white rounded-2xl p-8 md:p-12 border border-[#e5e5e5] shadow-sm transition-all duration-600 ${
            isInView ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-98'
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Left - Price */}
            <div className="flex flex-col justify-center">
              <div className="mb-6">
                <span className="text-sm text-[#6B7280] block mb-2">
                  Platform Fee
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-[clamp(48px,5vw,72px)] font-bold leading-none">
                    2%
                  </span>
                  <span className="text-[#6B7280]">per transaction</span>
                </div>
              </div>

              <p className="text-[#6B7280] mb-8">
                Only pay when money moves. No monthly fees, no setup costs, no
                hidden charges.
              </p>

              <button className="btn-primary flex items-center justify-center gap-2 w-full md:w-auto">
                Get Started Free
                <ArrowRight size={18} />
              </button>

              <p className="text-xs text-[#6B7280] mt-4">
                No credit card required
              </p>
            </div>

            {/* Right - Features */}
            <div>
              <span className="text-sm font-semibold block mb-6">
                Everything included:
              </span>
              <ul className="space-y-4">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#C8FF2E] flex items-center justify-center flex-shrink-0">
                      <Check size={12} className="text-[#0B0C10]" />
                    </div>
                    <span className="text-[#0B0C10]">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
