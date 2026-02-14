import { useEffect, useRef, useState } from 'react';
import { Shield, FileText, Layers, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Smart Contract Escrow',
    description:
      'Funds are held on-chain until delivery is confirmed. No intermediaries, no delays.',
    link: '#',
  },
  {
    icon: FileText,
    title: 'Agreement Templates',
    description:
      'Pre-built contracts for services, goods, and milestones. Customize in minutes.',
    link: '#',
  },
  {
    icon: Layers,
    title: 'Milestone Payments',
    description:
      'Split projects into stages. Pay as work is delivered, reducing risk for everyone.',
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group bg-white rounded-2xl p-8 border border-[#e5e5e5] hover:border-[#C8FF2E] hover:shadow-lg transition-all duration-300 ${
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${200 + index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-[#F6F7FA] flex items-center justify-center mb-6 group-hover:bg-[#C8FF2E] transition-colors duration-300">
                <feature.icon
                  size={24}
                  className="text-[#0B0C10]"
                />
              </div>

              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>

              <p className="text-[#6B7280] mb-6 leading-relaxed">
                {feature.description}
              </p>

              <a
                href={feature.link}
                className="inline-flex items-center gap-2 text-sm font-medium text-[#0B0C10] hover:text-[#C8FF2E] transition-colors group/link"
              >
                Learn more
                <ArrowRight
                  size={16}
                  className="group-hover/link:translate-x-1 transition-transform"
                />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
