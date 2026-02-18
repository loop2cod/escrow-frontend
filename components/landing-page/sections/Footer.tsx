import { Mail, Twitter, Linkedin, Github } from 'lucide-react';

const footerLinks = {
  Product: ['Features', 'Templates', 'Pricing'],
  Company: ['About', 'Case Studies', 'Contact'],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Terms of Service', href: '/terms-of-service' },
    { label: 'Cookie Policy', href: '/cookie-policy' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#0B0C10] text-white py-16 z-[100]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-[#C8FF2E]" />
              </div>
              <span className="font-semibold text-lg tracking-tight">
                StableEscrow
              </span>
            </div>
            <p className="text-gray-400 mb-6 max-w-sm">
              Blockchain-powered escrow for freelancers, teams, and businesses.
              Secure transactions, verified payments, zero trust issues.
            </p>

            {/* Newsletter */}
            <div className="flex gap-2">
              <div className="relative flex-1 max-w-xs">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
                />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full bg-white/10 border border-white/20 rounded-full py-2.5 pl-10 pr-4 text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#C8FF2E]"
                />
              </div>
              <button className="btn-primary py-2.5 px-5 text-sm">
                Subscribe
              </button>
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link: any) => (
                  <li key={link.label || link}>
                    <a
                      href={typeof link === 'string' ? '#' : link.href}
                      className="text-sm text-gray-300 hover:text-[#C8FF2E] transition-colors"
                    >
                      {typeof link === 'string' ? link : link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            © 2026 StableEscrow. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#C8FF2E] hover:text-[#0B0C10] transition-all"
              aria-label="Twitter"
            >
              <Twitter size={18} />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#C8FF2E] hover:text-[#0B0C10] transition-all"
              aria-label="LinkedIn"
            >
              <Linkedin size={18} />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#C8FF2E] hover:text-[#0B0C10] transition-all"
              aria-label="GitHub"
            >
              <Github size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
