'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, AlertTriangle, User, Loader2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
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
        className="relative w-full bg-[#F6F7FA]/95 z-20 py-16 md:py-24 lg:py-32 px-6 md:px-12 lg:px-[8vw] overflow-hidden"
      >
        <div className="w-full h-full flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">

          {/* Left Visual - Desktop Only */}
          <div className="hidden lg:block w-[45%] h-[400px] relative pointer-events-none select-none">
            <ProblemVisual inView={problemInView} />
          </div>

          <div
            className={`w-full lg:w-[45%] max-w-xl transition-all duration-1000 ${problemInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-[40px]'
              }`}
            style={{
              transitionDelay: '200ms',
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
            className={`accent-dot absolute left-[10vw] top-[20%] transition-all duration-500 ${solutionInView ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
              }`}
            style={{ transitionDelay: '400ms' }}
          />
          <div
            className={`accent-dot absolute left-[40vw] bottom-[20%] w-2.5 h-2.5 transition-all duration-500 ${solutionInView ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
              }`}
            style={{ transitionDelay: '500ms' }}
          />
        </div>

        {/* Left Text Block */}
        <div
          className={`w-full md:w-[50vw] lg:w-[36vw] max-w-xl transition-all duration-1000 ${solutionInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-[40vw]'
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

function ProblemVisual({ inView }: { inView: boolean }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Background Glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 bg-linear-to-tr from-red-500/5 via-transparent to-orange-500/5 rounded-full blur-3xl opacity-50"
      />

      {/* Main Card - Neumorphic Style */}
      <motion.div
        initial={{ y: 20, opacity: 0, rotate: -2 }}
        animate={inView ? { y: 0, opacity: 1, rotate: 0 } : { y: 20, opacity: 0, rotate: -2 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative w-[320px] bg-[#F6F7FA] rounded-2xl overflow-hidden z-10"
        style={{
          boxShadow: '12px 12px 24px #d1d9e6, -12px -12px 24px #ffffff'
        }}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F6F7FA] flex items-center justify-center relative"
              style={{ boxShadow: 'inset 4px 4px 8px #d1d9e6, inset -4px -4px 8px #ffffff' }}>
              <User size={18} className="text-gray-400" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#F6F7FA] rounded-full flex items-center justify-center border-2 border-[#F6F7FA]">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-800">Seller</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Online</span>
            </div>
          </div>
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
          </div>
        </div>

        {/* Chat Body */}
        <div className="p-6 space-y-5 bg-[#F6F7FA] min-h-[160px]">
          {/* Message 1 */}
          <motion.div
            initial={{ x: -10, opacity: 0 }}
            animate={inView ? { x: 0, opacity: 1 } : { x: -10, opacity: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-end gap-2"
          >
            <div className="bg-[#F6F7FA] text-gray-600 px-5 py-3 rounded-2xl rounded-bl-none text-xs max-w-[85%]"
              style={{ boxShadow: '5px 5px 10px #d1d9e6, -5px -5px 10px #ffffff' }}>
              Is the item still available?
            </div>
          </motion.div>

          {/* Message 2 */}
          <motion.div
            initial={{ x: 10, opacity: 0 }}
            animate={inView ? { x: 0, opacity: 1 } : { x: 10, opacity: 0 }}
            transition={{ delay: 1 }}
            className="flex items-end gap-2 justify-end"
          >
            <div className="bg-[#F6F7FA] text-blue-600 px-5 py-3 rounded-2xl rounded-br-none text-xs max-w-[85%] font-medium"
              style={{ boxShadow: 'inset 3px 3px 6px #d1d9e6, inset -3px -3px 6px #ffffff' }}>
              Yes! Ready to ship. 📦
            </div>
          </motion.div>

          {/* Message 3 - Payment Sent */}
          <motion.div
            initial={{ x: 10, opacity: 0 }}
            animate={inView ? { x: 0, opacity: 1 } : { x: 10, opacity: 0 }}
            transition={{ delay: 1.8 }}
            className="flex items-end gap-2 justify-end"
          >
            <div className="bg-[#F6F7FA] text-gray-700 px-5 py-3 rounded-2xl rounded-br-none text-xs max-w-[85%] flex items-center gap-2 border-l-4 border-blue-500"
              style={{ boxShadow: '5px 5px 10px #d1d9e6, -5px -5px 10px #ffffff' }}>
              <span>Payment sent! $450.00</span>
            </div>
          </motion.div>

          {/* Risk Alert Overlay */}
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={inView ? { height: 'auto', opacity: 1, marginTop: 16 } : { height: 0, opacity: 0, marginTop: 0 }}
            transition={{ delay: 3.5, duration: 0.5 }}
            className="w-full bg-[#F6F7FA] rounded-xl p-4 flex items-start gap-3 overflow-hidden"
            style={{ boxShadow: 'inset 4px 4px 8px #d1d9e6, inset -4px -4px 8px #ffffff' }}
          >
            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0 shadow-sm">
              <AlertTriangle size={16} className="text-red-500" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-red-600">Seller not responding</span>
              <span className="text-[10px] text-gray-500 leading-relaxed">Usually replies in 1 hour. It&apos;s been 2 days since payment.</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Floating Elements - Anxiety Indicators - Neumorphic */}
      <motion.div
        animate={{ y: [-5, 5, -5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-6 right-6 z-0"
      >
        <div className="bg-[#F6F7FA] p-3 rounded-xl flex items-center gap-2 rotate-6 opacity-80 scale-90"
          style={{ boxShadow: '8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff' }}>
          <XCircle size={18} className="text-red-400" />
          <span className="text-xs font-medium text-gray-500">Failed</span>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [5, -5, 5] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-16 left-4 z-20"
      >
        <div className="bg-[#F6F7FA] p-3 rounded-xl flex items-center gap-3 -rotate-3"
          style={{ boxShadow: '8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff' }}>
          <div className="w-8 h-8 rounded-full bg-[#F6F7FA] flex items-center justify-center relative"
            style={{ boxShadow: 'inset 2px 2px 4px #d1d9e6, inset -2px -2px 4px #ffffff' }}>
            <Loader2 size={16} className="text-gray-400 animate-spin" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-700">Tracking Status</span>
            <span className="text-[10px] text-gray-400">Pending update...</span>
          </div>
        </div>
      </motion.div>

      {/* Connection Lines (Abstract) */}
      <svg className="absolute inset-0 pointer-events-none opacity-20" width="100%" height="100%">
        <motion.path
          d="M 100 300 Q 200 200 300 300 T 500 300"
          fill="none"
          stroke="red"
          strokeWidth="3"
          strokeDasharray="8,8"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={inView ? { pathLength: 1, opacity: 0.3 } : { pathLength: 0, opacity: 0 }}
          transition={{ duration: 2, delay: 0.5 }}
          style={{ filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.1))' }}
        />
      </svg>
    </div>
  );
}
