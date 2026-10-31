import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, Calendar, ArrowRight, Sparkles } from 'lucide-react';

export const PortfolioPage: React.FC = () => {
  const [filterDestination, setFilterDestination] = useState<string>('All');

  const weddings = [
    {
      title: 'Aditi & Kabir Mathur',
      destination: 'Udaipur',
      venue: 'Jagmandir Island Palace & Fateh Garh',
      dates: 'November 2026',
      guestCount: 420,
      budgetTier: 'Multi-Crore Luxury',
      theme: 'Classic Ivory, Rose Gold & Lake Pichola Starlight',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80',
      functions: ['Poolside Haldi', 'Sangeet Under The Stars', 'Waterfront Pheras', 'Imperial Reception'],
      highlights: '50,000 Dutch roses Mandap floating on lake Pichola, 18 vintage Shikaras for guest transfers, 3 Michelin master chefs flown in for Marwari-Italian fusion.'
    },
    {
      title: 'Priyanka & Aman Goenka',
      destination: 'Jaipur',
      venue: 'Rambagh Palace & Jaigarh Fort',
      dates: 'December 2026',
      guestCount: 550,
      budgetTier: 'Multi-Crore Imperial',
      theme: 'Heritage Pink City, Zardozi Gold & Mughal Courts',
      image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=80',
      functions: ['Mehfil-e-Mehendi', 'Sufi Sangeet Night', 'Grand Royal Baraat', 'Royal Durbar Reception'],
      highlights: 'Bespoke elephant & camel procession, 100 royal Shehnai artists lining Rambagh driveway, fireworks display lighting up the Aravalli hills.'
    },
    {
      title: 'Ananya & Rohan Mehra',
      destination: 'Udaipur',
      venue: 'Taj Lake Palace & Zenana Mahal',
      dates: 'February 2026',
      guestCount: 380,
      budgetTier: 'Multi-Crore Bespoke',
      theme: 'White Marble Splendor & Antique Brass Candelabras',
      image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1000&q=80',
      functions: ['Carnival by the Pool', 'Royal Sangeet Gala', 'Twilight Vows', 'Palace Ballroom Dinner'],
      highlights: 'Floating island floral mandap, customized artisanal brass perfumes gifted to all guests, 100% locally sourced sustainable organic flowers.'
    },
    {
      title: 'Radhika & Abhishek Dalmia',
      destination: 'Jaipur',
      venue: 'Fairmont Jaipur & Samode Haveli',
      dates: 'January 2026',
      guestCount: 600,
      budgetTier: 'Multi-Crore Regal',
      theme: 'Grand Imperial Durbar & Crystal Chandeliers',
      image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1000&q=80',
      functions: ['Royal Haldi', 'Extravaganza Sangeet', 'Vedic Vivah', 'Grand Reception'],
      highlights: 'Glasshouse structure built over courtyard, 80ft velvet shamiana, private concert with renowned Sufi vocalists.'
    }
  ];

  const filtered = filterDestination === 'All' 
    ? weddings 
    : weddings.filter(w => w.destination === filterDestination);

  return (
    <div className="bg-[#FAF8F5]">
      {/* Header */}
      <section className="bg-gradient-to-b from-[#F4EFEA] to-[#FAF8F5] py-20 px-4 text-center border-b border-[#EAE3D9]">
        <div className="max-w-3xl mx-auto space-y-4">
          <span className="text-xs uppercase tracking-[0.25em] text-[#C5A880] font-semibold">
            Bespoke Nuptial Portfolio
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl text-[#1A1F2C]">
            Royal Wedding Experiences
          </h1>
          <p className="text-base text-[#64748B] font-light leading-relaxed">
            A glimpse into the celebrations curated by The Royal Knot across the palaces and forts of Rajasthan.
          </p>

          {/* Filter Pills */}
          <div className="pt-6 flex items-center justify-center gap-3">
            {['All', 'Jaipur', 'Udaipur'].map(city => (
              <button
                key={city}
                onClick={() => setFilterDestination(city)}
                className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wider transition-all ${
                  filterDestination === city
                    ? 'bg-[#1A1F2C] text-[#FAF8F5] shadow-xs'
                    : 'bg-white text-[#64748B] border border-[#EAE3D9] hover:bg-[#F4EFEA]'
                }`}
              >
                {city === 'All' ? 'All Destinations' : city}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {filtered.map((w, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl overflow-hidden border border-[#EAE3D9] shadow-xs hover:shadow-xl transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="relative h-72 overflow-hidden bg-[#1A1F2C]">
                  <img
                    src={w.image}
                    alt={w.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 right-4 bg-[#1A1F2C]/85 backdrop-blur-xs text-[#C5A880] text-[11px] font-semibold uppercase tracking-wider px-3.5 py-1 rounded-full border border-[#C5A880]/30">
                    {w.destination}
                  </div>
                </div>

                <div className="p-8 space-y-6">
                  <div>
                    <h3 className="font-serif text-3xl text-[#1A1F2C]">{w.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#64748B] mt-2 font-medium">
                      <span className="flex items-center gap-1.5 text-[#C5A880]">
                        <MapPin className="w-3.5 h-3.5" />
                        {w.venue}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        {w.guestCount} Guests
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-[#475569] bg-[#FAF8F5] p-4 rounded-xl border border-[#EAE3D9]">
                    <div className="font-semibold text-[#1A1F2C]">Theme &amp; Scenography:</div>
                    <div className="font-light italic">{w.theme}</div>
                    <div className="pt-2 font-semibold text-[#1A1F2C]">Curated Highlights:</div>
                    <div className="font-light text-[11px] leading-relaxed">{w.highlights}</div>
                  </div>

                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[#94A3B8] font-semibold block mb-2">
                      Key Functions Orchestrated:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {w.functions.map((fn, fIdx) => (
                        <span
                          key={fIdx}
                          className="text-[11px] px-2.5 py-1 rounded-md bg-[#F4EFEA] text-[#1A1F2C] font-medium"
                        >
                          {fn}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-8 pb-8 pt-2">
                <Link
                  to="/plan-your-wedding"
                  className="w-full text-center py-3 rounded-full bg-[#FAF8F5] hover:bg-[#1A1F2C] text-[#1A1F2C] hover:text-[#FAF8F5] border border-[#C5A880]/50 text-xs uppercase tracking-widest font-semibold transition-all block"
                >
                  Plan A Celebration Like This
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="bg-[#1A1F2C] text-[#FAF8F5] rounded-3xl p-10 md:p-14 text-center space-y-6 border border-[#C5A880]/30">
          <Sparkles className="w-8 h-8 text-[#C5A880] mx-auto" />
          <h2 className="font-serif text-3xl sm:text-4xl text-[#FAF8F5]">
            Crafting One-of-a-Kind Royal Moments
          </h2>
          <p className="text-xs text-[#CBD5E1] max-w-xl mx-auto leading-relaxed font-light">
            No two weddings at The Royal Knot are ever alike. Each floor plan, custom mandap, menu curation, and lighting design is custom rendered from scratch.
          </p>
          <div>
            <Link
              to="/plan-your-wedding"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#C5A880] text-[#1A1F2C] text-xs uppercase tracking-widest font-bold hover:bg-[#D4AF37] transition-all"
            >
              <span>Submit Your Vision</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
