import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  IndianRupee,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  DollarSign,
  Plus,
  Download,
  Building,
  UserCheck,
  ShieldAlert,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { weddingApi, financeApi, guestApi, liveOpsApi } from '../../api/endpoints';
import { WeddingWorkspace, WeddingTask } from '../../types';

export const WeddingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState<WeddingWorkspace | null>(null);
  const [tasks, setTasks] = useState<WeddingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Modals / forms state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('Medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  const fetchWorkspaceData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [wsData, tasksData] = await Promise.all([
        weddingApi.getWorkspace(id),
        weddingApi.getTasks(id)
      ]);
      setWorkspace(wsData);
      setTasks(tasksData);
    } catch (err) {
      console.error('Failed to load wedding workspace', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaceData();
  }, [id]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newTaskTitle) return;
    try {
      await weddingApi.createTask(id, {
        title: newTaskTitle,
        priority: newTaskPriority,
        status: 'To Plan',
        due_date: newTaskDueDate || new Date().toISOString()
      });
      setShowTaskModal(false);
      setNewTaskTitle('');
      fetchWorkspaceData();
    } catch (err) {
      alert('Failed to create task');
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    if (!id) return;
    try {
      await weddingApi.updateTask(id, taskId, { status: newStatus });
      fetchWorkspaceData();
    } catch (err) {
      alert('Failed to update task status');
    }
  };

  if (loading || !workspace) {
    return (
      <div className="p-12 text-center text-sm text-[#6B7280]">
        Loading royal wedding workspace...
      </div>
    );
  }

  const { overview, contract, events, vendors, gatekeeper_locked } = workspace;

  const tabs = [
    { id: 'overview', label: '1. Overview' },
    { id: 'events', label: `2. Events (${events.length})` },
    { id: 'vendors', label: `3. Vendors (${vendors.length})`, locked: gatekeeper_locked },
    { id: 'tasks', label: `4. Tasks (${tasks.length})` },
    { id: 'guests', label: `5. Guests (${overview.expected_guest_count})` },
    { id: 'budget', label: '6. Budget & P&L' },
    { id: 'client_payments', label: '7. Client Payments' },
    { id: 'vendor_payments', label: '8. Vendor Payments' },
    { id: 'documents', label: '9. Documents' },
    { id: 'activity', label: '10. Activity Log' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#EAE3D9]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/weddings')}
            className="p-2 bg-white border border-[#EAE3D9] rounded hover:bg-[#FAF8F5] text-[#1A1F2C]"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-[#C5A880]">{overview.wedding_number}</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-[#F4EFEA] text-[#1A1F2C] border border-[#EAE3D9]">
                {overview.status}
              </span>
            </div>
            <h1 className="text-2xl font-serif text-[#1A1F2C]">{overview.couple_title}</h1>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/admin/live-ops?wedding=${overview.id}`)}
            className="px-3 py-2 bg-[#1B4332] text-[#FAF8F5] rounded text-xs font-medium hover:bg-[#133024] flex items-center gap-1.5 shadow-xs"
          >
            <Clock className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Day-Of Command</span>
          </button>
          <button
            onClick={() => navigate(`/admin/contracts?enquiry=${overview.wedding_number}`)}
            className="px-3 py-2 bg-[#1A1F2C] text-[#FAF8F5] rounded text-xs font-medium hover:bg-[#2C3444] flex items-center gap-1.5 shadow-xs"
          >
            <FileText className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Digital Contract</span>
          </button>
        </div>
      </div>

      {/* Gatekeeper Security Notice */}
      {gatekeeper_locked && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3 text-xs text-amber-900">
          <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-950 block text-sm mb-0.5">
              Strict Gatekeeper Rule Active: Vendor Allocations & Floor Plans Locked
            </span>
            <span>
              In accordance with The Royal Knot client security protocol, detailed vendor contacts and palace spatial floor plans remain locked until the Service Agreement is digitally executed and signed by the couple.
            </span>
          </div>
        </div>
      )}

      {/* 10 Navigation Tabs */}
      <div className="border-b border-[#EAE3D9] flex gap-1 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-xs font-medium rounded-t transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white border-t-2 border-x border-t-[#C5A880] border-x-[#EAE3D9] text-[#1A1F2C] font-semibold -mb-px'
                : 'text-[#6B7280] hover:text-[#1A1F2C] hover:bg-[#F4EFEA]'
            }`}
          >
            {tab.locked && <Lock className="w-3 h-3 text-amber-600" />}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-lg border border-[#EAE3D9] shadow-sm space-y-4">
              <h2 className="text-lg font-serif text-[#1A1F2C] pb-2 border-b border-[#EAE3D9]">Wedding Scope & Palace Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[#6B7280] block">Bride & Groom</span>
                  <span className="font-medium text-[#1A1F2C] text-sm">{overview.bride_name} & {overview.groom_name}</span>
                </div>
                <div>
                  <span className="text-[#6B7280] block">Destination & Venue</span>
                  <span className="font-medium text-[#1A1F2C] text-sm">{overview.destination} • {overview.venue_name}</span>
                </div>
                <div>
                  <span className="text-[#6B7280] block">Dates Scheduled</span>
                  <span className="font-medium text-[#1A1F2C]">
                    {new Date(overview.wedding_date_start).toLocaleDateString('en-IN', { dateStyle: 'medium' })} to{' '}
                    {new Date(overview.wedding_date_end).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                  </span>
                </div>
                <div>
                  <span className="text-[#6B7280] block">Guest Count & Package</span>
                  <span className="font-medium text-[#1A1F2C]">
                    {overview.expected_guest_count} Royal Guests • {overview.package_type === 'full_service' ? 'Full-Service Royal Curation' : 'Partial / Day-of'}
                  </span>
                </div>
                <div>
                  <span className="text-[#6B7280] block">Primary Client Contact</span>
                  <span className="font-medium text-[#1A1F2C]">{overview.primary_contact_name} ({overview.contact_phone})</span>
                </div>
                <div>
                  <span className="text-[#6B7280] block">Assigned Lead Planner</span>
                  <span className="font-medium text-[#C5A880]">{overview.assigned_planner_name}</span>
                </div>
              </div>

              {overview.notes && (
                <div className="pt-3 border-t border-[#EAE3D9] text-xs">
                  <span className="text-[#6B7280] block mb-1">Curation & Bespoke Notes:</span>
                  <p className="text-[#4B5563] bg-[#FAF8F5] p-3 rounded border border-[#EAE3D9]">{overview.notes}</p>
                </div>
              )}
            </div>

            {/* Contract Status Card */}
            <div className="bg-white p-6 rounded-lg border border-[#EAE3D9] shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${contract && contract.status === 'Signed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {contract && contract.status === 'Signed' ? <CheckCircle2 className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                </div>
                <div>
                  <span className="text-xs text-[#6B7280] block">Legal Service Agreement</span>
                  <span className="text-base font-serif text-[#1A1F2C]">
                    {contract ? `${contract.contract_number} (${contract.status})` : 'Draft Pending Generation'}
                  </span>
                  {contract?.signed_at && (
                    <span className="text-xs text-[#6B7280] block">
                      Signed by {contract.signed_by} on {new Date(contract.signed_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </span>
                  )}
                </div>
              </div>
              {contract?.pdf_url && (
                <a
                  href={`http://127.0.0.1:8000${contract.pdf_url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 bg-[#FAF8F5] border border-[#EAE3D9] text-[#1A1F2C] text-xs rounded hover:bg-[#F4EFEA] flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Download Signed Agreement</span>
                </a>
              )}
            </div>
          </div>

          {/* Quick Metrics Column */}
          <div className="space-y-6">
            <div className="bg-[#FAF8F5] p-5 rounded-lg border border-[#EAE3D9] space-y-4">
              <h3 className="text-sm font-serif text-[#1A1F2C] font-semibold">Financial Health</h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between pb-1.5 border-b border-[#EAE3D9]">
                  <span className="text-[#6B7280]">Contracted Budget</span>
                  <span className="font-medium text-[#1A1F2C]">₹{overview.agreed_budget.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-[#EAE3D9]">
                  <span className="text-[#6B7280]">Client Revenue Collected</span>
                  <span className="font-semibold text-emerald-700">₹{workspace.total_revenue.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-[#EAE3D9]">
                  <span className="text-[#6B7280]">Vendor Outflows Paid</span>
                  <span className="font-medium text-rose-700">₹{workspace.total_vendor_expenses.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pt-1 font-semibold text-sm">
                  <span>Gross Operating Profit</span>
                  <span className="text-[#C5A880]">
                    ₹{(workspace.total_revenue - workspace.total_vendor_expenses).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-lg border border-[#EAE3D9] space-y-3">
              <h3 className="text-sm font-serif text-[#1A1F2C] font-semibold">Workspace Deliverables</h3>
              <div className="grid grid-cols-2 gap-3 text-center text-xs">
                <div className="p-3 bg-[#FAF8F5] rounded border border-[#EAE3D9]">
                  <span className="text-lg font-serif font-bold text-[#1A1F2C] block">{workspace.tasks_count}</span>
                  <span className="text-[#6B7280]">Tasks in Engine</span>
                </div>
                <div className="p-3 bg-[#FAF8F5] rounded border border-[#EAE3D9]">
                  <span className="text-lg font-serif font-bold text-[#1A1F2C] block">{events.length}</span>
                  <span className="text-[#6B7280]">Ceremonies</span>
                </div>
                <div className="p-3 bg-[#FAF8F5] rounded border border-[#EAE3D9]">
                  <span className="text-lg font-serif font-bold text-[#1A1F2C] block">{vendors.length}</span>
                  <span className="text-[#6B7280]">Assigned Vendors</span>
                </div>
                <div className="p-3 bg-[#FAF8F5] rounded border border-[#EAE3D9]">
                  <span className="text-lg font-serif font-bold text-[#1A1F2C] block">{overview.expected_guest_count}</span>
                  <span className="text-[#6B7280]">Confirmed Heads</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Events & Functions */}
      {activeTab === 'events' && (
        <div className="bg-white p-6 rounded-lg border border-[#EAE3D9] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D9]">
            <h2 className="text-lg font-serif text-[#1A1F2C]">Ceremonies & Functions Itinerary</h2>
            <span className="text-xs text-[#6B7280]">Automatically generated from initial consultation</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((ev, idx) => (
              <div key={ev.id} className="p-4 bg-[#FAF8F5] border border-[#EAE3D9] rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2 py-0.5 bg-[#F4EFEA] text-[#C5A880] rounded">
                    Function {idx + 1}
                  </span>
                  <span className="text-xs font-medium text-[#1A1F2C]">
                    {new Date(ev.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <h3 className="text-base font-serif text-[#1A1F2C] font-semibold">{ev.title}</h3>
                <div className="text-xs text-[#6B7280] space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>{ev.start_time} - {ev.end_time}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>{ev.venue}</span>
                  </div>
                  {ev.dress_code && (
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>Attire: {ev.dress_code}</span>
                    </div>
                  )}
                </div>
                {ev.description && <p className="text-xs text-[#4B5563] pt-2 border-t border-[#EAE3D9]">{ev.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Vendors (Gatekeeper Enforced) */}
      {activeTab === 'vendors' && (
        <div className="bg-white p-6 rounded-lg border border-[#EAE3D9] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D9]">
            <div>
              <h2 className="text-lg font-serif text-[#1A1F2C]">Contracted Wedding Vendors</h2>
              <p className="text-xs text-[#6B7280]">Locked to client until agreement is formally executed.</p>
            </div>
            <button
              onClick={() => navigate('/admin/vendors')}
              className="px-3 py-1.5 bg-[#1A1F2C] text-[#FAF8F5] text-xs font-medium rounded hover:bg-[#2C3444]"
            >
              Open RFQ Matrix
            </button>
          </div>

          {gatekeeper_locked ? (
            <div className="p-12 text-center bg-amber-50 rounded-lg border border-amber-200 space-y-3">
              <Lock className="w-10 h-10 text-amber-600 mx-auto" />
              <h3 className="text-base font-serif text-amber-950 font-semibold">Vendor Roster Protected Under Gatekeeper Lock</h3>
              <p className="text-xs text-amber-800 max-w-md mx-auto">
                Vendor allocations, rate cards, and contact details are masked. They will unlock automatically once the client executes the digital contract link.
              </p>
            </div>
          ) : vendors.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#6B7280] bg-[#FAF8F5] rounded border border-[#EAE3D9]">
              No vendors awarded yet. Use the Vendor RFQ Matrix to compare quotations and select winners.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] border-b border-[#EAE3D9] text-[#6B7280]">
                  <tr>
                    <th className="py-2.5 px-3">Vendor / Business</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Agreed Contract</th>
                    <th className="py-2.5 px-3">Bound Rate Card</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE3D9]">
                  {vendors.map((wv) => (
                    <tr key={wv.id} className="hover:bg-[#FAF8F5]">
                      <td className="py-3 px-3 font-semibold text-[#1A1F2C]">{wv.business_name}</td>
                      <td className="py-3 px-3 text-[#4B5563]">{wv.category}</td>
                      <td className="py-3 px-3 font-medium text-[#1A1F2C]">₹{wv.agreed_amount.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 text-[#6B7280]">
                        {wv.rate_card?.price_per_plate ? `Plate: ₹${wv.rate_card.price_per_plate} • Extra hr: ₹${wv.rate_card.extra_hour_rate || 0}` : 'Turnkey Scope'}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          {wv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Tasks (Instant Plan Cloned) */}
      {activeTab === 'tasks' && (
        <div className="bg-white p-6 rounded-lg border border-[#EAE3D9] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D9]">
            <div>
              <h2 className="text-lg font-serif text-[#1A1F2C]">Deliverables & Tasks ({tasks.length})</h2>
              <p className="text-xs text-[#6B7280]">Calculated relative to wedding date via Instant Plan engine.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTaskModal(true)}
                className="px-3 py-1.5 bg-[#1A1F2C] text-[#FAF8F5] text-xs font-medium rounded hover:bg-[#2C3444] flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Add Task</span>
              </button>
              <button
                onClick={() => navigate('/admin/tasks')}
                className="px-3 py-1.5 bg-[#FAF8F5] border border-[#EAE3D9] text-[#1A1F2C] text-xs font-medium rounded hover:bg-[#F4EFEA]"
              >
                Kanban View
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-[#EAE3D9] text-[#6B7280]">
                <tr>
                  <th className="py-2.5 px-3">Title</th>
                  <th className="py-2.5 px-3">Assignee</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE3D9]">
                {tasks.map((t) => (
                  <tr key={t.id} className="hover:bg-[#FAF8F5]">
                    <td className="py-3 px-3 font-medium text-[#1A1F2C]">{t.title}</td>
                    <td className="py-3 px-3 text-[#4B5563]">{t.assigned_to_name}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        t.priority === 'Urgent' ? 'bg-rose-100 text-rose-800' :
                        t.priority === 'High' ? 'bg-amber-100 text-amber-800' :
                        'bg-stone-100 text-stone-700'
                      }`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#6B7280]">
                      {new Date(t.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        t.status === 'Done' ? 'bg-emerald-100 text-emerald-800' :
                        t.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        t.status === 'Blocked' ? 'bg-rose-100 text-rose-800' :
                        'bg-stone-100 text-stone-700'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <select
                        value={t.status}
                        onChange={(e) => handleUpdateTaskStatus(t.id, e.target.value)}
                        className="text-xs bg-[#FAF8F5] border border-[#EAE3D9] rounded px-2 py-1 text-[#1A1F2C]"
                      >
                        <option value="To Plan">To Plan</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                        <option value="Blocked">Blocked</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Guests */}
      {activeTab === 'guests' && (
        <div className="bg-white p-6 rounded-lg border border-[#EAE3D9] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D9]">
            <div>
              <h2 className="text-lg font-serif text-[#1A1F2C]">Guest List & RSVP Intelligence</h2>
              <p className="text-xs text-[#6B7280]">Targeting 400+ guest scale for {overview.couple_title}.</p>
            </div>
            <button
              onClick={() => navigate('/admin/guests')}
              className="px-3 py-1.5 bg-[#1A1F2C] text-[#FAF8F5] text-xs font-medium rounded hover:bg-[#2C3444]"
            >
              Open Full Guest Hub & CSV Import
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center text-xs">
            <div className="p-4 bg-[#FAF8F5] rounded-lg border border-[#EAE3D9]">
              <span className="text-xl font-serif font-bold text-[#1A1F2C] block">{overview.expected_guest_count}</span>
              <span className="text-[#6B7280]">Contracted Capacity</span>
            </div>
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <span className="text-xl font-serif font-bold text-emerald-800 block">385</span>
              <span className="text-emerald-700">Confirmed RSVPs</span>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <span className="text-xl font-serif font-bold text-amber-800 block">25</span>
              <span className="text-amber-700">Tentative / Pending</span>
            </div>
            <div className="p-4 bg-rose-50 rounded-lg border border-rose-200">
              <span className="text-xl font-serif font-bold text-rose-800 block">10</span>
              <span className="text-rose-700">Declined</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Budget & P&L */}
      {activeTab === 'budget' && (
        <div className="bg-white p-6 rounded-lg border border-[#EAE3D9] shadow-sm space-y-6">
          <h2 className="text-lg font-serif text-[#1A1F2C] pb-3 border-b border-[#EAE3D9]">Master Financial Architecture</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-[#FAF8F5] border border-[#EAE3D9] rounded-lg space-y-2">
              <span className="text-xs text-[#6B7280] block">Agreed Wedding Fee</span>
              <span className="text-2xl font-serif font-bold text-[#1A1F2C]">₹{overview.agreed_budget.toLocaleString('en-IN')}</span>
              <span className="text-xs text-emerald-700 block">Collected: ₹{workspace.total_revenue.toLocaleString('en-IN')}</span>
            </div>
            <div className="p-5 bg-[#FAF8F5] border border-[#EAE3D9] rounded-lg space-y-2">
              <span className="text-xs text-[#6B7280] block">Vendor Expenses</span>
              <span className="text-2xl font-serif font-bold text-rose-700">₹{workspace.total_vendor_expenses.toLocaleString('en-IN')}</span>
              <span className="text-xs text-[#6B7280] block">Across all contracted suppliers</span>
            </div>
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-lg space-y-2">
              <span className="text-xs text-emerald-800 block font-medium">Net Estimated Margin</span>
              <span className="text-2xl font-serif font-bold text-emerald-900">
                ₹{(workspace.total_revenue - workspace.total_vendor_expenses).toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-emerald-700 block font-semibold">
                {overview.agreed_budget > 0 ? (((workspace.total_revenue - workspace.total_vendor_expenses) / overview.agreed_budget) * 100).toFixed(1) : 0}% Margin
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Client Payments */}
      {activeTab === 'client_payments' && (
        <div className="bg-white p-6 rounded-lg border border-[#EAE3D9] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D9]">
            <div>
              <h2 className="text-lg font-serif text-[#1A1F2C]">Client Payment Staged Milestones</h2>
              <p className="text-xs text-[#6B7280]">25% Booking Deposit • 50% Advance (30d before) • 25% Final Settlement</p>
            </div>
            <button
              onClick={() => navigate('/admin/client-payments')}
              className="px-3 py-1.5 bg-[#1A1F2C] text-[#FAF8F5] text-xs font-medium rounded hover:bg-[#2C3444]"
            >
              Record Payment
            </button>
          </div>
          <div className="space-y-3">
            {[
              { name: '1. Booking Deposit (25%)', amount: overview.agreed_budget * 0.25, status: 'Paid', due: 'Executed upon signing' },
              { name: '2. Advance Payment (50%)', amount: overview.agreed_budget * 0.50, status: 'Pending', due: '30 Days Prior to Wedding' },
              { name: '3. Final Settlement (25%)', amount: overview.agreed_budget * 0.25, status: 'Pending', due: '7 Days Post-Celebration' }
            ].map((m, i) => (
              <div key={i} className="p-4 bg-[#FAF8F5] border border-[#EAE3D9] rounded-lg flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-sm text-[#1A1F2C] block">{m.name}</span>
                  <span className="text-[#6B7280]">Due: {m.due}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-sm text-[#1A1F2C] block">₹{m.amount.toLocaleString('en-IN')}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${m.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {m.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 8: Vendor Payments */}
      {activeTab === 'vendor_payments' && (
        <div className="bg-white p-6 rounded-lg border border-[#EAE3D9] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D9]">
            <div>
              <h2 className="text-lg font-serif text-[#1A1F2C]">Vendor Invoices & Variance Reconciliation</h2>
              <p className="text-xs text-[#6B7280]">Rate card extra plates and overtime reconciliation module.</p>
            </div>
            <button
              onClick={() => navigate('/admin/vendor-payments')}
              className="px-3 py-1.5 bg-[#1A1F2C] text-[#FAF8F5] text-xs font-medium rounded hover:bg-[#2C3444]"
            >
              Open Reconciliation Hub
            </button>
          </div>
          <div className="p-6 bg-[#FAF8F5] border border-[#EAE3D9] rounded-lg text-center text-xs text-[#6B7280]">
            Review claimed invoices vs agreed quotation baseline and calculate extra charges from bound rate card.
          </div>
        </div>
      )}

      {/* Tab 9: Documents */}
      {activeTab === 'documents' && (
        <div className="bg-white p-6 rounded-lg border border-[#EAE3D9] shadow-sm space-y-4">
          <h2 className="text-lg font-serif text-[#1A1F2C] pb-3 border-b border-[#EAE3D9]">Official Documents & Records</h2>
          <div className="space-y-3 text-xs">
            {contract?.pdf_url && (
              <div className="p-3 bg-[#FAF8F5] border border-[#EAE3D9] rounded flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#C5A880]" />
                  <span>Service Agreement Contract – {contract.contract_number}</span>
                </div>
                <a
                  href={`http://127.0.0.1:8000${contract.pdf_url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#C5A880] hover:underline flex items-center gap-1 font-medium"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
              </div>
            )}
            <div className="p-3 bg-[#FAF8F5] border border-[#EAE3D9] rounded flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#C5A880]" />
                <span>Palace Master Banquet Floor Plan (Taj / Rambagh)</span>
              </div>
              <span className="text-[#6B7280] italic">Archived in palace records</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 10: Activity Log */}
      {activeTab === 'activity' && (
        <div className="bg-white p-6 rounded-lg border border-[#EAE3D9] shadow-sm space-y-4">
          <h2 className="text-lg font-serif text-[#1A1F2C] pb-3 border-b border-[#EAE3D9]">Audit Trail & Execution Log</h2>
          <div className="space-y-3 text-xs">
            <div className="p-3 border-l-2 border-[#C5A880] bg-[#FAF8F5] rounded-r space-y-0.5">
              <span className="font-semibold text-[#1A1F2C]">ENQUIRY_CONVERTED_TO_WEDDING</span>
              <p className="text-[#6B7280]">Dedicated workspace generated. 26 instant plan tasks seeded.</p>
            </div>
            <div className="p-3 border-l-2 border-emerald-600 bg-[#FAF8F5] rounded-r space-y-0.5">
              <span className="font-semibold text-[#1A1F2C]">INSTANT_PLAN_GENERATED</span>
              <p className="text-[#6B7280]">Role-based task assignments and payment milestone schedules seeded.</p>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-[#EAE3D9] shadow-lg max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-serif text-[#1A1F2C]">Add Deliverable Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#6B7280] mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Confirm royal folk manganiyar troubadours"
                  className="w-full p-2 bg-[#FAF8F5] border border-[#EAE3D9] rounded text-[#1A1F2C]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#6B7280] mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                    className="w-full p-2 bg-[#FAF8F5] border border-[#EAE3D9] rounded text-[#1A1F2C]"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#6B7280] mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-full p-2 bg-[#FAF8F5] border border-[#EAE3D9] rounded text-[#1A1F2C]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-3 py-1.5 bg-[#F4EFEA] text-[#1A1F2C] rounded hover:bg-[#EAE3D9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1A1F2C] text-[#FAF8F5] rounded font-medium hover:bg-[#2C3444]"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

