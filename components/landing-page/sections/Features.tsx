import { useEffect, useRef, useState } from 'react';
import { Shield, FileText, Layers, Wallet, MessageSquare, BarChart3 } from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'Agreement Creator with Templates',
    description:
      'Build professional contracts in minutes with pre-built templates for construction, freelance, goods, real estate, and more.',
    highlights: ['4-step wizard', 'Auto-calculated totals', 'Digital signatures'],
    link: '#',
  },
  {
    icon: Wallet,
    title: 'Secure Wallet System',
    description:
      'Auto-generated TRON wallets on verification. Each order gets a dedicated on-chain wallet for complete transparency.',
    highlights: ['USDT on TRON', 'Non-custodial', 'Instant creation'],
    link: '#',
  },
  {
    icon: Shield,
    title: 'Licensed & Insured Escrow*',
    description:
      'Licensed and regulated escrow service with insurance protection on your funds. Complete security with dispute resolution.',
    highlights: ['Licensed & Regulated', 'Insurance Protected*', 'Dispute resolution'],
    link: '#',
  },
  {
    icon: Layers,
    title: 'Milestone Payments',
    description:
      'Split projects into stages. Pay as work is delivered, reducing risk for everyone with verified completion.',
    highlights: ['Stage verification', 'Auto-release', 'Progress tracking'],
    link: '#',
  },
  {
    icon: MessageSquare,
    title: 'Real-time Communication',
    description:
      'Built-in chat between buyer and seller. Share files, discuss deliverables, and maintain complete message history.',
    highlights: ['Contract timeline', 'File sharing', 'Message history'],
    link: '#',
  },
  {
    icon: BarChart3,
    title: 'Powerful Dashboard',
    description:
      'Track balance, active orders, escrow amounts, and transaction history all in one intuitive interface.',
    highlights: ['Live balances', 'Order tracking', 'Full history'],
    link: '#',
  },
];

export default function Features() {
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
      id="features"
      className="section-flowing bg-[#F6F7FA] z-40 py-24"
    >
      {/* Grid Background */}
      <div className="absolute inset-0 grid-background" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Headline */}
        <div 
          className={`mb-16 transition-all duration-600 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <span className="micro-label block mb-4">Features</span>
          <h2 className="text-[clamp(32px,3.6vw,52px)] font-semibold max-w-2xl">
            Everything you need to close deals safely.
          </h2>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group bg-white rounded-2xl p-8 border border-[#e5e5e5] hover:border-[#C8FF2E] hover:shadow-xl transition-all duration-300 ${
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${200 + index * 80}ms` }}
            >
              <div className="w-14 h-14 rounded-xl bg-[#F6F7FA] flex items-center justify-center mb-6 group-hover:bg-[#C8FF2E] transition-colors duration-300">
                <feature.icon
                  size={26}
                  className="text-[#0B0C10]"
                />
              </div>

              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>

              <p className="text-[#6B7280] mb-4 leading-relaxed">
                {feature.description}
              </p>

              {/* Highlights */}
              <div className="flex flex-wrap gap-2 mb-6">
                {feature.highlights.map((highlight, i) => (
                  <span
                    key={i}
                    className="text-xs px-3 py-1 rounded-full bg-[#F6F7FA] text-[#0B0C10] font-medium"
                  >
                    {highlight}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
