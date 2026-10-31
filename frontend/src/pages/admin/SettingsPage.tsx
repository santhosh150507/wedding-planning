import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Building, 
  ListTodo, 
  Layers, 
  CreditCard, 
  Shield, 
  Plus, 
  CheckCircle2,
  Sparkles,
  X
} from 'lucide-react';
import { settingsApi } from '../../api/endpoints';

export const SettingsPage: React.FC = () => {
  const [settingsData, setSettingsData] = useState<any | null>(null);
  const [taskTemplates, setTaskTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'templates' | 'milestones' | 'categories' | 'roles'>('profile');
  const [selectedPkg, setSelectedPkg] = useState('full_service');

  // New Template Modal
  const [showAddTplModal, setShowAddTplModal] = useState(false);
  const [tplTitle, setTplTitle] = useState('');
  const [tplCategory, setTplCategory] = useState('General');
  const [tplRole, setTplRole] = useState('Wedding Planner');
  const [tplPriority, setTplPriority] = useState('High');
  const [tplOffset, setTplOffset] = useState(-30);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const [sData, tpls] = await Promise.all([
        settingsApi.getSettings(),
        settingsApi.listTaskTemplates()
      ]);
      setSettingsData(sData);
      setTaskTemplates(tpls);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await settingsApi.createTaskTemplate({
        package_type: selectedPkg,
        title: tplTitle,
        category: tplCategory,
        role_assignee: tplRole,
        default_priority: tplPriority,
        days_offset_from_wedding: Number(tplOffset)
      });
      setShowAddTplModal(false);
      setTplTitle('');
      fetchSettings();
    } catch (err) {
      alert('Failed to create task template');
    }
  };

  const filteredTemplates = taskTemplates.filter(t => t.package_type === selectedPkg);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#EAE3D9]">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif text-[#1A1F2C] flex items-center gap-2">
            <span>Agency Settings & Configuration</span>
            <span className="text-sm font-sans font-normal px-2.5 py-1 bg-[#F4EFEA] text-[#C5A880] rounded border border-[#EAE3D9]">
              Palace Standard
            </span>
          </h1>
          <p className="text-sm text-[#6B7280] mt-1 font-sans">
            Configure company branding, manage 25+ automated task templates, and adjust milestone percentages.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#EAE3D9] pb-1 overflow-x-auto">
        {[
          { id: 'profile', label: 'Company Profile', icon: Building },
          { id: 'templates', label: `Task Templates (${taskTemplates.length})`, icon: ListTodo },
          { id: 'milestones', label: 'Milestone Config', icon: CreditCard },
          { id: 'categories', label: '12 Vendor Categories', icon: Layers },
          { id: 'roles', label: 'Staff Roles & Permissions', icon: Shield }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 text-xs font-medium rounded-t transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white border-t-2 border-x border-t-[#C5A880] border-x-[#EAE3D9] text-[#1A1F2C] font-semibold -mb-px'
                  : 'text-[#6B7280] hover:text-[#1A1F2C] hover:bg-[#F4EFEA]'
              }`}
            >
              <Icon className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Profile */}
      {activeTab === 'profile' && settingsData && (
        <div className="bg-white p-6 rounded-lg border border-[#EAE3D9] shadow-sm space-y-4 max-w-3xl">
          <h2 className="text-lg font-serif text-[#1A1F2C] pb-2 border-b border-[#EAE3D9]">Official Agency Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[#6B7280] block">Legal Entity Name</span>
              <span className="font-semibold text-[#1A1F2C] text-sm">{settingsData.agency_profile.name}</span>
            </div>
            <div>
              <span className="text-[#6B7280] block">GSTIN Registration</span>
              <span className="font-mono font-semibold text-[#1A1F2C] text-sm">{settingsData.agency_profile.gstin}</span>
            </div>
            <div>
              <span className="text-[#6B7280] block">Palace Head Office</span>
              <span className="text-[#4B5563]">{settingsData.agency_profile.registered_address}</span>
            </div>
            <div>
              <span className="text-[#6B7280] block">Concierge Desk</span>
              <span className="text-[#4B5563]">{settingsData.agency_profile.concierge_phone} • {settingsData.agency_profile.support_email}</span>
            </div>
            <div className="md:col-span-2 pt-2 border-t border-[#EAE3D9]">
              <span className="text-[#6B7280] block mb-1">Curation Tagline</span>
              <span className="font-serif italic text-sm text-[#C5A880]">"{settingsData.agency_profile.tagline}"</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Task Templates (25+ Tasks) */}
      {activeTab === 'templates' && (
        <div className="bg-white p-6 rounded-lg border border-[#EAE3D9] shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#EAE3D9]">
            <div>
              <h2 className="text-base font-serif font-bold text-[#1A1F2C]">Instant Plan Task Templates</h2>
              <p className="text-xs text-[#6B7280]">
                Tasks cloned on wedding creation with due dates calculated relative to celebration day (Day 0).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedPkg}
                onChange={(e) => setSelectedPkg(e.target.value)}
                className="p-1.5 bg-[#FAF8F5] border border-[#EAE3D9] rounded text-xs text-[#1A1F2C]"
              >
                <option value="full_service">Full-Service Royal (26 Templates)</option>
                <option value="partial_day_of">Partial / Day-of (7 Templates)</option>
              </select>
              <button
                onClick={() => setShowAddTplModal(true)}
                className="px-3 py-1.5 bg-[#1A1F2C] text-[#FAF8F5] rounded text-xs font-medium hover:bg-[#2C3444] flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>New Template</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-y border-[#EAE3D9] text-[#6B7280]">
                <tr>
                  <th className="py-2.5 px-3">Title</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Role Assignee</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Relative Due Date Math</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE3D9]">
                {filteredTemplates.map((t) => (
                  <tr key={t.id} className="hover:bg-[#FAF8F5]">
                    <td className="py-3 px-3 font-semibold text-[#1A1F2C]">{t.title}</td>
                    <td className="py-3 px-3 text-[#4B5563]">{t.category}</td>
                    <td className="py-3 px-3 text-[#C5A880] font-medium">{t.role_assignee}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        t.default_priority === 'Urgent' ? 'bg-rose-100 text-rose-800' :
                        t.default_priority === 'High' ? 'bg-amber-100 text-amber-800' :
                        'bg-stone-100 text-stone-700'
                      }`}>
                        {t.default_priority}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[#6B7280]">
                      {t.days_offset_from_wedding === 0 ? 'Day of Wedding (Day 0)' : `${t.days_offset_from_wedding} Days`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Milestones */}
      {activeTab === 'milestones' && settingsData && (
        <div className="bg-white p-6 rounded-lg border border-[#EAE3D9] shadow-sm space-y-4 max-w-2xl">
          <h2 className="text-base font-serif font-bold text-[#1A1F2C] pb-2 border-b border-[#EAE3D9]">Standard Staged Milestone Architecture</h2>
          <div className="space-y-3 text-xs">
            {settingsData.milestone_presets.map((m: any, i: number) => (
              <div key={i} className="p-4 bg-[#FAF8F5] border border-[#EAE3D9] rounded-lg flex items-center justify-between">
                <div>
                  <span className="font-serif font-bold text-sm text-[#1A1F2C] block">{m.name}</span>
                  <span className="text-[#6B7280]">{m.description}</span>
                </div>
                <span className="text-base font-serif font-bold text-[#C5A880]">{m.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Categories */}
      {activeTab === 'categories' && settingsData && (
        <div className="bg-white p-6 rounded-lg border border-[#EAE3D9] shadow-sm space-y-4">
          <h2 className="text-base font-serif font-bold text-[#1A1F2C] pb-2 border-b border-[#EAE3D9]">12 Standard Palace Vendor Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {settingsData.vendor_categories.map((c: any) => (
              <div key={c.id} className="p-3 bg-[#FAF8F5] border border-[#EAE3D9] rounded flex items-center justify-between">
                <span className="font-medium text-[#1A1F2C]">{c.name}</span>
                <span className="font-mono text-[10px] text-[#C5A880]">{c.code}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Roles & Permissions */}
      {activeTab === 'roles' && (
        <div className="bg-white p-6 rounded-lg border border-[#EAE3D9] shadow-sm space-y-4 max-w-3xl">
          <h2 className="text-base font-serif font-bold text-[#1A1F2C] pb-2 border-b border-[#EAE3D9]">Staff Role Permissions Matrix</h2>
          <div className="space-y-3 text-xs">
            {[
              { role: 'Founder / Super Admin', desc: 'Full unconstrained administrative, financial, and executive report control', perm: 'All Modules, P&L Reports, User Accounts' },
              { role: 'Administrator', desc: 'Agency operational management, client master records, and team assignments', perm: 'Enquiries, Weddings, Vendors, Finance, Users' },
              { role: 'Wedding Planner', desc: 'Lead planner managing assigned weddings, proposals, tasks, and supplier RFQs', perm: 'Enquiries, Weddings, Vendors, Tasks, Calendar, Live-Ops' },
              { role: 'Planning Staff', desc: 'Execution and on-site staff managing day-of timelines, guest check-ins, and task completion', perm: 'Tasks, Guests, Day-of Live-Ops' },
              { role: 'Finance Manager', desc: 'Reconciles vendor invoices, tracks client receipts, audits bill variances, and reviews profitability', perm: 'Finance, Reports, Contracts, Milestone Alerts' }
            ].map((r, i) => (
              <div key={i} className="p-4 bg-[#FAF8F5] border border-[#EAE3D9] rounded-lg space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-sm text-[#1A1F2C]">{r.role}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white border border-[#EAE3D9] text-[#C5A880]">Enforced in Backend</span>
                </div>
                <p className="text-[#6B7280]">{r.desc}</p>
                <div className="pt-1 text-[11px] text-[#1A1F2C]">
                  <strong>Permitted Modules:</strong> {r.perm}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Task Template Modal */}
      {showAddTplModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-[#EAE3D9] shadow-lg max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#EAE3D9]">
              <h3 className="text-base font-serif font-bold text-[#1A1F2C]">Add Standard Task Template</h3>
              <button onClick={() => setShowAddTplModal(false)}>
                <X className="w-4 h-4 text-[#6B7280]" />
              </button>
            </div>

            <form onSubmit={handleCreateTemplate} className="space-y-3">
              <div>
                <label className="block text-[#6B7280] mb-1">Task Deliverable Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Conduct audio acoustic test for royal sangeet"
                  value={tplTitle}
                  onChange={(e) => setTplTitle(e.target.value)}
                  className="w-full p-2 bg-[#FAF8F5] border border-[#EAE3D9] rounded text-[#1A1F2C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#6B7280] mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={tplCategory}
                    onChange={(e) => setTplCategory(e.target.value)}
                    placeholder="e.g. Production"
                    className="w-full p-2 bg-[#FAF8F5] border border-[#EAE3D9] rounded text-[#1A1F2C]"
                  />
                </div>
                <div>
                  <label className="block text-[#6B7280] mb-1">Default Role</label>
                  <select
                    value={tplRole}
                    onChange={(e) => setTplRole(e.target.value)}
                    className="w-full p-2 bg-[#FAF8F5] border border-[#EAE3D9] rounded text-[#1A1F2C]"
                  >
                    <option value="Wedding Planner">Wedding Planner</option>
                    <option value="Planning Staff">Planning Staff</option>
                    <option value="Finance Manager">Finance Manager</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#6B7280] mb-1">Priority</label>
                  <select
                    value={tplPriority}
                    onChange={(e) => setTplPriority(e.target.value)}
                    className="w-full p-2 bg-[#FAF8F5] border border-[#EAE3D9] rounded text-[#1A1F2C]"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#6B7280] mb-1">Days Offset from Day 0</label>
                  <input
                    type="number"
                    value={tplOffset}
                    onChange={(e) => setTplOffset(Number(e.target.value))}
                    className="w-full p-2 bg-[#FAF8F5] border border-[#EAE3D9] rounded text-[#1A1F2C]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTplModal(false)}
                  className="px-3 py-1.5 bg-[#F4EFEA] text-[#1A1F2C] rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1A1F2C] text-[#FAF8F5] rounded font-medium hover:bg-[#2C3444]"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

