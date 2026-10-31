import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, Mail, Phone, MapPin, Shield } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="bg-[#1A1F2C] text-[#FAF8F5] border-t border-[#C5A880]/30 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-white/10">
          {/* Column 1: Brand & Heritage */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#FAF8F5] text-[#1A1F2C] flex items-center justify-center border border-[#C5A880]">
                <Crown className="w-5 h-5 text-[#C5A880]" />
              </div>
              <span className="font-serif text-xl tracking-wider text-[#FAF8F5] font-semibold">
                THE ROYAL KNOT
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Curators of bespoke palace destination weddings across Jaipur and Udaipur. Orchestrating multi-crore royal nuptials with timeless grace and immaculate precision.
            </p>
            <div className="pt-2 text-xs text-[#C5A880] tracking-wider uppercase">
              Registered in Rajasthan, India
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-serif text-base tracking-wider text-[#C5A880] mb-4 uppercase">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs text-[#CBD5E1]">
              <li>
                <Link to="/" className="hover:text-[#C5A880] transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#C5A880] transition-colors">About Our Agency</Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-[#C5A880] transition-colors">Palace Wedding Services</Link>
              </li>
              <li>
                <Link to="/portfolio" className="hover:text-[#C5A880] transition-colors">Real Royal Weddings</Link>
              </li>
              <li>
                <Link to="/plan-your-wedding" className="hover:text-[#C5A880] transition-colors">Plan Your Wedding</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#C5A880] transition-colors">Concierge Desk</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Palaces & Venues */}
          <div>
            <h4 className="font-serif text-base tracking-wider text-[#C5A880] mb-4 uppercase">
              Signature Palaces
            </h4>
            <ul className="space-y-2.5 text-xs text-[#CBD5E1]">
              <li>Taj Lake Palace, Udaipur</li>
              <li>Jagmandir Island Palace, Udaipur</li>
              <li>Rambagh Palace, Jaipur</li>
              <li>The Leela Palace, Udaipur</li>
              <li>Samode Palace & Haveli, Jaipur</li>
              <li>Umaid Bhawan Palace, Jodhpur</li>
            </ul>
          </div>

          {/* Column 4: Private Concierge */}
          <div className="space-y-4">
            <h4 className="font-serif text-base tracking-wider text-[#C5A880] mb-4 uppercase">
              Private Concierge
            </h4>
            <div className="space-y-2.5 text-xs text-[#CBD5E1]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                <span>Civil Lines, Jaipur &amp; Haridas Ji Ki Magri, Udaipur, Rajasthan</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#C5A880] shrink-0" />
                <span>+91 98290 11001 &bull; +91 98290 11002</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#C5A880] shrink-0" />
                <span>concierge@royalknot.in</span>
              </div>
            </div>
            <div className="pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-xs text-[#94A3B8] hover:text-[#FAF8F5] transition-colors bg-white/5 px-3 py-1.5 rounded border border-white/10"
              >
                <Shield className="w-3.5 h-3.5 text-[#C5A880]" />
                Employee Management System
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#64748B] gap-4">
          <p>&copy; {new Date().getFullYear()} The Royal Knot Luxury Weddings Private Limited. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Discretion &amp; NDA Assured</span>
            <span>Jaipur &bull; Udaipur &bull; Jodhpur</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
