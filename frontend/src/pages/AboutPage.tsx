import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, Shield, Award, Users, ArrowRight, Heart } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="bg-[#FAF8F5]">
      {/* Header */}
      <section className="bg-gradient-to-b from-[#F4EFEA] to-[#FAF8F5] py-20 px-4 text-center border-b border-[#EAE3D9]">
        <div className="max-w-3xl mx-auto space-y-4">
          <span className="text-xs uppercase tracking-[0.25em] text-[#C5A880] font-semibold">
            Our Heritage &amp; Ethos
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl text-[#1A1F2C]">
            Custodians of Rajasthani Elegance
          </h1>
          <p className="text-base text-[#64748B] font-light leading-relaxed">
            Founded with the conviction that destination weddings should transcend events and become enduring historical moments.
          </p>
        </div>
      </section>

      {/* Main Narrative */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs uppercase tracking-widest text-[#C5A880] font-semibold">The Beginning</span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#1A1F2C]">
              Rooted in the Royal Courts of Jaipur &amp; Udaipur
            </h2>
            <p className="text-sm text-[#64748B] font-light leading-relaxed">
              The Royal Knot was established by a collective of palace heritage preservationists and luxury event architects. Operating from our studios in Civil Lines (Jaipur) and Lake Pichola (Udaipur), we manage the intimate circle of noble families, corporate titans, and international luminaries who choose Rajasthan as the canvas for their sacred unions.
            </p>
            <p className="text-sm text-[#64748B] font-light leading-relaxed">
              We operate not as a commercial wedding bazaar, but as an exclusive private agency. By capping our seasonal engagements to just 25 weddings per calendar year, every couple receives direct oversight from our founding partners and senior planners.
            </p>
          </div>
          <div className="bg-[#1A1F2C] rounded-2xl p-8 text-[#FAF8F5] space-y-6 border border-[#C5A880]/30 shadow-md">
            <div className="font-serif text-2xl text-[#C5A880]">Our Founding Credo</div>
            <p className="text-xs text-[#CBD5E1] font-light leading-relaxed italic">
              "To honor the solemnity of Vedic rituals while elevating the sensory celebration to match the peerless opulence of Rajasthan’s golden palaces."
            </p>
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#94A3B8]">
              <span>Jaipur Headquarters</span>
              <span>Udaipur Concierge Studio</span>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="pt-12 border-t border-[#EAE3D9]">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs uppercase tracking-[0.25em] text-[#C5A880] font-semibold">Our Principles</span>
            <h3 className="font-serif text-3xl text-[#1A1F2C]">The Tenets of Royal Service</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-[#EAE3D9] space-y-3 shadow-xs">
              <Shield className="w-8 h-8 text-[#C5A880]" />
              <h4 className="font-serif text-xl text-[#1A1F2C]">Absolute Discretion</h4>
              <p className="text-xs text-[#64748B] font-light leading-relaxed">
                We implement ironclad Non-Disclosure Agreements for high-profile families, ensuring family sanctity, security, and private celebrations without media leaks.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#EAE3D9] space-y-3 shadow-xs">
              <Award className="w-8 h-8 text-[#C5A880]" />
              <h4 className="font-serif text-xl text-[#1A1F2C]">Line-by-Line Transparency</h4>
              <p className="text-xs text-[#64748B] font-light leading-relaxed">
                We believe trust is forged through financial honesty. Our clients review normalized vendor RFQ quotations without hidden markups or kickbacks.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#EAE3D9] space-y-3 shadow-xs">
              <Heart className="w-8 h-8 text-[#C5A880]" />
              <h4 className="font-serif text-xl text-[#1A1F2C]">Artisanal Preservation</h4>
              <p className="text-xs text-[#64748B] font-light leading-relaxed">
                Every wedding sustains local Rajasthani craft: hand block printers of Sanganer, brass beaters of Jaipur, and traditional royal Shehnai maestros.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-[#F4EFEA] rounded-2xl p-10 text-center border border-[#EAE3D9] space-y-4">
          <h3 className="font-serif text-3xl text-[#1A1F2C]">Experience True Concierge Planning</h3>
          <p className="text-xs text-[#64748B] max-w-lg mx-auto">
            Speak directly with our senior wedding directors in Jaipur or Udaipur.
          </p>
          <div>
            <Link
              to="/plan-your-wedding"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1A1F2C] text-[#FAF8F5] text-xs uppercase tracking-widest font-semibold hover:bg-[#2C3444] transition-colors"
            >
              <span>Schedule Consultation</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C5A880]" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
