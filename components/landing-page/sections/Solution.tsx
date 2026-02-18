import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';

export default function Solution() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

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

    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const sectionHeight = rect.height;
      const scrollPast = -rect.top;
      const progress = Math.max(0, Math.min(1, scrollPast / (sectionHeight * 0.4)));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Exit transforms
  const exitX = scrollProgress * 200;
  const exitOpacity = Math.max(0, 1 - scrollProgress * 1.5);

  return (
    <section
      ref={sectionRef}
      id="solution"
      className="section-pinned bg-[#F6F7FA] z-30"
    >

      {/* Accent Dots */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className={`accent-dot absolute left-[10vw] top-[20vh] transition-all duration-500 ${
            isInView ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
          }`}
          style={{ transitionDelay: '400ms' }}
        />
        <div 
          className={`accent-dot absolute left-[40vw] top-[78vh] w-2.5 h-2.5 transition-all duration-500 ${
            isInView ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
          }`}
          style={{ transitionDelay: '500ms' }}
        />
      </div>

      {/* Left Text Block */}
      <div
        className={`absolute left-[8vw] top-1/2 -translate-y-1/2 w-[36vw] max-w-xl transition-all duration-1000 ${
          isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-[40vw]'
        }`}
        style={{ 
          transitionDelay: '200ms',
          transform: `translateY(-50%) translateX(${-scrollProgress * 100}px)`,
          opacity: exitOpacity,
        }}
      >
        <h2 className="text-[clamp(28px,3.2vw,48px)] font-semibold leading-tight mb-6">
          Verified identities.
          <br />
          Locked funds.
          <br />
          Release on delivery.
        </h2>

        <p className="text-lg text-[#6B7280] mb-8">
          StableEscrow holds payment in a smart contract. Funds release only
          when both parties confirm.
        </p>

        <button className="btn-primary flex items-center gap-2">
          Create an Agreement
          <ArrowRight size={18} />
        </button>
      </div>
    </section>
  );
}
