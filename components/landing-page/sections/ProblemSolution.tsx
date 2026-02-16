'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';

// Lazy load Threads component to reduce initial bundle and only load when needed
const Threads = dynamic(() => import('@/components/Threads'), {
  ssr: false,
  loading: () => null
});

export default function ProblemSolution() {
  const problemRef = useRef<HTMLDivElement>(null);
  const solutionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [problemInView, setProblemInView] = useState(false);
  const [solutionInView, setSolutionInView] = useState(false);
  const [threadsInView, setThreadsInView] = useState(false);
  const [problemProgress, setProblemProgress] = useState(0);
  const [solutionProgress, setSolutionProgress] = useState(0);
  const tickingRef = useRef(false);
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // IntersectionObserver for sections
    const problemObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setProblemInView(true);
        }
      },
      { threshold: 0.3 }
    );

    const solutionObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSolutionInView(true);
        }
      },
      { threshold: 0.3 }
    );

    // Observer for Threads background - only render when visible
    const threadsObserver = new IntersectionObserver(
      ([entry]) => {
        setThreadsInView(entry.isIntersecting);
      },
      { threshold: 0, rootMargin: '200px' }
    );

    if (problemRef.current) {
      problemObserver.observe(problemRef.current);
    }

    if (solutionRef.current) {
      solutionObserver.observe(solutionRef.current);
    }

    if (containerRef.current) {
      threadsObserver.observe(containerRef.current);
    }

    // Throttled scroll handler using requestAnimationFrame
    const handleScroll = () => {
      if (tickingRef.current) return;
      
      tickingRef.current = true;
      requestAnimationFrame(() => {
        if (problemRef.current) {
          const rect = problemRef.current.getBoundingClientRect();
          const scrollPast = -rect.top;
          const sectionHeight = rect.height;
          const progress = Math.max(0, Math.min(1, scrollPast / (sectionHeight * 0.4)));
          setProblemProgress(progress);
        }

        if (solutionRef.current) {
          const rect = solutionRef.current.getBoundingClientRect();
          const sectionHeight = rect.height;
          const scrollPast = -rect.top;
          const progress = Math.max(0, Math.min(1, scrollPast / (sectionHeight * 0.4)));
          setSolutionProgress(progress);
        }
        tickingRef.current = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      problemObserver.disconnect();
      solutionObserver.disconnect();
      threadsObserver.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToSolution = () => {
    if (solutionRef.current) {
      solutionRef.current.scrollIntoView({ behavior: 'smooth' });
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

  const problemExitOpacity = Math.max(0, 1 - problemProgress * 1.5);
  const solutionExitOpacity = Math.max(0, 1 - solutionProgress * 1.5);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Threads Visual Background - spans entire area without taking space */}
      {threadsInView && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 opacity-90">
            <Threads
              color={[0.04, 0.05, 0.06]}
              amplitude={1.2}
              distance={0.5}
              enableMouseInteraction={false}
            />
          </div>
          {/* Vertical line decoration */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-px h-full bg-gradient-to-b from-transparent via-[#C8FF2E]/30 to-transparent" />
          </div>
        </div>
      )}

      {/* Problem Section */}
      <section
        ref={problemRef}
        id="problem"
        className="relative w-full bg-[#F6F7FA]/95 z-20 py-16 md:py-24 lg:py-32 flex items-center justify-end px-6 md:px-12 lg:px-[8vw]"
      >
        <div
          className={`w-full md:w-[50vw] lg:w-[34vw] max-w-xl transition-all duration-1000 ${
            problemInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-[40vw]'
          }`}
          style={{ 
            transitionDelay: '200ms',
            transform: problemInView ? `translateX(${problemProgress * 100}px)` : 'translateX(40vw)',
            opacity: problemExitOpacity,
          }}
        >
          <h2 className="text-[clamp(24px,2.8vw,40px)] font-semibold leading-tight mb-4">
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

          <p className="text-base text-[#6B7280] mb-6">
            Traditional deals rely on trust. That&apos;s where most disputes begin.
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

      {/* Solution Section */}
      <section
        ref={solutionRef}
        id="solution"
        className="relative w-full bg-[#F6F7FA]/95 z-30 py-16 md:py-24 lg:py-32 flex items-center px-6 md:px-12 lg:px-[8vw]"
      >
        {/* Accent Dots */}
        <div className="absolute inset-0 pointer-events-none">
          <div 
            className={`accent-dot absolute left-[10vw] top-[20%] transition-all duration-500 ${
              solutionInView ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
            }`}
            style={{ transitionDelay: '400ms' }}
          />
          <div 
            className={`accent-dot absolute left-[40vw] bottom-[20%] w-2.5 h-2.5 transition-all duration-500 ${
              solutionInView ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
            }`}
            style={{ transitionDelay: '500ms' }}
          />
        </div>

        {/* Left Text Block */}
        <div
          className={`w-full md:w-[50vw] lg:w-[36vw] max-w-xl transition-all duration-1000 ${
            solutionInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-[40vw]'
          }`}
          style={{ 
            transitionDelay: '200ms',
            transform: solutionInView ? `translateX(${-solutionProgress * 100}px)` : 'translateX(-40vw)',
            opacity: solutionExitOpacity,
          }}
        >
          <h2 className="text-[clamp(24px,2.8vw,40px)] font-semibold leading-tight mb-4">
            Verified identities.
            <br />
            Locked funds.
            <br />
            Release on delivery.
          </h2>

          <p className="text-base text-[#6B7280] mb-6">
            SecureEscrow holds payment in a smart contract. Funds release only
            when both parties confirm.
          </p>

          <button onClick={handleGetStarted} className="btn-primary flex items-center gap-2">
            Create an Agreement
            <ArrowRight size={18} />
          </button>
        </div>
      </section>
    </div>
  );
}
