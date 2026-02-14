import { useEffect, useRef, useState } from 'react';
import { FileText, Wallet, Package, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: FileText,
    number: '01',
    title: 'Create Agreement',
    description: 'Set terms, milestones, and deadlines.',
  },
  {
    icon: Wallet,
    number: '02',
    title: 'Fund Escrow',
    description: 'Buyer locks funds in a smart contract.',
  },
  {
    icon: Package,
    number: '03',
    title: 'Deliver Work',
    description: 'Seller completes and submits deliverables.',
  },
  {
    icon: CheckCircle,
    number: '04',
    title: 'Release Payment',
    description: 'Funds release upon confirmation.',
  },
];

export default function HowItWorks() {
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
      id="how-it-works"
      className="section-flowing bg-[#F6F7FA] z-[60] py-24"
    >
      {/* Grid Background */}
      <div className="absolute inset-0 grid-background" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Headline */}
        <div 
          className={`text-center mb-16 transition-all duration-600 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <h2 className="text-[clamp(32px,3.6vw,52px)] font-semibold">
            How it works
          </h2>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector Line (desktop only) */}
          <div
            className={`hidden lg:block absolute top-[60px] left-[12.5%] right-[12.5%] h-0.5 bg-[#e5e5e5] origin-left transition-transform duration-1000 ${
              isInView ? 'scale-x-100' : 'scale-x-0'
            }`}
          >
            <div className="absolute inset-0 bg-[#C8FF2E] origin-left" />
          </div>

          {/* Step Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className={`flex flex-col items-center text-center transition-all duration-600 ${
                  isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                }`}
                style={{ transitionDelay: `${300 + index * 100}ms` }}
              >
                {/* Number Circle */}
                <div 
                  className={`step-number relative z-10 w-[60px] h-[60px] rounded-full bg-[#0B0C10] flex items-center justify-center mb-6 transition-transform duration-500 ${
                    isInView ? 'scale-100' : 'scale-90'
                  }`}
                  style={{ transitionDelay: `${400 + index * 100}ms` }}
                >
                  <span className="text-[#C8FF2E] font-mono font-medium text-sm">
                    {step.number}
                  </span>
                </div>

                {/* Icon */}
                <div className="w-10 h-10 rounded-lg bg-[#F6F7FA] flex items-center justify-center mb-4">
                  <step.icon size={20} className="text-[#0B0C10]" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-[#6B7280] max-w-[200px]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
