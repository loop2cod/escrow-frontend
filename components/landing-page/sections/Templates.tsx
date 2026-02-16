import { useEffect, useRef, useState } from 'react';
import { Briefcase, ShoppingCart, PackageOpen, Building2, Globe2, FilePlus, Hammer } from 'lucide-react';

const templates = [
  {
    icon: Hammer,
    title: 'Construction & Renovation',
    description: 'Milestone-based payments for building projects with stage verification.',
    color: 'bg-orange-50 hover:bg-orange-100',
    iconColor: 'text-orange-600',
  },
  {
    icon: ShoppingCart,
    title: 'Goods Purchase',
    description: 'Secure buying/selling of physical products with delivery confirmation.',
    color: 'bg-blue-50 hover:bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    icon: Briefcase,
    title: 'Freelance Services',
    description: 'Development, design, consulting agreements with flexible milestones.',
    color: 'bg-purple-50 hover:bg-purple-100',
    iconColor: 'text-purple-600',
  },
  {
    icon: PackageOpen,
    title: 'Bulk Orders',
    description: 'Wholesale and large quantity transactions with escrow protection.',
    color: 'bg-green-50 hover:bg-green-100',
    iconColor: 'text-green-600',
  },
  {
    icon: Building2,
    title: 'Real Estate',
    description: 'Property sales, deposits, rental agreements with secure payment.',
    color: 'bg-red-50 hover:bg-red-100',
    iconColor: 'text-red-600',
  },
  {
    icon: Globe2,
    title: 'Trade & Commerce',
    description: 'B2B transactions, import/export deals, cross-border security.',
    color: 'bg-cyan-50 hover:bg-cyan-100',
    iconColor: 'text-cyan-600',
  },
  {
    icon: FilePlus,
    title: 'Custom Projects',
    description: 'Flexible template for unique agreements and special terms.',
    color: 'bg-gray-50 hover:bg-gray-100',
    iconColor: 'text-gray-600',
  },
];

export default function Templates() {
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
      id="templates"
      className="section-flowing bg-[#F6F7FA] z-50 py-24"
    >
      {/* Grid Background */}
      <div className="absolute inset-0 grid-background" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Headline Row */}
        <div
          className={`flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16 transition-all duration-600 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
        >
          <h2 className="text-[clamp(32px,3.6vw,52px)] font-semibold max-w-xl">
            Start with a template.
            <br />
            Finish with confidence.
          </h2>

          <p className="text-lg text-[#6B7280] max-w-md">
            Choose a contract type, set milestones, and invite your
            counterparty in minutes.
          </p>
        </div>

        {/* Template Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {templates.map((template, index) => (
            <div
              key={index}
              className={`group bg-white rounded-xl p-6 border border-[#e5e5e5] hover:border-[#C8FF2E] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer ${
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${200 + index * 80}ms` }}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 ${template.color}`}>
                <template.icon size={22} className={template.iconColor} />
              </div>

              <h3 className="text-lg font-semibold mb-2">{template.title}</h3>

              <p className="text-sm text-[#6B7280] leading-relaxed">
                {template.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
