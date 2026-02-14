import { useEffect, useRef, useState } from 'react';
import { Briefcase, ShoppingCart, Milestone, FilePlus } from 'lucide-react';

const templates = [
  {
    icon: Briefcase,
    title: 'Freelance Projects',
    description: 'Development, design, consulting agreements with milestone payments.',
  },
  {
    icon: ShoppingCart,
    title: 'Goods Purchase',
    description: 'Secure buying and selling of physical products with delivery confirmation.',
  },
  {
    icon: Milestone,
    title: 'Milestone Services',
    description: 'Multi-stage projects with payment release at each completion.',
  },
  {
    icon: FilePlus,
    title: 'Custom Deal',
    description: 'Flexible template for unique agreements and special terms.',
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {templates.map((template, index) => (
            <div
              key={index}
              className={`group bg-white rounded-xl p-6 border border-[#e5e5e5] hover:border-[#C8FF2E] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer ${
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${200 + index * 100}ms` }}
            >
              <div className="w-10 h-10 rounded-lg bg-[#F6F7FA] flex items-center justify-center mb-4 group-hover:bg-[#C8FF2E] transition-colors duration-300">
                <template.icon size={20} className="text-[#0B0C10]" />
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
