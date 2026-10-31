import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, Sparkles, Utensils, Music, Truck, Camera, ArrowRight, CheckCircle2 } from 'lucide-react';

export const ServicesPage: React.FC = () => {
  const services = [
    {
      icon: Crown,
      title: 'Full-Service Palace Wedding Architecture',
      desc: 'Our flagship turnkey engagement. We curate every single detail across 12-18 months: venue booking, budget architecture, 25+ structured task deliverables, custom wedding stationary, VIP logistics, and post-event financial settlement.',
      features: [
        'Complete Palace & Heritage Venue Contracting',
        'End-to-End Vendor RFQ Sourcing & Line-by-Line Vetting',
        'Guest RSVP Desk & Airport Charters for 400+ Guests',
        'Live Operations Control Room & Dedicated On-Site Shadow Staff',
        'Full Financial Reconciliation & Final Settlement Checklist'
      ]
    },
    {
      icon: Sparkles,
      title: 'Partial & Day-of Royal Orchestration',
      desc: 'Crafted for families who have finalized their venue and core creative vision, but require professional agency execution 60-90 days prior to the wedding and minute-by-minute live command on the wedding day.',
      features: [
        'Contract Audit & Vendor Alignment 60 Days Out',
        'Minute-by-Minute Master Schedule Engineering',
        'Vendor Arrival Tracking with Live Late Detection',
        'Baraat & Ceremony Protocol Management',
        'Emergency Issue Management & Live Real-Time Dashboard'
      ]
    },
    {
      icon: Sparkles,
      title: 'Palace Scenography & Floral Architecture',
      desc: 'Transforming ancient royal courtyards into breathtaking sensory dreamscapes using fragrant Indian flora, bespoke structural mandaps, mirror mosaics, and hand-embroidered royal canopies.',
      features: [
        '3D Spatial Renders & Heritage Courtyard Layouts',
        'Ethically Sourced Dutch Roses, Tuberoses & Marigolds',
        'Traditional Brass Candelabras & Crystal Chandeliers',
        'Mandap Engineering on Water Bodies & Courtyards'
      ]
    },
    {
      icon: Utensils,
      title: 'Royal Khansama & Michelin Gastronomy',
      desc: 'Food is the soul of royal hospitality. We coordinate master caterers, royal Khansamas who served Rajasthan’s princely states, and global culinary artists.',
      features: [
        'Traditional Chappan Bhog & Royal Marwari Feasts',
        'Modern Progressive Indian Live Cooking Pavilions',
        'Jain & Pure-Vegetarian Gourmet Master Menus',
        'Artisan Cocktail Bars & Heritage Sommelier Pairings'
      ]
    },
    {
      icon: Truck,
      title: 'Heritage Transportation & Royal Processions',
      desc: 'From vintage Rolls Royces for the groom’s regal entrance to chartered boat convoys across Lake Pichola and dedicated airport vehicle fleets for 400+ arriving guests.',
      features: [
        'Vintage Car Fleets (Rolls Royce, Cadillac, Buick)',
        'Private Luxury Shikaras & Motorized Lake Convoys',
        'VIP Airport Meet-and-Greet Motorcades',
        'Elephant & Royal Guard Processions (Where Permitted)'
      ]
    },
    {
      icon: Camera,
      title: 'Candid Cinematography & Royal Imagery',
      desc: 'We match you with India’s foremost documentary wedding photographers and cinematographers to capture every candid glance and imperial moment in museum-grade clarity.',
      features: [
        'Cinematic Drone Direction over Forts & Palaces',
        'Pre-Wedding Heritage Concept Shoots',
        'Same-Day Sangeet Teaser Reel Edits',
        'Handcrafted Leather Heirloom Albums'
      ]
    }
  ];

  return (
    <div className="bg-[#FAF8F5]">
      {/* Header */}
      <section className="bg-gradient-to-b from-[#F4EFEA] to-[#FAF8F5] py-20 px-4 text-center border-b border-[#EAE3D9]">
        <div className="max-w-3xl mx-auto space-y-4">
          <span className="text-xs uppercase tracking-[0.25em] text-[#C5A880] font-semibold">
            Bespoke Agency Capabilities
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl text-[#1A1F2C]">
            Our Wedding Planning Services
          </h1>
          <p className="text-base text-[#64748B] font-light leading-relaxed">
            From comprehensive palace acquisitions to meticulous day-of execution, explore our tailored packages designed for high-scale destination weddings.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {services.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="bg-white p-8 rounded-2xl border border-[#EAE3D9] hover:border-[#C5A880] shadow-xs hover:shadow-md transition-all space-y-6 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FAF8F5] border border-[#EAE3D9] text-[#C5A880] flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-2xl text-[#1A1F2C]">{s.title}</h3>
                  <p className="text-xs text-[#64748B] font-light leading-relaxed">{s.desc}</p>
                  
                  <div className="pt-2 border-t border-[#EAE3D9] space-y-2">
                    <span className="text-[11px] font-semibold tracking-wider text-[#C5A880] uppercase block">
                      Key Deliverables:
                    </span>
                    <ul className="space-y-1.5 text-xs text-[#475569]">
                      {s.features.map((f, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#C5A880] shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4">
                  <Link
                    to="/plan-your-wedding"
                    className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#1A1F2C] font-semibold hover:text-[#C5A880] transition-colors"
                  >
                    <span>Inquire For This Service</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#C5A880]" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Package Comparison Strip */}
      <section className="bg-[#1A1F2C] text-[#FAF8F5] py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="font-serif text-3xl sm:text-4xl text-[#FAF8F5]">
            Full-Service vs. Partial / Day-of Management
          </h2>
          <p className="text-xs text-[#CBD5E1] font-light max-w-xl mx-auto leading-relaxed">
            Whether you desire our full 12-month turnkey architectural management or precision coordination in the final stretch, we configure our team to your timeline and budget scale.
          </p>
          <div className="pt-2">
            <Link
              to="/plan-your-wedding"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#C5A880] text-[#1A1F2C] text-xs uppercase tracking-widest font-bold hover:bg-[#D4AF37] transition-all"
            >
              <span>Request Custom Proposal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
