import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';

export default function Problem() {
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
      const scrollPast = -rect.top;
      const sectionHeight = rect.height;
      const progress = Math.max(0, Math.min(1, scrollPast / (sectionHeight * 0.4)));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToSolution = () => {
    const element = document.getElementById('solution');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const exitX = -scrollProgress * 200;
  const exitOpacity = Math.max(0, 1 - scrollProgress * 1.5);

  return (
    <section
      ref={sectionRef}
      id="problem"
      className="section-pinned bg-[#F6F7FA] z-20"
    >
      <div className="absolute inset-0 grid-background" />

      <div className="absolute inset-0 pointer-events-none">
        <div 
          className={`accent-dot absolute left-[44vw] top-[22vh] w-3 h-3 transition-all duration-500 ${
            isInView ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
          }`}
          style={{ transitionDelay: '400ms' }}
        />
        <div 
          className={`accent-dot absolute right-[10vw] top-[74vh] w-2.5 h-2.5 transition-all duration-500 ${
            isInView ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
          }`}
          style={{ transitionDelay: '500ms' }}
        />
      </div>

      <div
        className={`absolute left-[18vw] top-1/2 -translate-y-1/2 w-[56vmin] h-[56vmin] ring-outline flex items-center justify-center transition-all duration-1000 ${
          isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-[60vw]'
        }`}
        style={{ 
          transform: `translateY(-50%) translateX(${exitX}px)`,
          opacity: exitOpacity,
        }}
      >
        <div
          className={`w-[48vmin] h-[48vmin] rounded-full overflow-hidden transition-all duration-1000 ${
            isInView ? 'opacity-100 scale-100' : 'opacity-0 scale-85'
          }`}
          style={{ transitionDelay: '100ms' }}
        >
          <img
            src="/problem-photo.jpg"
            alt="Professional woman concerned about payment"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div
        className={`absolute left-[58vw] top-1/2 -translate-y-1/2 w-[34vw] max-w-xl transition-all duration-1000 ${
          isInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-[40vw]'
        }`}
        style={{ 
          transitionDelay: '200ms',
          transform: `translateY(-50%) translateX(${scrollProgress * 100}px)`,
          opacity: exitOpacity,
        }}
      >
        <h2 className="text-[clamp(28px,3.2vw,48px)] font-semibold leading-tight mb-6">
          <span className="inline-block">Buyers</span>{' '}
          <span className="inline-block">worry</span>{' '}
          <span className="inline-block">about</span>{' '}
          <span className="inline-block">delivery.</span>
          <br />
          <span className="inline-block">Sellers</span>{' '}
          <span className="inline-block">worry</span>{' '}
          <span className="inline-block">about</span>{' '}
          <span className="inline-block">payment.</span>
        </h2>

        <p className="text-lg text-[#6B7280] mb-8">
          Traditional deals rely on trust. That's where most disputes begin.
        </p>

        <button
          onClick={scrollToSolution}
          className="flex items-center gap-2 text-sm font-medium text-[#0B0C10] hover:text-[#C8FF2E] transition-colors group"
        >
          See the solution
          <ArrowRight
            size={16}
            className="group-hover:translate-x-1 transition-transform"
          />
        </button>
      </div>
    </section>
  );
}
