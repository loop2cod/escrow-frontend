import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';

// Lazy load Orb component to reduce initial bundle
const Orb = dynamic(() => import('../../Orb'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-secondary" />
});

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const tickingRef = useRef(false);
  const isInViewRef = useRef(true);
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);

    // Throttled scroll handler using requestAnimationFrame
    const handleScroll = () => {
      if (!isInViewRef.current || tickingRef.current) return;
      
      tickingRef.current = true;
      requestAnimationFrame(() => {
        if (!sectionRef.current) {
          tickingRef.current = false;
          return;
        }
        const rect = sectionRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const progress = Math.max(0, Math.min(1, -rect.top / (windowHeight * 0.5)));
        setScrollProgress(progress);
        tickingRef.current = false;
      });
    };

    // IntersectionObserver to pause when off-screen
    const observer = new IntersectionObserver(
      ([entry]) => {
        isInViewRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          handleScroll();
        }
      },
      { threshold: 0, rootMargin: '100px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleGetStarted = () => {
    if (isAuthenticated && user) {
      // Redirect based on role
      if (user.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    } else {
      router.push('/login');
    }
  };

  const exitY = -scrollProgress * 100;

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-[60vh] md:min-h-screen bg-secondary z-10 flex items-center justify-center overflow-hidden"
    >
      {/* Orb Background - positioned absolutely and centered */}
      <div className="absolute inset-0 scale-125 md:scale-100">
        <Orb
          hoverIntensity={1.4}
          rotateOnHover
          hue={85}
          forceHoverState={false}
          backgroundColor="bg-secondary"
        />
      </div>

      {/* Decorative accent dots - hidden on mobile */}
      <div className="absolute inset-0 pointer-events-none hidden md:block z-5">
        <div
          className={`accent-dot absolute left-[10vw] md:left-[18vw] top-[15vh] md:top-[22vh] transition-all duration-500 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
          }`}
          style={{ transitionDelay: '600ms' }}
        />
        <div
          className={`accent-dot absolute right-[10vw] md:right-[16vw] top-[70vh] w-3 h-3 transition-all duration-500 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
          }`}
          style={{ transitionDelay: '700ms' }}
        />
      </div>

      {/* Content */}
      <div
        className="relative text-center px-5 sm:px-8 md:px-12 max-w-5xl w-full py-12 sm:py-20"
        style={{ transform: `translateY(${exitY}px)` }}
      >
        <h1
          className={`text-[clamp(28px,6.5vw,64px)] font-semibold leading-[1.2] tracking-tight mb-4 sm:mb-8 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
          style={{ transitionDelay: '400ms' }}
        >
          <span className="inline-block">Secure</span>{' '}
          <span className="inline-block">Transactions.</span>
          <br />{' '}
          <span className="inline-block">Verified</span>{' '}
          <span className="inline-block">Payments.</span>
          <br />{' '}
          <span className="inline-block">Zero</span>{' '}
          <span className="inline-block">Trust</span>{' '}
          <span className="inline-block">Issues.</span>
        </h1>

        <p
          className={`text-sm sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-10 px-2 sm:px-4 transition-all duration-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '500ms' }}
        >
          A licensed and regulated decentralized escrow platform that protects both buyers and sellers with automation, milestone-based payments, seamless crypto transactions, and insurance* protection on your funds.
        </p>

        <div
          className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-5 max-w-xs sm:max-w-none mx-auto transition-all duration-500`}
        >
          <button
            onClick={handleGetStarted}
            className="z-50 cursor-pointer btn-primary flex items-center justify-center gap-2 w-full sm:w-auto sm:min-w-[180px] text-sm sm:text-base"
          >
            Get Started
            <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
          <button
            onClick={() => scrollToSection('how-it-works')}
            className="z-50 cursor-pointer text-xs sm:text-base font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1 w-full sm:w-auto py-2.5 sm:py-0"
          >
            See how it works
          </button>
        </div>
      </div>
    </section>
  );
}
