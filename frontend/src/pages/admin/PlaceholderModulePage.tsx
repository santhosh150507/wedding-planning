import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

interface PlaceholderProps {
  title: string;
  phase: string;
  description: string;
  keyFeatures: string[];
}

export const PlaceholderModulePage: React.FC<PlaceholderProps> = ({
  title,
  phase,
  description,
  keyFeatures,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <span className="text-xs uppercase tracking-widest text-[#C5A880] font-semibold">
          Platform Architecture Roadmap
        </span>
        <span className="text-xs text-[#94A3B8]">&bull;</span>
        <span className="text-xs text-[#64748B]">{phase}</span>
      </div>

      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#EAE3D9] shadow-xs space-y-6 max-w-4xl">
        <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D9] text-[#C5A880] flex items-center justify-center">
          <Crown className="w-6 h-6" />
        </div>

        <div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1F2C]">{title}</h1>
          <p className="text-xs sm:text-sm text-[#64748B] font-light leading-relaxed mt-2">
            {description}
          </p>
        </div>

        <div className="p-6 bg-[#FAF8F5] rounded-2xl border border-[#EAE3D9] space-y-3">
          <div className="text-xs uppercase font-semibold text-[#1A1F2C] tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Scheduled Capabilities:</span>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-[#475569]">
            {keyFeatures.map((f, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#C5A880] shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-2 flex items-center gap-4">
          <Link
            to="/admin/dashboard"
            className="px-5 py-2.5 rounded-xl bg-[#1A1F2C] text-[#FAF8F5] text-xs font-semibold hover:bg-[#2C3444] transition-colors"
          >
            Back to Dashboard
          </Link>
          <Link
            to="/admin/enquiries"
            className="px-5 py-2.5 rounded-xl border border-[#EAE3D9] text-[#1A1F2C] text-xs font-semibold hover:bg-[#FAF8F5] transition-colors"
          >
            Manage CRM Enquiries
          </Link>
        </div>
      </div>
    </div>
  );
};
