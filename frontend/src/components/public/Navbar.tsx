import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Crown, Menu, X, ArrowRight, Shield } from 'lucide-react';

export const PublicNavbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About Us', path: '/about' },
    { label: 'Our Services', path: '/services' },
    { label: 'Portfolio', path: '/portfolio' },
    { label: 'Contact Us', path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#EAE3D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-[#1A1F2C] border border-[#C5A880] flex items-center justify-center text-[#C5A880] shadow-sm group-hover:border-[#D4AF37] transition-colors">
              <Crown className="w-5 h-5 text-[#C5A880]" />
            </div>
            <div>
              <span className="font-serif text-2xl tracking-wider text-[#1A1F2C] font-semibold block leading-tight">
                THE ROYAL KNOT
              </span>
              <span className="text-[10px] tracking-[0.25em] text-[#C5A880] font-medium uppercase block">
                Jaipur &bull; Udaipur
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm tracking-wide font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-[#C5A880] border-b-2 border-[#C5A880] pb-1'
                    : 'text-[#1A1F2C] hover:text-[#C5A880]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/login"
              className="text-xs uppercase tracking-widest text-[#64748B] hover:text-[#1A1F2C] flex items-center gap-1.5 font-medium px-3 py-1.5 transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-[#C5A880]" />
              Staff Login
            </Link>
            <Link
              to="/plan-your-wedding"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1A1F2C] text-[#FAF8F5] text-xs uppercase tracking-widest font-semibold border border-[#C5A880]/60 hover:bg-[#2C3444] hover:border-[#D4AF37] shadow-sm transition-all group"
            >
              <span>Plan Your Wedding</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C5A880] group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#1A1F2C] hover:bg-[#F4EFEA] transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#EAE3D9] bg-[#FAF8F5] px-4 pt-3 pb-6 space-y-4">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-md text-base font-medium ${
                  isActive(link.path)
                    ? 'bg-[#F4EFEA] text-[#C5A880]'
                    : 'text-[#1A1F2C] hover:bg-[#F4EFEA]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="pt-3 border-t border-[#EAE3D9] flex flex-col gap-3">
            <Link
              to="/plan-your-wedding"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 rounded-full bg-[#1A1F2C] text-[#FAF8F5] text-xs uppercase tracking-widest font-semibold border border-[#C5A880]"
            >
              Plan Your Wedding
            </Link>
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-full border border-[#EAE3D9] text-[#64748B] text-xs uppercase tracking-wider font-medium"
            >
              Internal Staff Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
