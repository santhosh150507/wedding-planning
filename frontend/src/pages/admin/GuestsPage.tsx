import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Upload, 
  Plus, 
  UserPlus, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Utensils, 
  FileSpreadsheet,
  X
} from 'lucide-react';
import { guestApi, weddingApi } from '../../api/endpoints';
import { GuestItem, GuestStats, WeddingSummary } from '../../types';

export const GuestsPage: React.FC = () => {
  const [weddings, setWeddings] = useState<WeddingSummary[]>([]);
  const [selectedWeddingId, setSelectedWeddingId] = useState<string>('');
  const [guests, setGuests] = useState<GuestItem[]>([]);
  const [stats, setStats] = useState<GuestStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [rsvpFilter, setRsvpFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importReport, setImportReport] = useState<{ success: boolean; imported_count: number; errors: string[] } | null>(null);
  const [importing, setImporting] = useState(false);

  // New Guest Form
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCategory, setNewCategory] = useState('Friend');
  const [newPartySize, setNewPartySize] = useState(1);
  const [newRsvp, setNewRsvp] = useState('Invited');
  const [newDiet, setNewDiet] = useState('Vegetarian');
  const [newTable, setNewTable] = useState('');

  const fetchWeddingsAndGuests = async () => {
    try {
      setLoading(true);
      const wList = await weddingApi.list();
      setWeddings(wList);

      if (wList.length > 0) {
        const targetId = selectedWeddingId || wList[0].id;
        setSelectedWeddingId(targetId);
        loadGuestData(targetId);
      }
    } catch (err) {
      console.error('Failed to load guest data', err);
    } finally {
      setLoading(false);
    }
  };

  const loadGuestData = async (wId: string) => {
    try {
      const [gList, sData] = await Promise.all([
        guestApi.list(wId),
        guestApi.getStats(wId)
      ]);
      setGuests(gList);
      setStats(sData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchWeddingsAndGuests();
  }, []);

  const handleWeddingChange = (wId: string) => {
    setSelectedWeddingId(wId);
    loadGuestData(wId);
  };

  const handleWalkinIncrement = async (guestId: string) => {
    if (!selectedWeddingId) return;
    try {
      await guestApi.recordWalkin(selectedWeddingId, guestId, 1);
      loadGuestData(selectedWeddingId);
    } catch (err) {
      alert('Failed to record walk-in head.');
    }
  };

  const handleCreateGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWeddingId || !newName) return;
    try {
      await guestApi.create(selectedWeddingId, {
        full_name: newName,
        phone: newPhone || undefined,
        category: newCategory,
        expected_party_size: Number(newPartySize),
        rsvp_status: newRsvp,
        dietary_preference: newDiet,
        table_number: newTable || undefined
      });
      setShowAddModal(false);
      setNewName('');
      setNewPhone('');
      setNewTable('');
      loadGuestData(selectedWeddingId);
    } catch (err) {
      alert('Failed to add guest');
    }
  };

  const handleCsvImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWeddingId || !csvFile) return;

    const formData = new FormData();
    formData.append('file', csvFile);

    try {
      setImporting(true);
      const res = await guestApi.importCsv(selectedWeddingId, formData);
      setImportReport(res);
      loadGuestData(selectedWeddingId);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'CSV Import failed');
    } finally {
      setImporting(false);
    }
  };

  const filteredGuests = guests.filter((g) => {
    const matchesSearch = !search || g.full_name.toLowerCase().includes(search.toLowerCase());
    const matchesRsvp = rsvpFilter === 'All' || g.rsvp_status === rsvpFilter;
    const matchesCat = categoryFilter === 'All' || g.category === categoryFilter;
    return matchesSearch && matchesRsvp && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#EAE3D9]">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif text-[#1A1F2C] flex items-center gap-2">
            <span>Guest Protocol & RSVP Matrix</span>
            <span className="text-sm font-sans font-normal px-2.5 py-1 bg-[#F4EFEA] text-[#C5A880] rounded border border-[#EAE3D9]">
              400+ Capacity
            </span>
          </h1>
          <p className="text-sm text-[#6B7280] mt-1 font-sans">
            VIP protocol, dietary requirement tracking, CSV bulk ingestion, and walk-in guest extras counter.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="px-3.5 py-2 bg-[#FAF8F5] border border-[#EAE3D9] text-[#1A1F2C] rounded text-xs font-medium hover:bg-[#F4EFEA] flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>CSV Import</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 bg-[#1A1F2C] text-[#FAF8F5] rounded text-xs font-medium hover:bg-[#2C3444] flex items-center gap-1.5 shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Add Guest</span>
          </button>
        </div>
      </div>

      {/* Wedding Selector & Summary Stats */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-lg border border-[#EAE3D9] shadow-sm">
        <span className="text-xs text-[#6B7280]">Target Wedding Workspace:</span>
        <select
          value={selectedWeddingId}
          onChange={(e) => handleWeddingChange(e.target.value)}
          className="p-1.5 bg-[#FAF8F5] border border-[#EAE3D9] rounded font-serif text-sm font-medium text-[#1A1F2C]"
        >
          {weddings.map((w) => (
            <option key={w.id} value={w.id}>
              {w.wedding_number} – {w.couple_title} ({w.expected_guest_count} Heads Target)
            </option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center text-xs">
          <div className="p-4 bg-white rounded-lg border border-[#EAE3D9] shadow-2xs">
            <span className="text-xl font-serif font-bold text-[#1A1F2C] block">{stats.total_expected_heads}</span>
            <span className="text-[#6B7280]">Contracted Heads</span>
          </div>
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <span className="text-xl font-serif font-bold text-emerald-800 block">{stats.confirmed_heads}</span>
            <span className="text-emerald-700">Confirmed RSVPs</span>
          </div>
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <span className="text-xl font-serif font-bold text-amber-800 block">{stats.tentative_heads}</span>
            <span className="text-amber-700">Pending Response</span>
          </div>
          <div className="p-4 bg-white rounded-lg border border-[#EAE3D9] shadow-2xs">
            <span className="text-xl font-serif font-bold text-[#C5A880] block">{stats.actual_checked_in}</span>
            <span className="text-[#6B7280]">Checked-In Heads</span>
          </div>
          <div className="p-4 bg-rose-50 rounded-lg border border-rose-200">
            <span className="text-xl font-serif font-bold text-rose-800 block">+{stats.additional_walkins}</span>
            <span className="text-rose-700">Walk-ins (Feeds Extras)</span>
          </div>
        </div>
      )}

      {/* Filter and Table */}
      <div className="bg-white rounded-lg border border-[#EAE3D9] shadow-sm p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search guest by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#FAF8F5] border border-[#EAE3D9] rounded text-xs text-[#1A1F2C]"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#6B7280]">RSVP:</span>
            {['All', 'Confirmed', 'Invited', 'Tentative', 'Declined'].map((r) => (
              <button
                key={r}
                onClick={() => setRsvpFilter(r)}
                className={`px-2 py-1 rounded text-xs ${
                  rsvpFilter === r ? 'bg-[#1A1F2C] text-white' : 'bg-[#FAF8F5] text-[#1A1F2C] border border-[#EAE3D9]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Guest Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-y border-[#EAE3D9] text-[#6B7280]">
              <tr>
                <th className="py-2.5 px-3">Guest Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Party Size</th>
                <th className="py-2.5 px-3">RSVP Status</th>
                <th className="py-2.5 px-3">Dietary Preference</th>
                <th className="py-2.5 px-3">Table</th>
                <th className="py-2.5 px-3">Checked In</th>
                <th className="py-2.5 px-3">Walk-in Counter</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE3D9]">
              {filteredGuests.map((g) => (
                <tr key={g.id} className="hover:bg-[#FAF8F5]">
                  <td className="py-3 px-3 font-semibold text-[#1A1F2C]">{g.full_name}</td>
                  <td className="py-3 px-3 text-[#4B5563]">{g.category}</td>
                  <td className="py-3 px-3 font-mono text-[#1A1F2C]">{g.expected_party_size} pax</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      g.rsvp_status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' :
                      g.rsvp_status === 'Declined' ? 'bg-rose-100 text-rose-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {g.rsvp_status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[#4B5563] flex items-center gap-1.5">
                    <Utensils className="w-3 h-3 text-[#C5A880]" />
                    <span>{g.dietary_preference}</span>
                  </td>
                  <td className="py-3 px-3 font-mono text-[#6B7280]">{g.table_number || 'TBD'}</td>
                  <td className="py-3 px-3 font-mono text-[#1A1F2C]">{g.actual_checked_in_count} pax</td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => handleWalkinIncrement(g.id)}
                      className="px-2 py-1 bg-[#FAF8F5] border border-[#EAE3D9] rounded hover:bg-[#F4EFEA] text-[10px] font-medium text-[#C5A880]"
                      title="Log +1 walk-in extra plate"
                    >
                      +1 Walk-in ({g.additional_walkin_count})
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CSV Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-[#EAE3D9] shadow-lg max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#EAE3D9]">
              <h3 className="text-base font-serif font-bold text-[#1A1F2C]">Bulk Guest CSV Import</h3>
              <button onClick={() => { setShowImportModal(false); setImportReport(null); }}>
                <X className="w-4 h-4 text-[#6B7280]" />
              </button>
            </div>

            <p className="text-[#6B7280]">
              Expected CSV columns: <span className="font-mono text-[#1A1F2C]">full_name, phone, email, category, party_size, rsvp_status, dietary_preference, table_number</span>
            </p>

            <form onSubmit={handleCsvImport} className="space-y-4">
              <input
                type="file"
                accept=".csv"
                required
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                className="w-full p-2 bg-[#FAF8F5] border border-[#EAE3D9] rounded text-[#1A1F2C]"
              />

              {importReport && (
                <div className={`p-3 rounded border text-xs ${importReport.success ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
                  <span className="font-semibold block">
                    ✓ Ingested {importReport.imported_count} guests successfully.
                  </span>
                  {importReport.errors.length > 0 && (
                    <div className="mt-2 text-[10px] text-rose-800">
                      <span>Errors detected:</span>
                      <ul className="list-disc pl-4 mt-0.5">
                        {importReport.errors.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setShowImportModal(false); setImportReport(null); }}
                  className="px-3 py-1.5 bg-[#F4EFEA] text-[#1A1F2C] rounded"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={importing}
                  className="px-4 py-1.5 bg-[#1A1F2C] text-[#FAF8F5] rounded font-medium hover:bg-[#2C3444]"
                >
                  {importing ? 'Processing...' : 'Upload & Validate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Guest Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-[#EAE3D9] shadow-lg max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#EAE3D9]">
              <h3 className="text-base font-serif font-bold text-[#1A1F2C]">Add Royal Guest</h3>
              <button onClick={() => setShowAddModal(false)}>
                <X className="w-4 h-4 text-[#6B7280]" />
              </button>
            </div>

            <form onSubmit={handleCreateGuest} className="space-y-3">
              <div>
                <label className="block text-[#6B7280] mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maharaja Gaj Singh"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2 bg-[#FAF8F5] border border-[#EAE3D9] rounded text-[#1A1F2C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#6B7280] mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-2 bg-[#FAF8F5] border border-[#EAE3D9] rounded text-[#1A1F2C]"
                  >
                    <option value="VIP">VIP</option>
                    <option value="Bride Family">Bride Family</option>
                    <option value="Groom Family">Groom Family</option>
                    <option value="Friend">Friend</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#6B7280] mb-1">Party Size (Heads)</label>
                  <input
                    type="number"
                    min="1"
                    value={newPartySize}
                    onChange={(e) => setNewPartySize(Number(e.target.value))}
                    className="w-full p-2 bg-[#FAF8F5] border border-[#EAE3D9] rounded text-[#1A1F2C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#6B7280] mb-1">RSVP Status</label>
                  <select
                    value={newRsvp}
                    onChange={(e) => setNewRsvp(e.target.value)}
                    className="w-full p-2 bg-[#FAF8F5] border border-[#EAE3D9] rounded text-[#1A1F2C]"
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Invited">Invited</option>
                    <option value="Tentative">Tentative</option>
                    <option value="Declined">Declined</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#6B7280] mb-1">Dietary Preference</label>
                  <select
                    value={newDiet}
                    onChange={(e) => setNewDiet(e.target.value)}
                    className="w-full p-2 bg-[#FAF8F5] border border-[#EAE3D9] rounded text-[#1A1F2C]"
                  >
                    <option value="Vegetarian">Pure Vegetarian</option>
                    <option value="Jain">Jain Gourmet</option>
                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#6B7280] mb-1">Table Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Royal Lotus T-01"
                  value={newTable}
                  onChange={(e) => setNewTable(e.target.value)}
                  className="w-full p-2 bg-[#FAF8F5] border border-[#EAE3D9] rounded text-[#1A1F2C]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-[#F4EFEA] text-[#1A1F2C] rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1A1F2C] text-[#FAF8F5] rounded font-medium hover:bg-[#2C3444]"
                >
                  Save Guest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

