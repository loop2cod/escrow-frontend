import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';

export default function ClosingCTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="section-pinned bg-[#0B0C10] z-[90]"
    >
      {/* Grid Background (inverted) */}
      <div className="absolute inset-0 grid-background opacity-20" />

      {/* Center Ring */}
      <div
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[64vmin] h-[64vmin] rounded-full border-2 border-white/35 transition-all duration-1000 ${
          isInView ? 'opacity-100 scale-100' : 'opacity-0 scale-85'
        }`}
      />

      {/* Ring Ticks */}
      <div
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vmin] h-[70vmin] pointer-events-none transition-all duration-800 ${
          isInView ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ transitionDelay: '200ms' }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#C8FF2E] rounded-full" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#C8FF2E] rounded-full" />
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-1.5 h-1.5 bg-[#C8FF2E] rounded-full" />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1.5 h-1.5 bg-[#C8FF2E] rounded-full" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
        {/* Headline */}
        <h1
          className={`text-[clamp(36px,5vw,64px)] font-semibold leading-[0.95] tracking-tight mb-8 text-white transition-all duration-800 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          style={{ transitionDelay: '300ms' }}
        >
          Ready to remove the trust problem?
        </h1>

        {/* CTA */}
        <div
          className={`mb-6 transition-all duration-600 ${
            isInView ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-96'
          }`}
          style={{ transitionDelay: '400ms' }}
        >
          <button className="btn-primary flex items-center gap-2 mx-auto">
            Create Free Escrow
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Small Print */}
        <p
          className={`text-sm text-white/65 transition-all duration-600 ${
            isInView ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ transitionDelay: '500ms' }}
        >
          No wallet setup required to start. Licensed, regulated & insured*. Web3-backed. Human-simple.
        </p>
      </div>
    </section>
  );
}
