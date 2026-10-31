import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Clock, 
  IndianRupee, 
  Briefcase, 
  Plus, 
  CheckCircle2,
  Calendar,
  X
} from 'lucide-react';
import { teamApi, weddingApi } from '../../api/endpoints';
import { TeamMemberItem, WeddingSummary } from '../../types';

export const TeamPage: React.FC = () => {
  const [members, setMembers] = useState<TeamMemberItem[]>([]);
  const [weddings, setWeddings] = useState<WeddingSummary[]>([]);
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);

  // New Member State
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState('Wedding Planner');
  const [newRate, setNewRate] = useState(2000);

  // Log Time State
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedWedding, setSelectedWedding] = useState('');
  const [loggedHours, setLoggedHours] = useState(8);
  const [loggedNotes, setLoggedNotes] = useState('');

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      const [mList, wList, tList] = await Promise.all([
        teamApi.listMembers(),
        weddingApi.list(),
        teamApi.listTimeEntries()
      ]);
      setMembers(mList);
      setWeddings(wList);
      setTimeEntries(tList);

      if (mList.length > 0) setSelectedUser(mList[0].id);
      if (wList.length > 0) setSelectedWedding(wList[0].id);
    } catch (err) {
      console.error('Failed to load team data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await teamApi.createMember({
        email: newEmail,
        full_name: newName,
        phone: newPhone,
        role_name: newRole,
        hourly_cost_rate: Number(newRate)
      });
      setShowMemberModal(false);
      setNewEmail('');
      setNewName('');
      setNewPhone('');
      fetchTeamData();
    } catch (err) {
      alert('Failed to register employee');
    }
  };

  const handleLogTime = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !selectedWedding) return;
    try {
      await teamApi.createTimeEntry({
        user_id: selectedUser,
        wedding_id: selectedWedding,
        hours: Number(loggedHours),
        notes: loggedNotes || undefined
      });
      setShowTimeModal(false);
      setLoggedNotes('');
      fetchTeamData();
    } catch (err) {
      alert('Failed to log time entry');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#EAE3D9]">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif text-[#1A1F2C] flex items-center gap-2">
            <span>Staff Roster & Workload Balancing</span>
            <span className="text-sm font-sans font-normal px-2.5 py-1 bg-[#F4EFEA] text-[#C5A880] rounded border border-[#EAE3D9]">
              Internal Team
            </span>
          </h1>
          <p className="text-sm text-[#6B7280] mt-1 font-sans">
            Manage planning teams, workload ratios, and log billable hourly coordination time per wedding.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTimeModal(true)}
            className="px-3.5 py-2 bg-[#FAF8F5] border border-[#EAE3D9] text-[#1A1F2C] rounded text-xs font-medium hover:bg-[#F4EFEA] flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Log Time Entry</span>
          </button>
          <button
            onClick={() => setShowMemberModal(true)}
            className="px-3.5 py-2 bg-[#1A1F2C] text-[#FAF8F5] rounded text-xs font-medium hover:bg-[#2C3444] flex items-center gap-1.5 shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Add Team Member</span>
          </button>
        </div>
      </div>

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((m) => (
          <div key={m.id} className="bg-white rounded-lg border border-[#EAE3D9] shadow-sm p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-serif font-bold text-base text-[#1A1F2C]">{m.full_name}</h3>
                <span className="text-xs text-[#6B7280]">{m.email}</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F4EFEA] text-[#C5A880] border border-[#EAE3D9]">
                {m.role}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs bg-[#FAF8F5] p-3 rounded border border-[#EAE3D9]">
              <div>
                <span className="text-[#6B7280] block text-[10px]">Hourly Cost</span>
                <span className="font-bold text-[#1A1F2C]">₹{m.hourly_cost_rate.toLocaleString('en-IN')}/hr</span>
              </div>
              <div>
                <span className="text-[#6B7280] block text-[10px]">Weddings</span>
                <span className="font-bold text-[#1A1F2C]">{m.active_weddings_count} Active</span>
              </div>
              <div>
                <span className="text-[#6B7280] block text-[10px]">Tasks</span>
                <span className="font-bold text-[#C5A880]">{m.pending_tasks_count} Pending</span>
              </div>
            </div>

            <div className="text-[11px] text-[#6B7280] flex items-center justify-between pt-1">
              <span>Contact: {m.phone}</span>
              <span className="text-emerald-700 font-medium">● Available</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Time Entries Ledger */}
      <div className="bg-white rounded-lg border border-[#EAE3D9] shadow-sm overflow-hidden p-5 space-y-3">
        <h2 className="text-base font-serif font-bold text-[#1A1F2C]">Coordination Time Logs (Feeds Profitability Cost)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-y border-[#EAE3D9] text-[#6B7280]">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Team Member</th>
                <th className="py-2.5 px-3">Wedding Workspace</th>
                <th className="py-2.5 px-3">Hours Logged</th>
                <th className="py-2.5 px-3">Hourly Rate</th>
                <th className="py-2.5 px-3">Computed Cost</th>
                <th className="py-2.5 px-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE3D9]">
              {timeEntries.map((te) => (
                <tr key={te.id} className="hover:bg-[#FAF8F5]">
                  <td className="py-3 px-3 text-[#4B5563]">
                    {new Date(te.date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                  </td>
                  <td className="py-3 px-3 font-semibold text-[#1A1F2C]">{te.user_name}</td>
                  <td className="py-3 px-3 text-[#1A1F2C]">{te.couple_title}</td>
                  <td className="py-3 px-3 font-mono font-bold text-[#1A1F2C]">{te.hours} hrs</td>
                  <td className="py-3 px-3 text-[#6B7280]">₹{te.hourly_rate.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3 font-semibold text-rose-700">₹{te.total_cost.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3 text-[#6B7280]">{te.notes || 'Palace on-site coordination'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-[#EAE3D9] shadow-lg max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#EAE3D9]">
              <h3 className="text-base font-serif font-bold text-[#1A1F2C]">Register Team Member</h3>
              <button onClick={() => setShowMemberModal(false)}>
                <X className="w-4 h-4 text-[#6B7280]" />
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="space-y-3">
              <div>
                <label className="block text-[#6B7280] mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Singh"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2 bg-[#FAF8F5] border border-[#EAE3D9] rounded text-[#1A1F2C]"
                />
              </div>

              <div>
                <label className="block text-[#6B7280] mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@royalknot.in"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full p-2 bg-[#FAF8F5] border border-[#EAE3D9] rounded text-[#1A1F2C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#6B7280] mb-1">Role / Permissions</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full p-2 bg-[#FAF8F5] border border-[#EAE3D9] rounded text-[#1A1F2C]"
                  >
                    <option value="Wedding Planner">Wedding Planner</option>
                    <option value="Planning Staff">Planning Staff</option>
                    <option value="Administrator">Administrator</option>
                    <option value="Finance Manager">Finance Manager</option>
                    <option value="Founder / Super Admin">Founder / Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#6B7280] mb-1">Hourly Cost (INR ₹)</label>
                  <input
                    type="number"
                    value={newRate}
                    onChange={(e) => setNewRate(Number(e.target.value))}
                    className="w-full p-2 bg-[#FAF8F5] border border-[#EAE3D9] rounded text-[#1A1F2C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#6B7280] mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98290 11004"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full p-2 bg-[#FAF8F5] border border-[#EAE3D9] rounded text-[#1A1F2C]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMemberModal(false)}
                  className="px-3 py-1.5 bg-[#F4EFEA] text-[#1A1F2C] rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1A1F2C] text-[#FAF8F5] rounded font-medium hover:bg-[#2C3444]"
                >
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Time Modal */}
      {showTimeModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-[#EAE3D9] shadow-lg max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#EAE3D9]">
              <h3 className="text-base font-serif font-bold text-[#1A1F2C]">Log Coordination Hours</h3>
              <button onClick={() => setShowTimeModal(false)}>
                <X className="w-4 h-4 text-[#6B7280]" />
              </button>
            </div>

            <form onSubmit={handleLogTime} className="space-y-3">
              <div>
                <label className="block text-[#6B7280] mb-1">Team Member</label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full p-2 bg-[#FAF8F5] border border-[#EAE3D9] rounded text-[#1A1F2C]"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#6B7280] mb-1">Wedding Workspace</label>
                <select
                  value={selectedWedding}
                  onChange={(e) => setSelectedWedding(e.target.value)}
                  className="w-full p-2 bg-[#FAF8F5] border border-[#EAE3D9] rounded text-[#1A1F2C]"
                >
                  {weddings.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.wedding_number} – {w.couple_title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#6B7280] mb-1">Hours Logged</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  required
                  value={loggedHours}
                  onChange={(e) => setLoggedHours(Number(e.target.value))}
                  className="w-full p-2 bg-[#FAF8F5] border border-[#EAE3D9] rounded text-[#1A1F2C]"
                />
              </div>

              <div>
                <label className="block text-[#6B7280] mb-1">Activity Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Palace Mandap technical dry run"
                  value={loggedNotes}
                  onChange={(e) => setLoggedNotes(e.target.value)}
                  className="w-full p-2 bg-[#FAF8F5] border border-[#EAE3D9] rounded text-[#1A1F2C]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTimeModal(false)}
                  className="px-3 py-1.5 bg-[#F4EFEA] text-[#1A1F2C] rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1A1F2C] text-[#FAF8F5] rounded font-medium hover:bg-[#2C3444]"
                >
                  Submit Hours
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

