import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, Sparkles, MapPin, Users, HeartHandshake, ArrowRight, ShieldCheck, Award, Star } from 'lucide-react';

export const HomePage: React.FC = () => {
  const palaces = [
    {
      name: 'Taj Lake Palace & Jagmandir',
      location: 'Lake Pichola, Udaipur',
      desc: 'Floating 18th-century marble palace surrounded by the tranquil waters of Pichola. Ideal for celestial lakeside pheras.',
      tag: 'Water Palace Pheras',
      image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Rambagh Palace & Jaigarh',
      location: 'Jaipur, Rajasthan',
      desc: 'The Jewel of Jaipur. Former residence of the Maharaja with 47 acres of Mughal gardens, marble jalis and grand royal arches.',
      tag: 'Imperial Royal Durbar',
      image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'The Leela Palace Udaipur',
      location: 'Lake Pichola, Udaipur',
      desc: 'Modern royalty embracing heritage Mewari artistry, mirrored ballrooms, and serene lakeside amphitheaters for Sangeet extravaganzas.',
      tag: 'Lakeside Grandeur',
      image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1000&q=80'
    }
  ];

  const stats = [
    { label: 'Palace Weddings Curated', value: '180+' },
    { label: 'Average Guest Capacity', value: '450+' },
    { label: 'Curated Artisan Vendors', value: '120+' },
    { label: 'Client Satisfaction', value: '100%' },
  ];

  const pillars = [
    {
      icon: Crown,
      title: 'Heritage Palace Exclusivity',
      desc: 'Privileged access and relationships with Rajasthan’s royal families and top palace heritage hospitality brands.'
    },
    {
      icon: Sparkles,
      title: 'Scenography & Floral Grandeur',
      desc: 'Master botanical installations, custom brass candelabras, velvet shamianas, and artisanal palace lighting.'
    },
    {
      icon: HeartHandshake,
      title: 'Royal Khansama Gastronomy',
      desc: 'Authentic Marwari, Mewari and Awadhi feast curation paired with contemporary international culinary masters.'
    },
    {
      icon: ShieldCheck,
      title: 'Minute-by-Minute Orchestration',
      desc: 'Uncompromising precision on-site with live logistics operations, vendor tracking, and discreet VIP hospitality.'
    }
  ];

  const testimonials = [
    {
      quote: "The Royal Knot transformed our wedding at Taj Lake Palace into poetry. From our chartered boats to the 50,000 Dutch roses Mandap, every second was divine.",
      author: "Aditi & Kabir Mathur",
      location: "Udaipur &bull; Multi-Crore Celebration"
    },
    {
      quote: "Managing 600 international guests across Rambagh Palace felt effortless thanks to their internal precision. The team handled everything with the poise of royalty.",
      author: "Priyanka & Aman Goenka",
      location: "Jaipur &bull; Grand Royal Durbar"
    }
  ];

  return (
    <div className="bg-[#FAF8F5]">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center text-center px-4 overflow-hidden bg-gradient-to-b from-[#F4EFEA] via-[#FAF8F5] to-[#FAF8F5]">
        {/* Subtle decorative heritage arches */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#C5A880_1px,transparent_1px)] [background-size:24px_24px]"></div>
        
        <div className="relative max-w-4xl mx-auto py-24 space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF8F5] border border-[#C5A880]/60 text-[#9D7B50] text-xs uppercase tracking-[0.25em] font-semibold shadow-xs">
            <Crown className="w-3.5 h-3.5 text-[#C5A880]" />
            Luxury Destination Weddings &bull; Jaipur &bull; Udaipur
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-normal text-[#1A1F2C] tracking-tight leading-[1.1]">
            Where Royal Heritage <br />
            <span className="italic font-normal text-[#C5A880]">Meets Eternal Nuptials</span>
          </h1>

          <p className="text-base sm:text-lg text-[#64748B] max-w-2xl mx-auto font-light leading-relaxed">
            We curate bespoke, high-scale destination weddings across the iconic heritage palaces of Rajasthan. Orchestrating multi-crore celebrations for visionary couples worldwide.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/plan-your-wedding"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-[#1A1F2C] text-[#FAF8F5] text-xs uppercase tracking-widest font-semibold border border-[#C5A880] hover:bg-[#2C3444] hover:shadow-lg transition-all group"
            >
              <span>Begin Your Royal Journey</span>
              <ArrowRight className="w-4 h-4 text-[#C5A880] group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/portfolio"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-full bg-[#FAF8F5] text-[#1A1F2C] text-xs uppercase tracking-widest font-semibold border border-[#EAE3D9] hover:bg-[#F4EFEA] transition-colors"
            >
              View Royal Portfolio
            </Link>
          </div>

          {/* Quick credibility tags */}
          <div className="pt-12 flex flex-wrap items-center justify-center gap-8 text-xs text-[#94A3B8] tracking-wider uppercase">
            <span className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-[#C5A880] fill-[#C5A880]" /> 25 Weddings Per Season Max
            </span>
            <span className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#C5A880]" /> 400+ Guest Scale Specialists
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880]" /> Strict Privacy &amp; Discretion
            </span>
          </div>
        </div>
      </section>

      {/* Stats Ribbon */}
      <section className="bg-[#1A1F2C] text-[#FAF8F5] py-12 border-y border-[#C5A880]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
            {stats.map((s, idx) => (
              <div key={idx} className="pt-4 md:pt-0">
                <div className="font-serif text-3xl sm:text-4xl text-[#C5A880] font-semibold mb-1">
                  {s.value}
                </div>
                <div className="text-xs text-[#CBD5E1] tracking-widest uppercase font-medium">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs uppercase tracking-[0.25em] text-[#C5A880] font-semibold">
            Our Architectural Standards
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#1A1F2C]">
            The Pillars of The Royal Knot
          </h2>
          <p className="text-sm text-[#64748B] font-light leading-relaxed">
            A luxury wedding is an intricate tapestry of emotion, grand aesthetics, and military-precision logistics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="bg-white p-8 rounded-2xl border border-[#EAE3D9] hover:border-[#C5A880] hover:shadow-md transition-all space-y-4 group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#FAF8F5] border border-[#EAE3D9] text-[#C5A880] flex items-center justify-center group-hover:bg-[#1A1F2C] group-hover:text-[#C5A880] transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl text-[#1A1F2C] font-medium">{p.title}</h3>
                <p className="text-xs text-[#64748B] leading-relaxed font-light">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Signature Palaces Showcase */}
      <section className="bg-[#F4EFEA] py-24 px-4 sm:px-6 lg:px-8 border-y border-[#EAE3D9]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="space-y-3 max-w-xl">
              <span className="text-xs uppercase tracking-[0.25em] text-[#C5A880] font-semibold">
                Legendary Venues
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#1A1F2C]">
                Signature Rajasthani Sanctuaries
              </h2>
              <p className="text-sm text-[#64748B] font-light">
                We maintain direct access and privileged operational coordination with the world’s most magnificent palaces.
              </p>
            </div>
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#1A1F2C] font-semibold hover:text-[#C5A880] transition-colors"
            >
              <span>Explore All Venues</span>
              <ArrowRight className="w-4 h-4 text-[#C5A880]" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {palaces.map((p, idx) => (
              <div key={idx} className="bg-white rounded-2xl overflow-hidden border border-[#EAE3D9] shadow-xs group hover:shadow-lg transition-all">
                <div className="relative h-64 overflow-hidden bg-[#1A1F2C]">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                  />
                  <div className="absolute top-4 left-4 bg-[#1A1F2C]/80 backdrop-blur-xs text-[#C5A880] text-[10px] tracking-widest uppercase font-semibold px-3 py-1 rounded-full border border-[#C5A880]/40">
                    {p.tag}
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs text-[#C5A880] font-medium">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{p.location}</span>
                  </div>
                  <h3 className="font-serif text-2xl text-[#1A1F2C]">{p.name}</h3>
                  <p className="text-xs text-[#64748B] font-light leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <span className="text-xs uppercase tracking-[0.25em] text-[#C5A880] font-semibold block mb-4">
          Client Reverence
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-[#1A1F2C] mb-12">
          Echoes of Royal Celebrations
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          {testimonials.map((t, idx) => (
            <div key={idx} className="bg-white p-8 rounded-2xl border border-[#EAE3D9] space-y-6 relative shadow-xs">
              <div className="font-serif text-5xl text-[#C5A880]/30 select-none absolute top-4 right-6">&ldquo;</div>
              <p className="text-sm text-[#1A1F2C] font-light italic leading-relaxed relative z-10">
                "{t.quote}"
              </p>
              <div className="pt-4 border-t border-[#EAE3D9]">
                <div className="font-serif text-lg text-[#1A1F2C] font-semibold">{t.author}</div>
                <div className="text-xs text-[#94A3B8]" dangerouslySetInnerHTML={{ __html: t.location }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="bg-[#1A1F2C] text-[#FAF8F5] py-20 px-4 text-center border-t border-[#C5A880]/30">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="w-12 h-12 rounded-full bg-[#FAF8F5]/10 border border-[#C5A880] text-[#C5A880] flex items-center justify-center mx-auto">
            <Crown className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl text-[#FAF8F5] font-normal leading-tight">
            Ready to Plan Your Rajasthan <br />
            <span className="italic text-[#C5A880]">Palace Masterpiece?</span>
          </h2>
          <p className="text-sm text-[#CBD5E1] font-light max-w-xl mx-auto leading-relaxed">
            Our discreet wedding concierge limits bookings to preserve bespoke attention for each couple. Submit your requirements to receive our royal portfolio and consultation.
          </p>
          <div className="pt-4">
            <Link
              to="/plan-your-wedding"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#C5A880] text-[#1A1F2C] text-xs uppercase tracking-widest font-bold hover:bg-[#D4AF37] shadow-lg transition-all"
            >
              <span>Submit Wedding Enquiry</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
