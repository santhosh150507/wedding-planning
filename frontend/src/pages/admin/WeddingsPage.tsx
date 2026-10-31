import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Calendar, 
  MapPin, 
  Users, 
  IndianRupee, 
  Lock, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react';
import { weddingApi } from '../../api/endpoints';
import { WeddingSummary } from '../../types';

export const WeddingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [weddings, setWeddings] = useState<WeddingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchWeddings = async () => {
    try {
      setLoading(true);
      const data = await weddingApi.list({
        search: search || undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined
      });
      setWeddings(data);
    } catch (err) {
      console.error('Failed to load weddings directory', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeddings();
  }, [search, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
      case 'In Progress':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">● {status}</span>;
      case 'Completed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">✓ Completed</span>;
      case 'Planning':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">⏳ Planning</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#EAE3D9]">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif text-[#1A1F2C] flex items-center gap-2">
            <span>Weddings Directory</span>
            <span className="text-sm font-sans font-normal px-2.5 py-1 bg-[#F4EFEA] text-[#C5A880] rounded border border-[#EAE3D9]">
              Season 2026
            </span>
          </h1>
          <p className="text-sm text-[#6B7280] mt-1 font-sans">
            Centralized workspace management for active, planning and completed royal palatial celebrations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/enquiries')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1A1F2C] text-[#FAF8F5] rounded text-sm font-medium hover:bg-[#2C3444] transition-all shadow-sm"
          >
            <Plus className="w-4 h-4 text-[#C5A880]" />
            <span>Convert New Enquiry</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-lg border border-[#EAE3D9] shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search by couple title (e.g. Aditi & Kabir)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#FAF8F5] border border-[#EAE3D9] rounded text-sm text-[#1A1F2C] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-[#C5A880] hidden md:block" />
          {['All', 'Active', 'In Progress', 'Planning', 'Completed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-all whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-[#1A1F2C] text-[#FAF8F5] shadow-xs'
                  : 'bg-[#F4EFEA] text-[#1A1F2C] hover:bg-[#EAE3D9]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Wedding Cards */}
      {loading ? (
        <div className="p-12 text-center text-sm text-[#6B7280]">
          Loading active royal weddings...
        </div>
      ) : weddings.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-lg border border-[#EAE3D9]">
          <Sparkles className="w-8 h-8 text-[#C5A880] mx-auto mb-2" />
          <p className="text-base font-serif text-[#1A1F2C]">No weddings matched your search criteria.</p>
          <p className="text-sm text-[#6B7280] mt-1">Convert enquiries from the CRM or reset your active filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {weddings.map((w) => (
            <div
              key={w.id}
              onClick={() => navigate(`/admin/weddings/${w.id}`)}
              className="bg-white rounded-lg border border-[#EAE3D9] shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-5 space-y-4">
                {/* Top meta */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono text-[#C5A880] font-semibold">{w.wedding_number}</span>
                    <h2 className="text-xl font-serif text-[#1A1F2C] group-hover:text-[#9A7B4F] transition-colors">
                      {w.couple_title}
                    </h2>
                  </div>
                  {getStatusBadge(w.status)}
                </div>

                {/* Details */}
                <div className="space-y-2 text-xs text-[#4B5563]">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>{new Date(w.wedding_date_start).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span className="truncate">{w.destination} – {w.venue_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>{w.expected_guest_count} Expected Guests • {w.package_type === 'full_service' ? 'Full-Service' : 'Day-Of'}</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium text-[#1A1F2C]">
                    <IndianRupee className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>Budget: ₹{w.agreed_budget.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-xs text-[#6B7280] mb-1">
                    <span>Task Milestones</span>
                    <span className="font-semibold text-[#1A1F2C]">{w.progress_percentage}%</span>
                  </div>
                  <div className="w-full bg-[#F4EFEA] h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#C5A880] h-full rounded-full transition-all duration-500" 
                      style={{ width: `${w.progress_percentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom footer */}
              <div className="px-5 py-3 bg-[#FAF8F5] border-t border-[#EAE3D9] flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  {w.is_contract_signed ? (
                    <span className="text-emerald-700 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Agreement Signed
                    </span>
                  ) : (
                    <span className="text-amber-700 flex items-center gap-1 font-medium">
                      <Lock className="w-3.5 h-3.5" /> Vendors Locked (Pending Sign)
                    </span>
                  )}
                </div>
                <span className="text-[#C5A880] font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Workspace <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
