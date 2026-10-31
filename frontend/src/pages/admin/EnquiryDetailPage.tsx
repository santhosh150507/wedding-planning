import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Users,
  MapPin,
  Calendar,
  IndianRupee,
  Phone,
  Mail,
  Clock,
  MessageSquare,
  Plus,
  ArrowLeft,
  Crown,
  FileText,
  HeartHandshake,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Send,
  Video
} from 'lucide-react';
import { enquiryApi, authApi } from '../../api/endpoints';
import { Enquiry, EnquiryNote, Consultation, EnquiryStatus, User } from '../../types';

export const EnquiryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [notes, setNotes] = useState<EnquiryNote[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [planners, setPlanners] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Note State
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Consultation Modal State
  const [consultModalOpen, setConsultModalOpen] = useState(false);
  const [consultDate, setConsultDate] = useState('');
  const [consultType, setConsultType] = useState('Video Consultation');
  const [consultNotes, setConsultNotes] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);

  const pipelineStages: EnquiryStatus[] = [
    'New',
    'Contacted',
    'Consultation Scheduled',
    'Proposal Sent',
    'Negotiation',
    'Confirmed',
    'Lost',
  ];

  const fetchDetails = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const [enqData, notesData, consultsData, teamData] = await Promise.all([
        enquiryApi.get(id),
        enquiryApi.getNotes(id),
        enquiryApi.getConsultations(id),
        authApi.getPlanners(),
      ]);
      setEnquiry(enqData);
      setNotes(notesData);
      setConsultations(consultsData);
      setPlanners(teamData);
    } catch (err) {
      console.error('Failed to load enquiry detail', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleStatusChange = async (newStatus: EnquiryStatus) => {
    if (!id || !enquiry) return;
    try {
      const updated = await enquiryApi.update(id, { status: newStatus });
      setEnquiry(updated);
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleAssignPlanner = async (plannerId: string) => {
    if (!id || !enquiry) return;
    try {
      const updated = await enquiryApi.update(id, { assigned_planner_id: plannerId });
      setEnquiry(updated);
    } catch (err) {
      alert('Failed to assign planner');
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newNoteContent.trim()) return;
    try {
      setIsAddingNote(true);
      const note = await enquiryApi.addNote(id, newNoteContent.trim());
      setNotes([note, ...notes]);
      setNewNoteContent('');
      // Refresh to update last activity date
      const refreshed = await enquiryApi.get(id);
      setEnquiry(refreshed);
    } catch (err) {
      alert('Failed to add note');
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleScheduleConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !consultDate) return;
    try {
      setIsScheduling(true);
      const res = await enquiryApi.scheduleConsultation(id, {
        scheduled_at: new Date(consultDate).toISOString(),
        meeting_type: consultType,
        notes: consultNotes,
      });
      setConsultations([res, ...consultations]);
      setConsultModalOpen(false);
      setConsultDate('');
      setConsultNotes('');
      // Refresh status
      const refreshed = await enquiryApi.get(id);
      setEnquiry(refreshed);
    } catch (err) {
      alert('Failed to schedule meeting');
    } finally {
      setIsScheduling(false);
    }
  };

  const handleDeleteEnquiry = async () => {
    if (!id || !enquiry) return;
    if (
      !window.confirm(
        `Are you sure you wish to archive enquiry ${enquiry.enquiry_number}? It will be soft-deleted and preserved for audit.`
      )
    ) {
      return;
    }
    try {
      await enquiryApi.delete(id);
      navigate('/admin/enquiries');
    } catch (err) {
      alert('Failed to archive enquiry');
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(amount / 100000).toFixed(2)} Lakhs`;
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-[#C5A880] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <div className="text-xs text-[#64748B]">Loading Royal Enquiry Profile...</div>
      </div>
    );
  }

  if (!enquiry) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-[#EAE3D9] text-center space-y-3">
        <div className="text-sm text-red-600 font-semibold">Enquiry not found</div>
        <Link to="/admin/enquiries" className="text-xs text-[#C5A880] hover:underline">
          &larr; Return to Enquiries
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button and quick status bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/enquiries"
            className="p-2 rounded-xl border border-[#EAE3D9] bg-white text-[#1A1F2C] hover:bg-[#FAF8F5] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-[#94A3B8] font-bold">{enquiry.enquiry_number}</span>
              <span className="text-xs text-[#94A3B8]">&bull;</span>
              <span className="text-xs text-[#64748B]">Source: {enquiry.source}</span>
              {enquiry.is_inactive_3_days && (
                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                  Stale (3d+ Inactive)
                </span>
              )}
            </div>
            <h1 className="font-serif text-3xl text-[#1A1F2C]">
              {enquiry.bride_name} &amp; {enquiry.groom_name}
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[#64748B]">Status:</span>
            <select
              value={enquiry.status}
              onChange={(e) => handleStatusChange(e.target.value as EnquiryStatus)}
              className="px-3 py-1.5 rounded-xl border border-[#EAE3D9] font-semibold bg-white text-[#1A1F2C] focus:outline-none focus:border-[#C5A880]"
            >
              {pipelineStages.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setConsultModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-[#EAE3D9] text-xs font-semibold text-[#1A1F2C] hover:bg-[#FAF8F5] transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Schedule Meeting</span>
          </button>

          <button
            onClick={handleDeleteEnquiry}
            className="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
            title="Archive / Soft Delete Enquiry"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid: Main Information (2 cols) & Sidebar (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Requirements & Consultation History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Core Wedding Requirements Card */}
          <div className="bg-white p-6 rounded-2xl border border-[#EAE3D9] shadow-2xs space-y-6">
            <h2 className="font-serif text-xl text-[#1A1F2C] border-b border-[#FAF8F5] pb-3">
              Wedding Specifications
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE3D9] space-y-1">
                <span className="text-[#94A3B8] font-semibold text-[10px] uppercase">Destination:</span>
                <div className="font-semibold text-sm text-[#1A1F2C] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>{enquiry.destination}</span>
                </div>
                {enquiry.venue_preference && (
                  <div className="text-[11px] text-[#64748B]">{enquiry.venue_preference}</div>
                )}
              </div>

              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE3D9] space-y-1">
                <span className="text-[#94A3B8] font-semibold text-[10px] uppercase">Target Date:</span>
                <div className="font-semibold text-sm text-[#1A1F2C]">
                  {new Date(enquiry.preferred_date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </div>
                {enquiry.alternative_date && (
                  <div className="text-[10px] text-[#64748B]">
                    Alt: {new Date(enquiry.alternative_date).toLocaleDateString()}
                  </div>
                )}
              </div>

              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE3D9] space-y-1">
                <span className="text-[#94A3B8] font-semibold text-[10px] uppercase">Budget Ceiling:</span>
                <div className="font-semibold text-sm text-emerald-800">
                  {formatCurrency(enquiry.budget_max)}
                </div>
                <div className="text-[10px] text-[#64748B] capitalize">
                  Package: {enquiry.package_type.replace('_', ' ')}
                </div>
              </div>
            </div>

            {/* Guest Scale & Function List */}
            <div className="space-y-2 text-xs">
              <span className="text-[#94A3B8] font-semibold uppercase text-[10px]">
                Functions Requested ({enquiry.guest_count} Expected Guests):
              </span>
              <div className="flex flex-wrap gap-2">
                {enquiry.functions_requested?.map((fn, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#EAE3D9] text-[#1A1F2C] font-medium"
                  >
                    {fn}
                  </span>
                ))}
              </div>
            </div>

            {/* Theme Vision */}
            {enquiry.theme_preference && (
              <div className="space-y-1 text-xs">
                <span className="text-[#94A3B8] font-semibold uppercase text-[10px]">Theme / Vision:</span>
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE3D9] text-[#1A1F2C] italic">
                  "{enquiry.theme_preference}"
                </div>
              </div>
            )}

            {/* Catering & Decor Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE3D9] space-y-1.5">
                <div className="font-semibold text-[#1A1F2C]">Catering Preferences:</div>
                <p className="text-[#64748B] font-light leading-relaxed">
                  {enquiry.catering_preferences || 'No specific catering restrictions noted.'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE3D9] space-y-1.5">
                <div className="font-semibold text-[#1A1F2C]">Decor &amp; Floral Vision:</div>
                <p className="text-[#64748B] font-light leading-relaxed">
                  {enquiry.decor_preferences || 'Standard palace royal decor package.'}
                </p>
              </div>
            </div>

            {/* Special Instructions */}
            {enquiry.additional_notes && (
              <div className="space-y-1 text-xs">
                <span className="text-[#94A3B8] font-semibold uppercase text-[10px]">Special Instructions:</span>
                <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200 text-[#1A1F2C]">
                  {enquiry.additional_notes}
                </div>
              </div>
            )}
          </div>

          {/* Scheduled Consultations Card */}
          <div className="bg-white p-6 rounded-2xl border border-[#EAE3D9] shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#FAF8F5] pb-3">
              <h2 className="font-serif text-xl text-[#1A1F2C]">Scheduled Consultations</h2>
              <button
                onClick={() => setConsultModalOpen(true)}
                className="text-xs text-[#C5A880] font-semibold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Schedule Meeting</span>
              </button>
            </div>

            {consultations.length === 0 ? (
              <div className="text-xs text-[#94A3B8] py-4 text-center">
                No consultations have been scheduled yet.
              </div>
            ) : (
              <div className="divide-y divide-[#FAF8F5] space-y-3">
                {consultations.map((c) => (
                  <div key={c.id} className="pt-3 flex items-start justify-between text-xs">
                    <div className="space-y-1">
                      <div className="font-semibold text-[#1A1F2C] flex items-center gap-2">
                        <Video className="w-3.5 h-3.5 text-[#C5A880]" />
                        <span>{c.meeting_type}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-medium">
                          {c.status}
                        </span>
                      </div>
                      <div className="text-[#64748B]">
                        {new Date(c.scheduled_at).toLocaleString('en-IN', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      {c.notes && <div className="text-[11px] text-[#475569] italic">"{c.notes}"</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Client Contact, Lead Planner & Internal Communication Notes */}
        <div className="space-y-6">
          {/* Client Contact Profile */}
          <div className="bg-white p-6 rounded-2xl border border-[#EAE3D9] shadow-2xs space-y-4">
            <h3 className="font-serif text-lg text-[#1A1F2C] border-b border-[#FAF8F5] pb-2">
              Client Contact Information
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2 text-[#475569]">
                <Mail className="w-4 h-4 text-[#C5A880] shrink-0" />
                <a href={`mailto:${enquiry.email}`} className="text-[#1A1F2C] hover:underline truncate">
                  {enquiry.email}
                </a>
              </div>
              <div className="flex items-center gap-2 text-[#475569]">
                <Phone className="w-4 h-4 text-[#C5A880] shrink-0" />
                <a href={`tel:${enquiry.phone}`} className="text-[#1A1F2C] hover:underline">
                  {enquiry.phone}
                </a>
              </div>
              <div className="pt-2 border-t border-[#FAF8F5] space-y-1">
                <span className="text-[#94A3B8] text-[10px] uppercase font-semibold">Assigned Wedding Planner:</span>
                <select
                  value={enquiry.assigned_planner_id || ''}
                  onChange={(e) => handleAssignPlanner(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#EAE3D9] text-xs bg-[#FAF8F5] text-[#1A1F2C]"
                >
                  <option value="">Unassigned</option>
                  {planners.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} ({p.role.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Quick Workflow Actions */}
          <div className="bg-white p-6 rounded-2xl border border-[#EAE3D9] shadow-2xs space-y-3">
            <h3 className="font-serif text-lg text-[#1A1F2C] border-b border-[#FAF8F5] pb-2">
              Lifecycle Transitions
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => alert('Proposal Module is enabled in Phase 2!')}
                className="w-full py-2.5 px-3 rounded-xl border border-[#EAE3D9] text-xs font-semibold text-[#1A1F2C] hover:bg-[#FAF8F5] flex items-center justify-between"
              >
                <span>Create Proposal</span>
                <FileText className="w-4 h-4 text-[#C5A880]" />
              </button>

              <button
                onClick={() => alert('Digital Contract Module is enabled in Phase 2!')}
                className="w-full py-2.5 px-3 rounded-xl border border-[#EAE3D9] text-xs font-semibold text-[#1A1F2C] hover:bg-[#FAF8F5] flex items-center justify-between"
              >
                <span>Generate Service Agreement</span>
                <Crown className="w-4 h-4 text-[#C5A880]" />
              </button>

              <button
                disabled={enquiry.status !== 'Confirmed'}
                onClick={() => alert('Convert to Wedding is enabled once booking deposit is recorded!')}
                className="w-full py-2.5 px-3 rounded-xl bg-[#1A1F2C] text-[#FAF8F5] text-xs font-semibold hover:bg-[#2C3444] flex items-center justify-between disabled:opacity-40"
              >
                <span>Convert to Confirmed Wedding</span>
                <HeartHandshake className="w-4 h-4 text-[#C5A880]" />
              </button>
            </div>
          </div>

          {/* Internal Communication Notes Timeline */}
          <div className="bg-white p-6 rounded-2xl border border-[#EAE3D9] shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#FAF8F5] pb-2">
              <h3 className="font-serif text-lg text-[#1A1F2C]">Internal Notes &amp; History</h3>
              <span className="text-[10px] text-[#94A3B8]">{notes.length} Notes</span>
            </div>

            {/* Add Note Form */}
            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea
                rows={2}
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Log call summary, client preference, or follow-up note..."
                className="w-full px-3 py-2 rounded-xl border border-[#EAE3D9] text-xs focus:outline-none focus:border-[#C5A880] bg-[#FAF8F5]"
              />
              <button
                type="submit"
                disabled={isAddingNote || !newNoteContent.trim()}
                className="w-full py-2 rounded-xl bg-[#1A1F2C] text-[#FAF8F5] text-xs font-semibold hover:bg-[#2C3444] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>{isAddingNote ? 'Saving...' : 'Add Internal Note'}</span>
              </button>
            </form>

            {/* Notes List */}
            <div className="space-y-3 max-h-72 overflow-y-auto divide-y divide-[#FAF8F5]">
              {notes.length === 0 ? (
                <div className="py-4 text-center text-xs text-[#94A3B8]">
                  No communication notes logged yet.
                </div>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="pt-3 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#1A1F2C] text-[11px]">{note.author_name}</span>
                      <span className="text-[10px] text-[#94A3B8]">
                        {new Date(note.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-[#475569] font-light leading-relaxed">{note.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Consultation Modal */}
      {consultModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#EAE3D9] shadow-2xl space-y-4">
            <h3 className="font-serif text-2xl text-[#1A1F2C]">Schedule Client Consultation</h3>
            <p className="text-xs text-[#64748B]">
              Scheduling a consultation updates status to "Consultation Scheduled" and sets automated reminders.
            </p>

            <form onSubmit={handleScheduleConsultation} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-[#1A1F2C]">Meeting Date &amp; Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={consultDate}
                  onChange={(e) => setConsultDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#EAE3D9] bg-[#FAF8F5]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-[#1A1F2C]">Meeting Format</label>
                <select
                  value={consultType}
                  onChange={(e) => setConsultType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#EAE3D9] bg-[#FAF8F5]"
                >
                  <option value="Zoom Video Consultation">Zoom Video Consultation</option>
                  <option value="In-Person at Jaipur Atelier">In-Person at Jaipur Atelier</option>
                  <option value="In-Person at Udaipur Studio">In-Person at Udaipur Studio</option>
                  <option value="Executive Phone Conference">Executive Phone Conference</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-[#1A1F2C]">Meeting Agenda &amp; Focus</label>
                <textarea
                  rows={3}
                  value={consultNotes}
                  onChange={(e) => setConsultNotes(e.target.value)}
                  placeholder="Review palace availability, budget parameters, and initial moodboards..."
                  className="w-full px-3 py-2 rounded-xl border border-[#EAE3D9] bg-[#FAF8F5]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setConsultModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#EAE3D9] text-[#64748B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isScheduling}
                  className="px-6 py-2 rounded-xl bg-[#1A1F2C] text-[#FAF8F5] font-semibold hover:bg-[#2C3444]"
                >
                  {isScheduling ? 'Scheduling...' : 'Confirm Meeting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
