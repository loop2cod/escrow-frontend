import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);

    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const progress = Math.max(0, Math.min(1, -rect.top / (windowHeight * 0.5)));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const exitOpacity = Math.max(0, 1 - scrollProgress * 1.5);
  const exitScale = 1 + scrollProgress * 0.18;
  const exitY = -scrollProgress * 100;

  return (
    <section
      ref={sectionRef}
      className="section-pinned bg-secondary z-10"
      style={{ opacity: exitOpacity }}
    >
      <div
        className={`absolute inset-0 grid-background transition-opacity duration-600 ${isVisible ? 'opacity-100' : 'opacity-0'
          }`}
      />

      <div className="absolute inset-0 pointer-events-none">
        <div
          className={`accent-dot absolute left-[18vw] top-[22vh] transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
            }`}
          style={{ transitionDelay: '600ms' }}
        />
        <div
          className={`accent-dot absolute right-[16vw] top-[70vh] w-3 h-3 transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
            }`}
          style={{ transitionDelay: '700ms' }}
        />
      </div>

      <div
        className={`absolute left-[6vw] top-[14vh] micro-label transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        style={{ transitionDelay: '300ms' }}
      >
        Escrow Platform
      </div>

      <div
        className={`absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2 w-[62vmin] h-[62vmin]  transition-all duration-800 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        style={{
          transitionDelay: '200ms',
          transform: `translate(-50%, -50%) scale(${exitScale})`,
        }}
      />

      <div
        className={`absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2 w-[68vmin] h-[68vmin] pointer-events-none transition-all duration-400 ${isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        style={{ transitionDelay: '400ms' }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-accent rounded-full" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-accent rounded-full" />
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-1 h-1 bg-foreground rounded-full" />
      </div>

      <div
        className="relative z-10 text-center px-6 max-w-4xl mx-auto"
        style={{ transform: `translateY(${exitY}px)` }}
      >
        <h1
          className={`text-[clamp(32px,5vw,64px)] font-semibold leading-[0.95] tracking-tight mb-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          style={{ transitionDelay: '400ms' }}
        >
          <span className="inline-block">Secure</span>{' '}
          <span className="inline-block">Transactions.</span>{' '}
          <span className="inline-block">Verified</span>{' '}
          <span className="inline-block">Payments.</span>{' '}
          <span className="inline-block">Zero</span>{' '}
          <span className="inline-block">Trust</span>{' '}
          <span className="inline-block">Issues.</span>
        </h1>

        <p
          className={`text-lg text-muted-foreground max-w-2xl mx-auto mb-8 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          style={{ transitionDelay: '500ms' }}
        >
          A decentralized escrow platform built on blockchain that protects both buyers and sellers with automation, milestone-based payments, and seamless crypto transactions.
        </p>

        <div
          className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          style={{ transitionDelay: '600ms' }}
        >
          <button className="btn-primary flex items-center gap-2">
            Create Free Escrow
            <ArrowRight size={18} />
          </button>
          <button
            onClick={() => scrollToSection('solution')}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            See how it works
          </button>
        </div>
      </div>
    </section>
  );
}
