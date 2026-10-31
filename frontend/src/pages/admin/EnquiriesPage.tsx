import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  Plus,
  LayoutGrid,
  List,
  AlertTriangle,
  Clock,
  MapPin,
  Calendar,
  IndianRupee,
  ArrowRight,
  Phone,
  Mail,
  CheckCircle2,
  X,
  MessageSquare
} from 'lucide-react';
import { enquiryApi, authApi } from '../../api/endpoints';
import { Enquiry, EnquiryStatus, EnquirySource, User } from '../../types';

export const EnquiriesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [planners, setPlanners] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [destinationFilter, setDestinationFilter] = useState('All');
  const [onlyInactive, setOnlyInactive] = useState(searchParams.get('filter') === 'inactive');

  // Manual Add Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);
  const [manualForm, setManualForm] = useState({
    bride_name: '',
    groom_name: '',
    email: '',
    phone: '',
    preferred_date: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
    destination: 'Jaipur',
    venue_preference: '',
    guest_count: 400,
    function_count: 4,
    functions_requested: ['Mehendi', 'Sangeet', 'Wedding', 'Reception'],
    theme_preference: '',
    budget_max: 20000000,
    package_type: 'full_service',
    source: 'Call' as EnquirySource,
    status: 'New' as EnquiryStatus,
    assigned_planner_id: '',
    additional_notes: '',
  });

  const pipelineStages: EnquiryStatus[] = [
    'New',
    'Contacted',
    'Consultation Scheduled',
    'Proposal Sent',
    'Negotiation',
    'Confirmed',
    'Lost',
  ];

  const fetchEnquiries = async () => {
    try {
      setIsLoading(true);
      const data = await enquiryApi.list({
        search: searchQuery || undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        destination: destinationFilter !== 'All' ? destinationFilter : undefined,
        only_inactive: onlyInactive,
      });
      setEnquiries(data);
    } catch (err) {
      console.error('Failed to load enquiries', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [searchQuery, statusFilter, destinationFilter, onlyInactive]);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const team = await authApi.getPlanners();
        setPlanners(team);
      } catch (err) {
        console.error('Failed to load planners', err);
      }
    };
    fetchTeam();
  }, []);

  const handleStatusChange = async (enquiryId: string, newStatus: EnquiryStatus) => {
    try {
      await enquiryApi.update(enquiryId, { status: newStatus });
      setEnquiries((prev) =>
        prev.map((e) => (e.id === enquiryId ? { ...e, status: newStatus } : e))
      );
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleAssignPlanner = async (enquiryId: string, plannerId: string) => {
    try {
      const selected = planners.find((p) => p.id === plannerId);
      await enquiryApi.update(enquiryId, { assigned_planner_id: plannerId });
      setEnquiries((prev) =>
        prev.map((e) =>
          e.id === enquiryId
            ? { ...e, assigned_planner_id: plannerId, assigned_planner_name: selected?.full_name }
            : e
        )
      );
    } catch (err) {
      alert('Failed to assign planner');
    }
  };

  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingManual(true);
    try {
      const payload = {
        ...manualForm,
        preferred_date: new Date(manualForm.preferred_date).toISOString(),
        assigned_planner_id: manualForm.assigned_planner_id || undefined,
      };
      await enquiryApi.createInternal(payload);
      setAddModalOpen(false);
      fetchEnquiries();
      setManualForm({
        bride_name: '',
        groom_name: '',
        email: '',
        phone: '',
        preferred_date: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
        destination: 'Jaipur',
        venue_preference: '',
        guest_count: 400,
        function_count: 4,
        functions_requested: ['Mehendi', 'Sangeet', 'Wedding', 'Reception'],
        theme_preference: '',
        budget_max: 20000000,
        package_type: 'full_service',
        source: 'Call',
        status: 'New',
        assigned_planner_id: '',
        additional_notes: '',
      });
    } catch (err) {
      alert('Failed to create enquiry');
    } finally {
      setIsSubmittingManual(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(amount / 100000).toFixed(2)} L`;
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-[#1A1F2C]">Enquiry Management (CRM)</h1>
          <p className="text-xs text-[#64748B] mt-0.5 font-light">
            Capture, nurture and convert luxury wedding leads across all acquisition channels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-white rounded-xl border border-[#EAE3D9] p-1 shadow-2xs">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 font-medium transition-colors ${
                viewMode === 'table' ? 'bg-[#1A1F2C] text-[#FAF8F5]' : 'text-[#64748B] hover:text-[#1A1F2C]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 font-medium transition-colors ${
                viewMode === 'kanban' ? 'bg-[#1A1F2C] text-[#FAF8F5]' : 'text-[#64748B] hover:text-[#1A1F2C]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pipeline</span>
            </button>
          </div>

          {/* Add Manual Enquiry Button */}
          <button
            onClick={() => setAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1A1F2C] text-[#FAF8F5] text-xs font-semibold hover:bg-[#2C3444] transition-colors shadow-2xs"
          >
            <Plus className="w-4 h-4 text-[#C5A880]" />
            <span>Add Enquiry</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-[#EAE3D9] shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search bar */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search couple, ID, email, phone..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#EAE3D9] text-xs focus:outline-none focus:border-[#C5A880] bg-[#FAF8F5]"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#EAE3D9] text-xs focus:outline-none focus:border-[#C5A880] bg-[#FAF8F5]"
          >
            <option value="All">All Statuses</option>
            {pipelineStages.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Destination Filter */}
          <select
            value={destinationFilter}
            onChange={(e) => setDestinationFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#EAE3D9] text-xs focus:outline-none focus:border-[#C5A880] bg-[#FAF8F5]"
          >
            <option value="All">All Destinations</option>
            <option value="Jaipur">Jaipur</option>
            <option value="Udaipur">Udaipur</option>
            <option value="Jodhpur">Jodhpur</option>
          </select>
        </div>

        {/* Inactivity Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOnlyInactive(!onlyInactive)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              onlyInactive
                ? 'bg-red-50 border-red-300 text-red-700'
                : 'bg-white border-[#EAE3D9] text-[#64748B] hover:bg-[#FAF8F5]'
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${onlyInactive ? 'text-red-600' : 'text-gray-400'}`} />
            <span>3+ Days Inactive Flag</span>
          </button>
        </div>
      </div>

      {/* Main Content: Table or Kanban */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#C5A880] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-xs text-[#64748B]">Loading Enquiry Portfolio...</div>
        </div>
      ) : enquiries.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#EAE3D9] space-y-3">
          <Users className="w-10 h-10 text-[#C5A880] mx-auto opacity-70" />
          <h3 className="font-serif text-xl text-[#1A1F2C]">No Enquiries Found</h3>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto">
            No wedding leads match your current search criteria. Try clearing filters or submit a new enquiry.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="bg-white rounded-2xl border border-[#EAE3D9] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-[#64748B] font-semibold border-b border-[#EAE3D9] uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Ref Number &amp; Couple</th>
                  <th className="py-3.5 px-4">Destination &amp; Date</th>
                  <th className="py-3.5 px-4">Guest Scale</th>
                  <th className="py-3.5 px-4">Budget Max</th>
                  <th className="py-3.5 px-4">Source</th>
                  <th className="py-3.5 px-4">Assigned Planner</th>
                  <th className="py-3.5 px-4">Pipeline Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE3D9]">
                {enquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                    {/* Couple & Ref */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/enquiries/${enq.id}`}
                          className="font-semibold text-sm text-[#1A1F2C] hover:text-[#C5A880] transition-colors"
                        >
                          {enq.bride_name} &amp; {enq.groom_name}
                        </Link>
                        {enq.is_inactive_3_days && (
                          <span
                            title="No activity for 3+ days!"
                            className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 text-[9px] font-bold tracking-wider uppercase shrink-0"
                          >
                            Stale 3d+
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#94A3B8] font-mono">{enq.enquiry_number}</div>
                    </td>

                    {/* Destination & Target Date */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-[#1A1F2C]">
                        <MapPin className="w-3 h-3 text-[#C5A880]" />
                        <span>{enq.destination}</span>
                      </div>
                      <div className="text-[10px] text-[#64748B]">
                        {new Date(enq.preferred_date).toLocaleDateString('en-IN', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </td>

                    {/* Scale */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-[#1A1F2C]">{enq.guest_count} Guests</span>
                      <div className="text-[10px] text-[#64748B]">{enq.function_count} Functions</div>
                    </td>

                    {/* Budget */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-emerald-800">{formatCurrency(enq.budget_max)}</span>
                      <div className="text-[10px] text-[#94A3B8] capitalize">
                        {enq.package_type.replace('_', ' ')}
                      </div>
                    </td>

                    {/* Source */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#FAF8F5] text-[#1A1F2C] border border-[#EAE3D9]">
                        {enq.source}
                      </span>
                    </td>

                    {/* Assigned Planner */}
                    <td className="py-3.5 px-4">
                      <select
                        value={enq.assigned_planner_id || ''}
                        onChange={(e) => handleAssignPlanner(enq.id, e.target.value)}
                        className="px-2 py-1 rounded-lg border border-[#EAE3D9] text-xs bg-white text-[#1A1F2C] focus:outline-none focus:border-[#C5A880]"
                      >
                        <option value="">Unassigned</option>
                        {planners.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.full_name}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <select
                        value={enq.status}
                        onChange={(e) => handleStatusChange(enq.id, e.target.value as EnquiryStatus)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border cursor-pointer ${
                          enq.status === 'Confirmed'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : enq.status === 'Lost'
                            ? 'bg-gray-100 text-gray-600 border-gray-200'
                            : enq.status === 'New'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}
                      >
                        {pipelineStages.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/admin/enquiries/${enq.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#EAE3D9] text-[#1A1F2C] hover:bg-[#FAF8F5] transition-colors"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3 h-3 text-[#C5A880]" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Kanban Pipeline View */
        <div className="flex gap-4 overflow-x-auto pb-6">
          {pipelineStages.map((stage) => {
            const stageEnquiries = enquiries.filter((e) => e.status === stage);
            return (
              <div
                key={stage}
                className="w-72 shrink-0 bg-white rounded-2xl border border-[#EAE3D9] flex flex-col shadow-2xs"
              >
                {/* Column Header */}
                <div className="p-3.5 border-b border-[#EAE3D9] flex items-center justify-between bg-[#FAF8F5] rounded-t-2xl">
                  <div className="font-semibold text-xs text-[#1A1F2C] truncate">{stage}</div>
                  <span className="w-5 h-5 rounded-full bg-white border border-[#EAE3D9] text-[10px] font-bold text-[#64748B] flex items-center justify-center">
                    {stageEnquiries.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="p-3 flex-1 overflow-y-auto space-y-3 min-h-[400px]">
                  {stageEnquiries.map((enq) => (
                    <div
                      key={enq.id}
                      className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#EAE3D9] hover:border-[#C5A880] shadow-xs space-y-2.5 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to={`/admin/enquiries/${enq.id}`}
                          className="font-serif font-semibold text-sm text-[#1A1F2C] hover:text-[#C5A880] transition-colors block"
                        >
                          {enq.bride_name} &amp; {enq.groom_name}
                        </Link>
                        {enq.is_inactive_3_days && (
                          <span
                            title="3+ days no activity"
                            className="w-2 h-2 rounded-full bg-red-600 shrink-0 mt-1"
                          />
                        )}
                      </div>

                      <div className="text-[10px] text-[#94A3B8] font-mono">{enq.enquiry_number}</div>

                      <div className="text-[11px] text-[#475569] space-y-1">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-[#C5A880]" />
                          <span>
                            {enq.destination} &bull; {enq.guest_count} Guests
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <IndianRupee className="w-3 h-3 text-[#C5A880]" />
                          <span className="font-medium text-emerald-800">{formatCurrency(enq.budget_max)}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#EAE3D9] flex items-center justify-between text-[10px] text-[#64748B]">
                        <span>{enq.source}</span>
                        <select
                          value={enq.status}
                          onChange={(e) => handleStatusChange(enq.id, e.target.value as EnquiryStatus)}
                          className="text-[10px] px-1.5 py-0.5 rounded border border-[#EAE3D9] bg-white text-[#1A1F2C]"
                        >
                          {pipelineStages.map((s) => (
                            <option key={s} value={s}>
                              Move: {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Manual Add Enquiry Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-[#EAE3D9] shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-[#EAE3D9] pb-3">
              <div className="space-y-0.5">
                <h3 className="font-serif text-2xl text-[#1A1F2C]">Manual Enquiry Intake</h3>
                <p className="text-xs text-[#64748B]">Record offline leads from phone calls, WhatsApp, or meetings.</p>
              </div>
              <button
                onClick={() => setAddModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-[#FAF8F5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManual} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-medium text-[#1A1F2C]">Bride's Full Name *</label>
                  <input
                    type="text"
                    required
                    value={manualForm.bride_name}
                    onChange={(e) => setManualForm({ ...manualForm, bride_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#EAE3D9] bg-[#FAF8F5]"
                    placeholder="Bride's Name"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-[#1A1F2C]">Groom's Full Name *</label>
                  <input
                    type="text"
                    required
                    value={manualForm.groom_name}
                    onChange={(e) => setManualForm({ ...manualForm, groom_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#EAE3D9] bg-[#FAF8F5]"
                    placeholder="Groom's Name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-medium text-[#1A1F2C]">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={manualForm.email}
                    onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#EAE3D9] bg-[#FAF8F5]"
                    placeholder="name@gmail.com"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-[#1A1F2C]">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={manualForm.phone}
                    onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#EAE3D9] bg-[#FAF8F5]"
                    placeholder="+91 98290 12345"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-medium text-[#1A1F2C]">Intake Source *</label>
                  <select
                    value={manualForm.source}
                    onChange={(e) => setManualForm({ ...manualForm, source: e.target.value as EnquirySource })}
                    className="w-full px-3 py-2 rounded-xl border border-[#EAE3D9] bg-[#FAF8F5]"
                  >
                    <option value="Call">Direct Phone Call</option>
                    <option value="WhatsApp">WhatsApp Inquiry</option>
                    <option value="Instagram">Instagram Direct Message</option>
                    <option value="Referral">VIP Referral</option>
                    <option value="Website">Website</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-[#1A1F2C]">Destination *</label>
                  <select
                    value={manualForm.destination}
                    onChange={(e) => setManualForm({ ...manualForm, destination: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#EAE3D9] bg-[#FAF8F5]"
                  >
                    <option value="Jaipur">Jaipur</option>
                    <option value="Udaipur">Udaipur</option>
                    <option value="Jodhpur">Jodhpur</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-[#1A1F2C]">Preferred Date *</label>
                  <input
                    type="date"
                    required
                    value={manualForm.preferred_date}
                    onChange={(e) => setManualForm({ ...manualForm, preferred_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#EAE3D9] bg-[#FAF8F5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-medium text-[#1A1F2C]">Guest Count</label>
                  <input
                    type="number"
                    value={manualForm.guest_count}
                    onChange={(e) => setManualForm({ ...manualForm, guest_count: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#EAE3D9] bg-[#FAF8F5]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-[#1A1F2C]">Estimated Budget (INR)</label>
                  <input
                    type="number"
                    value={manualForm.budget_max}
                    onChange={(e) => setManualForm({ ...manualForm, budget_max: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#EAE3D9] bg-[#FAF8F5]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-[#1A1F2C]">Assign Lead Planner</label>
                <select
                  value={manualForm.assigned_planner_id}
                  onChange={(e) => setManualForm({ ...manualForm, assigned_planner_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#EAE3D9] bg-[#FAF8F5]"
                >
                  <option value="">Leave Unassigned</option>
                  {planners.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} ({p.role.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-[#1A1F2C]">Notes &amp; Requirements</label>
                <textarea
                  rows={3}
                  value={manualForm.additional_notes}
                  onChange={(e) => setManualForm({ ...manualForm, additional_notes: e.target.value })}
                  placeholder="Details discussed during phone call or initial conversation..."
                  className="w-full px-3 py-2 rounded-xl border border-[#EAE3D9] bg-[#FAF8F5]"
                />
              </div>

              <div className="pt-4 border-t border-[#EAE3D9] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#EAE3D9] text-[#64748B] hover:bg-[#FAF8F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingManual}
                  className="px-6 py-2 rounded-xl bg-[#1A1F2C] text-[#FAF8F5] font-semibold hover:bg-[#2C3444] transition-colors"
                >
                  {isSubmittingManual ? 'Saving Lead...' : 'Save Enquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
