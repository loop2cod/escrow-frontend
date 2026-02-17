'use client'
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
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

  const navItems = [
    { label: 'Features', id: 'features' },
    { label: 'Templates', id: 'templates' },
    { label: 'How it works', id: 'how-it-works' },
    { label: 'Pricing', id: 'pricing' },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? 'bg-[#F6F7FA]/90 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
          }`}
      >
        <div className="w-full px-6 lg:px-12 py-4 flex items-center justify-between">
          {/* Logo */}
          <div onClick={() => {
            router.push('/');
          }} className="cursor-pointer flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#0B0C10] flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-[#C8FF2E]" />
            </div>
            <span className="font-semibold text-lg tracking-tight">SecureEscrow</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-sm font-medium text-[#6B7280] hover:text-[#0B0C10] transition-colors"
                aria-label={`Scroll to ${item.label} section`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <button onClick={handleGetStarted} className="btn-primary text-sm py-3 px-6" aria-label="Get Started">
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#F6F7FA] flex flex-col items-center justify-center gap-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="text-2xl font-medium text-[#0B0C10] hover:text-[#C8FF2E] transition-colors"
            >
              {item.label}
            </button>
          ))}
          <button onClick={handleGetStarted} className="btn-primary mt-4">Get Started</button>
        </div>
      )}
    </>
  );
}
