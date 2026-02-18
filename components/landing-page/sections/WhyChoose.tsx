import { useEffect, useRef, useState } from 'react';
import { Shield, Zap, Globe, Users, Lock, Clock, TrendingUp, CheckCircle, Award, FileCheck } from 'lucide-react';

const reasons = [
  {
    icon: Shield,
    title: 'Licensed & Regulated',
    items: [
      'Fully licensed escrow provider',
      'Insurance protected funds*',
      'Regulatory compliant',
      'Regular third-party audits',
    ],
    color: 'from-blue-500/10 to-blue-600/10',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    items: [
      'Instant wallet creation',
      'Quick verification',
      'Real-time chat',
      'Fast settlement',
    ],
    color: 'from-yellow-500/10 to-yellow-600/10',
    iconBg: 'bg-yellow-50',
    iconColor: 'text-yellow-600',
  },
  {
    icon: Globe,
    title: 'Global & Borderless',
    items: [
      'USDT Stablecoin - No volatility',
      'TRON Network - Low fees',
      'No geographic limits',
      '24/7 Operation',
    ],
    color: 'from-green-500/10 to-green-600/10',
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
  },
  {
    icon: Users,
    title: 'User-Friendly',
    items: [
      'Template library',
      'Simple UI',
      'Step-by-step wizard',
      'No crypto knowledge needed',
    ],
    color: 'from-purple-500/10 to-purple-600/10',
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
];

export default function WhyChoose() {
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
      id="why-choose"
      className="section-flowing bg-white z-[55] py-24"
    >
      {/* Grid Background */}
      <div className="absolute inset-0 grid-background opacity-50" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Headline */}
        <div
          className={`text-center mb-16 transition-all duration-600 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
        >
          <span className="micro-label block mb-4">Why StableEscrow</span>
          <h2 className="text-[clamp(32px,3.6vw,52px)] font-semibold mb-4">
            Built for trust, designed for speed
          </h2>
          <p className="text-lg text-[#6B7280] max-w-2xl mx-auto">
            Enterprise-grade security meets user-friendly design. Experience the perfect balance of power and simplicity.
          </p>
        </div>

        {/* Reason Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((reason, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl p-6 border border-[#e5e5e5] hover:border-[#C8FF2E] hover:shadow-xl transition-all duration-300 overflow-hidden group ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              style={{ transitionDelay: `${200 + index * 100}ms` }}
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${reason.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />

              <div className="relative z-10">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl ${reason.iconBg} flex items-center justify-center mb-4`}>
                  <reason.icon size={24} className={reason.iconColor} />
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold mb-4">{reason.title}</h3>

                {/* Items List */}
                <ul className="space-y-2">
                  {reason.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#6B7280]">
                      <CheckCircle size={16} className="text-[#C8FF2E] mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
