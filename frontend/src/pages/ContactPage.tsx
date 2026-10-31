import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, MessageSquare, ArrowRight, CheckCircle2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-[#FAF8F5]">
      {/* Header */}
      <section className="bg-gradient-to-b from-[#F4EFEA] to-[#FAF8F5] py-20 px-4 text-center border-b border-[#EAE3D9]">
        <div className="max-w-3xl mx-auto space-y-4">
          <span className="text-xs uppercase tracking-[0.25em] text-[#C5A880] font-semibold">
            Private Concierge &bull; Jaipur &bull; Udaipur
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl text-[#1A1F2C]">
            Connect With Our Directors
          </h1>
          <p className="text-base text-[#64748B] font-light leading-relaxed">
            We welcome couples and families to visit our private studios in Rajasthan or arrange an exploratory private video conference.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Studio Offices */}
          <div className="space-y-10">
            <div>
              <h2 className="font-serif text-3xl text-[#1A1F2C] mb-6">Our Rajasthan Studios</h2>
              <p className="text-xs text-[#64748B] font-light leading-relaxed mb-8">
                Operating directly within Rajasthan allows our team immediate access to palace general managers, district administration for heritage permissions, and local artisan guilds.
              </p>
            </div>

            <div className="space-y-6">
              {/* Jaipur Studio */}
              <div className="bg-white p-6 rounded-2xl border border-[#EAE3D9] space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-xl text-[#1A1F2C] font-semibold">Jaipur Heritage Atelier</h3>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#C5A880] bg-[#FAF8F5] px-2.5 py-1 rounded border border-[#EAE3D9]">
                    HQ Studio
                  </span>
                </div>
                <div className="space-y-2 text-xs text-[#475569]">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                    <span>The Royal Knot Estate, Jacob Road, Civil Lines, Jaipur 302006, Rajasthan</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-[#C5A880] shrink-0" />
                    <span>+91 98290 11001 / +91 98290 11002</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-[#C5A880] shrink-0" />
                    <span>Mon - Sat: 10:00 AM - 7:00 PM (By Private Appointment)</span>
                  </div>
                </div>
              </div>

              {/* Udaipur Studio */}
              <div className="bg-white p-6 rounded-2xl border border-[#EAE3D9] space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-xl text-[#1A1F2C] font-semibold">Udaipur Lakeside Concierge</h3>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#C5A880] bg-[#FAF8F5] px-2.5 py-1 rounded border border-[#EAE3D9]">
                    Lake Pichola Studio
                  </span>
                </div>
                <div className="space-y-2 text-xs text-[#475569]">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                    <span>Suite 4, Haridas Ji Ki Magri, Lake Pichola Road, Udaipur 313001, Rajasthan</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-[#C5A880] shrink-0" />
                    <span>+91 98290 11003</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-[#C5A880] shrink-0" />
                    <span>udaipur@royalknot.in</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#F4EFEA] border border-[#EAE3D9] space-y-3">
              <div className="font-semibold text-xs text-[#1A1F2C] uppercase tracking-wider">
                Full Wedding Requirements?
              </div>
              <p className="text-xs text-[#64748B]">
                For couples who know their target dates, guest count, and palace preference, we recommend our comprehensive Enquiry Form for immediate structured proposal generation.
              </p>
              <div>
                <Link
                  to="/plan-your-wedding"
                  className="inline-flex items-center gap-1.5 text-xs text-[#9D7B50] font-bold hover:text-[#1A1F2C] transition-colors"
                >
                  <span>Go to Plan Your Wedding Form</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Message Form */}
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-[#EAE3D9] shadow-sm">
            <h3 className="font-serif text-2xl text-[#1A1F2C] mb-2">Send a Private Inquiry</h3>
            <p className="text-xs text-[#64748B] mb-8 font-light">
              Our wedding director responds within 24 business hours. Discretion guaranteed.
            </p>

            {submitted ? (
              <div className="p-8 text-center space-y-4 bg-[#FAF8F5] rounded-2xl border border-[#C5A880]/40">
                <CheckCircle2 className="w-12 h-12 text-[#C5A880] mx-auto" />
                <h4 className="font-serif text-2xl text-[#1A1F2C]">Message Received</h4>
                <p className="text-xs text-[#64748B]">
                  Thank you for reaching out to The Royal Knot. A dedicated concierge will connect with you via email or phone shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#1A1F2C]">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Radhika Sharma"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#EAE3D9] text-xs focus:outline-none focus:border-[#C5A880] bg-[#FAF8F5]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#1A1F2C]">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98200 12345"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#EAE3D9] text-xs focus:outline-none focus:border-[#C5A880] bg-[#FAF8F5]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#1A1F2C]">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#EAE3D9] text-xs focus:outline-none focus:border-[#C5A880] bg-[#FAF8F5]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#1A1F2C]">Preferred Destination</label>
                    <select className="w-full px-4 py-2.5 rounded-xl border border-[#EAE3D9] text-xs focus:outline-none focus:border-[#C5A880] bg-[#FAF8F5]">
                      <option value="Jaipur">Jaipur (Forts &amp; Palaces)</option>
                      <option value="Udaipur">Udaipur (Lakes &amp; Islands)</option>
                      <option value="Jodhpur">Jodhpur (Imperial Durbar)</option>
                      <option value="Undecided">Undecided / Open to Suggestion</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#1A1F2C]">Approx. Wedding Date</label>
                    <input
                      type="date"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#EAE3D9] text-xs focus:outline-none focus:border-[#C5A880] bg-[#FAF8F5]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#1A1F2C]">Your Note or Specific Query</label>
                  <textarea
                    rows={4}
                    placeholder="Tell us about your wedding aspirations, expected guest scale, or specific palace preferences..."
                    className="w-full px-4 py-2.5 rounded-xl border border-[#EAE3D9] text-xs focus:outline-none focus:border-[#C5A880] bg-[#FAF8F5]"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full bg-[#1A1F2C] text-[#FAF8F5] text-xs uppercase tracking-widest font-semibold hover:bg-[#2C3444] transition-colors shadow-xs"
                >
                  Send Inquiry to Concierge
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
