import { useEffect, useRef, useState } from 'react';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    quote:
      'We closed a 3-month project with zero payment stress. Milestones kept everyone accountable.',
    author: 'Sarah Chen',
    role: 'Product Lead, Distributed Team',
  },
  {
    quote:
      'SecureEscrow transformed how we handle freelance contracts. No more chasing payments.',
    author: 'Marcus Rodriguez',
    role: 'CEO, TechStart Inc.',
  },
  {
    quote:
      'The smart contract escrow gives our clients confidence, and we get paid on time, every time.',
    author: 'Emily Watson',
    role: 'Founder, Design Studio',
  },
];

const stats = [
  { value: 12, suffix: 'M+', label: 'secured in escrow' },
  { value: 4800, suffix: '+', label: 'agreements created' },
  { value: 98, suffix: '%', label: 'resolved without arbitration' },
];

export default function SocialProof() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [animatedStats, setAnimatedStats] = useState<number[]>([0, 0, 0]);

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

  // Animate stats when in view
  useEffect(() => {
    if (!isInView) return;

    const duration = 1500;
    const steps = 60;
    const interval = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeProgress = 1 - Math.pow(1 - progress, 3); // ease-out cubic

      setAnimatedStats(stats.map((stat) => Math.floor(stat.value * easeProgress)));

      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedStats(stats.map((stat) => stat.value));
      }
    }, interval);

    return () => clearInterval(timer);
  }, [isInView]);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  return (
    <section
      ref={sectionRef}
      className="section-flowing bg-[#F6F7FA] z-[70] py-24"
    >
      {/* Grid Background */}
      <div className="absolute inset-0 grid-background" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Quote Section */}
          <div
            className={`transition-all duration-600 ${
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <Quote
              size={48}
              className="text-[#C8FF2E] mb-6"
              fill="#C8FF2E"
            />

            <blockquote className="text-[clamp(24px,2.5vw,36px)] font-semibold leading-tight mb-8 min-h-[120px]">
              "{testimonials[currentTestimonial].quote}"
            </blockquote>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">
                  {testimonials[currentTestimonial].author}
                </p>
                <p className="text-sm text-[#6B7280]">
                  {testimonials[currentTestimonial].role}
                </p>
              </div>

              {/* Navigation */}
              <div className="flex gap-2">
                <button
                  onClick={prevTestimonial}
                  className="w-10 h-10 rounded-full border border-[#e5e5e5] flex items-center justify-center hover:border-[#C8FF2E] hover:bg-[#C8FF2E] transition-all"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={nextTestimonial}
                  className="w-10 h-10 rounded-full border border-[#e5e5e5] flex items-center justify-center hover:border-[#C8FF2E] hover:bg-[#C8FF2E] transition-all"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Dots indicator */}
            <div className="flex gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentTestimonial
                      ? 'bg-[#C8FF2E] w-6'
                      : 'bg-[#e5e5e5]'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`bg-white rounded-xl p-6 border border-[#e5e5e5] transition-all duration-600 ${
                  isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: `${200 + index * 100}ms` }}
              >
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-[clamp(36px,4vw,56px)] font-bold leading-none">
                    ${animatedStats[index]}{stat.suffix}
                  </span>
                </div>
                <p className="text-[#6B7280]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
