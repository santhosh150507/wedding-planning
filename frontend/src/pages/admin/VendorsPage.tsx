import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  Plus, 
  Star, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  FileText, 
  Layers, 
  Sparkles,
  Award,
  ChevronRight,
  X
} from 'lucide-react';
import { vendorApi, weddingApi } from '../../api/endpoints';
import { 
  VendorItem, 
  VendorCategoryItem, 
  RFQComparisonData, 
  WeddingSummary 
} from '../../types';

export const VendorsPage: React.FC = () => {
  const [vendors, setVendors] = useState<VendorItem[]>([]);
  const [categories, setCategories] = useState<VendorCategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');

  // RFQ Comparison Matrix State
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [selectedRfqId, setSelectedRfqId] = useState<string | null>(null);
  const [comparisonData, setComparisonData] = useState<RFQComparisonData | null>(null);
  const [comparingLoading, setComparingLoading] = useState(false);
  const [awardingLoading, setAwardingLoading] = useState(false);
  const [awardSuccessMessage, setAwardSuccessMessage] = useState<string | null>(null);

  // New Vendor Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBizName, setNewBizName] = useState('');
  const [newContactPerson, setNewContactPerson] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCity, setNewCity] = useState('Jaipur');
  const [newGst, setNewGst] = useState('');

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [cats, vList, rfqList] = await Promise.all([
        vendorApi.listCategories(),
        vendorApi.listVendors(),
        vendorApi.listRFQs()
      ]);
      setCategories(cats);
      setVendors(vList);
      setRfqs(rfqList);

      if (cats.length > 0) {
        setNewCategory(cats[0].id);
      }

      // Auto load first RFQ for comparison if present
      if (rfqList.length > 0) {
        setSelectedRfqId(rfqList[0].id);
        loadRfqComparison(rfqList[0].id);
      }
    } catch (err) {
      console.error('Failed to load vendors data', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRfqComparison = async (rfqId: string) => {
    try {
      setComparingLoading(true);
      setAwardSuccessMessage(null);
      const data = await vendorApi.compareRFQs(rfqId);
      setComparisonData(data);
    } catch (err) {
      console.error('Failed to compare RFQs', err);
    } finally {
      setComparingLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleSelectWinner = async (quotationId: string) => {
    if (!window.confirm('Confirm award: This will execute a 1-transaction award, auto-closing competing quotes and binding the rate card to the wedding. Continue?')) {
      return;
    }
    try {
      setAwardingLoading(true);
      const res = await vendorApi.selectWinner(quotationId);
      setAwardSuccessMessage(res.message);
      if (selectedRfqId) {
        loadRfqComparison(selectedRfqId);
      }
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to award quotation.');
    } finally {
      setAwardingLoading(false);
    }
  };

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await vendorApi.createVendor({
        business_name: newBizName,
        contact_person: newContactPerson,
        category_id: newCategory,
        phone: newPhone,
        email: newEmail,
        city: newCity,
        gst_number: newGst || undefined
      });
      setShowAddModal(false);
      // Reset form
      setNewBizName('');
      setNewContactPerson('');
      setNewPhone('');
      setNewEmail('');
      setNewGst('');
      fetchInitialData();
    } catch (err) {
      alert('Failed to register new vendor.');
    }
  };

  const filteredVendors = vendors.filter((v) => {
    const matchesCat = selectedCategory === 'All' || v.category_id === selectedCategory;
    const matchesCity = selectedCity === 'All' || v.city === selectedCity;
    const matchesSearch = !search || v.business_name.toLowerCase().includes(search.toLowerCase()) || v.contact_person.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesCity && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#EAE3D9]">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif text-[#1A1F2C] flex items-center gap-2">
            <span>Vendor Directory & Quotation Matrix</span>
            <span className="text-sm font-sans font-normal px-2.5 py-1 bg-[#F4EFEA] text-[#C5A880] rounded border border-[#EAE3D9]">
              12 Categories
            </span>
          </h1>
          <p className="text-sm text-[#6B7280] mt-1 font-sans">
            Curated Rajasthani palace suppliers with on-time ratings, bill variance history, and atomic RFQ selection.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1A1F2C] text-[#FAF8F5] rounded text-sm font-medium hover:bg-[#2C3444] transition-all shadow-sm"
          >
            <Plus className="w-4 h-4 text-[#C5A880]" />
            <span>Add New Vendor</span>
          </button>
        </div>
      </div>

      {/* RFQ Comparison Matrix Section (Key Feature) */}
      <div className="bg-white p-6 rounded-lg border border-[#EAE3D9] shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#EAE3D9]">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#C5A880]" />
            <div>
              <h2 className="text-lg font-serif text-[#1A1F2C]">Side-by-Side Quotation Comparison Matrix</h2>
              <p className="text-xs text-[#6B7280]">
                Normalised price-per-plate calculations, extra hours rate card, and atomic 1-transaction winner selection.
              </p>
            </div>
          </div>

          {/* RFQ Selector */}
          {rfqs.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#6B7280]">Select RFQ:</span>
              <select
                value={selectedRfqId || ''}
                onChange={(e) => {
                  setSelectedRfqId(e.target.value);
                  loadRfqComparison(e.target.value);
                }}
                className="p-1.5 bg-[#FAF8F5] border border-[#EAE3D9] rounded font-medium text-[#1A1F2C]"
              >
                {rfqs.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} ({r.quotes_count} Quotes)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Success Alert */}
        {awardSuccessMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{awardSuccessMessage}</span>
          </div>
        )}

        {comparingLoading ? (
          <div className="p-8 text-center text-xs text-[#6B7280]">
            Analysing RFQ quotations side-by-side...
          </div>
        ) : !comparisonData ? (
          <div className="p-8 text-center text-xs text-[#6B7280]">
            No RFQ selected. Create a quotation request from an active wedding workspace.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#FAF8F5] rounded border border-[#EAE3D9] text-xs">
              <div>
                <span className="text-[#6B7280]">Target Wedding Scope: </span>
                <span className="font-semibold text-[#1A1F2C]">{comparisonData.guest_count} Royal Guests</span>
              </div>
              <div>
                <span className="text-[#6B7280]">Lowest Estimated Quote: </span>
                <span className="font-bold text-emerald-700">₹{comparisonData.lowest_total_estimate.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[#6B7280]">Status: </span>
                <span className="px-2 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-800">
                  {comparisonData.rfq_status}
                </span>
              </div>
            </div>

            {/* 3 Quotations Side-by-Side Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {comparisonData.quotations.map((q) => {
                const isLowest = q.quotation_id === comparisonData.recommended_lowest_quote_id;
                const isAccepted = q.status === 'Accepted';
                const isClosed = q.status.includes('Closed');

                return (
                  <div
                    key={q.quotation_id}
                    className={`rounded-lg p-5 flex flex-col justify-between border transition-all ${
                      isAccepted
                        ? 'bg-emerald-50/50 border-emerald-400 ring-1 ring-emerald-300'
                        : isLowest
                        ? 'bg-amber-50/30 border-[#C5A880] ring-1 ring-[#C5A880]'
                        : 'bg-white border-[#EAE3D9]'
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Top Vendor Title */}
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-base font-serif font-bold text-[#1A1F2C]">{q.vendor_name}</h3>
                            {isLowest && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#C5A880] text-white">
                                Lowest Total
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-[#6B7280]">{q.contact_person}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          isAccepted ? 'bg-emerald-100 text-emerald-800' :
                          isClosed ? 'bg-stone-200 text-stone-600' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {q.status}
                        </span>
                      </div>

                      {/* Performance Indicators */}
                      <div className="grid grid-cols-3 gap-2 text-center text-[10px] bg-[#FAF8F5] p-2 rounded border border-[#EAE3D9]">
                        <div>
                          <span className="text-[#6B7280] block">Rating</span>
                          <span className="font-semibold text-amber-600">★ {q.vendor_rating}</span>
                        </div>
                        <div>
                          <span className="text-[#6B7280] block">On-Time</span>
                          <span className="font-semibold text-[#1A1F2C]">{q.on_time_percentage}%</span>
                        </div>
                        <div>
                          <span className="text-[#6B7280] block">Bill Variance</span>
                          <span className="font-semibold text-[#1A1F2C]">{q.bill_variance_percentage}%</span>
                        </div>
                      </div>

                      {/* Pricing Normalization */}
                      <div className="space-y-1.5 text-xs pt-2 border-t border-[#EAE3D9]">
                        <div className="flex justify-between">
                          <span className="text-[#6B7280]">Per-Plate Rate:</span>
                          <span className="font-medium text-[#1A1F2C]">₹{q.price_per_plate?.toLocaleString('en-IN') || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6B7280]">Extra-Hour Overtime:</span>
                          <span className="font-medium text-[#1A1F2C]">₹{q.extra_hour_rate?.toLocaleString('en-IN') || 0}/hr</span>
                        </div>
                        <div className="flex justify-between font-bold text-sm text-[#1A1F2C] pt-1 border-t border-[#EAE3D9]">
                          <span>Normalised Total:</span>
                          <span className={isLowest ? 'text-emerald-700' : 'text-[#1A1F2C]'}>
                            ₹{q.normalized_total_for_guests.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Inclusions & Missing Alert */}
                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="font-semibold text-[11px] text-[#1A1F2C] block mb-1">Key Inclusions:</span>
                          <ul className="list-disc pl-4 text-[11px] text-[#4B5563] space-y-0.5">
                            {q.inclusions.slice(0, 3).map((inc, i) => (
                              <li key={i}>{inc}</li>
                            ))}
                          </ul>
                        </div>

                        {q.missing_inclusions.length > 0 && (
                          <div className="p-2 bg-amber-50 rounded border border-amber-200 text-[11px] text-amber-900">
                            <span className="font-semibold flex items-center gap-1 mb-0.5 text-amber-950">
                              <AlertTriangle className="w-3 h-3 text-amber-600" /> Missing from Proposal:
                            </span>
                            <ul className="list-disc pl-4 space-y-0.5 text-amber-800">
                              {q.missing_inclusions.map((m, i) => (
                                <li key={i}>{m}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Award Button */}
                    <div className="pt-4 mt-4 border-t border-[#EAE3D9]">
                      {isAccepted ? (
                        <div className="py-2 bg-emerald-600 text-white rounded text-center text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Winning Supplier Awarded</span>
                        </div>
                      ) : isClosed ? (
                        <div className="py-2 bg-stone-100 text-stone-500 rounded text-center text-xs">
                          Closed (Not Selected)
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSelectWinner(q.quotation_id)}
                          disabled={awardingLoading}
                          className="w-full py-2 bg-[#1A1F2C] text-[#FAF8F5] rounded text-xs font-medium hover:bg-[#2C3444] transition-all flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <Award className="w-3.5 h-3.5 text-[#C5A880]" />
                          <span>Select Winner (1-Transaction)</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 12 Categories Pill Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory('All')}
          className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all whitespace-nowrap ${
            selectedCategory === 'All'
              ? 'bg-[#1A1F2C] text-[#FAF8F5]'
              : 'bg-white border border-[#EAE3D9] text-[#6B7280] hover:bg-[#FAF8F5]'
          }`}
        >
          All Categories ({vendors.length})
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all whitespace-nowrap ${
              selectedCategory === c.id
                ? 'bg-[#1A1F2C] text-[#FAF8F5]'
                : 'bg-white border border-[#EAE3D9] text-[#6B7280] hover:bg-[#FAF8F5]'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Filters & Vendor Directory Table */}
      <div className="bg-white rounded-lg border border-[#EAE3D9] shadow-sm overflow-hidden space-y-4 p-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search vendor or contact person..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#FAF8F5] border border-[#EAE3D9] rounded text-xs text-[#1A1F2C]"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#6B7280]">City:</span>
            {['All', 'Jaipur', 'Udaipur', 'Jodhpur'].map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-2.5 py-1 rounded text-xs ${
                  selectedCity === city
                    ? 'bg-[#1A1F2C] text-white'
                    : 'bg-[#FAF8F5] text-[#1A1F2C] border border-[#EAE3D9]'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Directory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-y border-[#EAE3D9] text-[#6B7280]">
              <tr>
                <th className="py-2.5 px-3">Business Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Contact</th>
                <th className="py-2.5 px-3">City</th>
                <th className="py-2.5 px-3">Rating</th>
                <th className="py-2.5 px-3">On-Time %</th>
                <th className="py-2.5 px-3">Variance %</th>
                <th className="py-2.5 px-3">GSTIN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE3D9]">
              {filteredVendors.map((v) => (
                <tr key={v.id} className="hover:bg-[#FAF8F5]">
                  <td className="py-3 px-3 font-semibold text-[#1A1F2C]">{v.business_name}</td>
                  <td className="py-3 px-3 text-[#4B5563]">{v.category_name}</td>
                  <td className="py-3 px-3 text-[#6B7280]">
                    <span className="font-medium text-[#1A1F2C] block">{v.contact_person}</span>
                    <span>{v.phone}</span>
                  </td>
                  <td className="py-3 px-3 text-[#4B5563]">{v.city}</td>
                  <td className="py-3 px-3 font-semibold text-amber-600">★ {v.rating}</td>
                  <td className="py-3 px-3 text-[#1A1F2C]">{v.on_time_percentage}%</td>
                  <td className="py-3 px-3 text-[#1A1F2C]">{v.bill_variance_percentage}%</td>
                  <td className="py-3 px-3 font-mono text-[11px] text-[#6B7280]">{v.gst_number || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Vendor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-[#EAE3D9] shadow-lg max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#EAE3D9]">
              <h3 className="text-lg font-serif text-[#1A1F2C]">Register Vendor Partner</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#6B7280] hover:text-[#1A1F2C]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVendor} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#6B7280] mb-1">Business Name</label>
                  <input
                    type="text"
                    required
                    value={newBizName}
                    onChange={(e) => setNewBizName(e.target.value)}
                    placeholder="e.g. Rajputana Royal Decorators"
                    className="w-full p-2 bg-[#FAF8F5] border border-[#EAE3D9] rounded text-[#1A1F2C]"
                  />
                </div>
                <div>
                  <label className="block text-[#6B7280] mb-1">Contact Person</label>
                  <input
                    type="text"
                    required
                    value={newContactPerson}
                    onChange={(e) => setNewContactPerson(e.target.value)}
                    placeholder="e.g. Gordhan Singh"
                    className="w-full p-2 bg-[#FAF8F5] border border-[#EAE3D9] rounded text-[#1A1F2C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#6B7280] mb-1">Category (12 Specialties)</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-2 bg-[#FAF8F5] border border-[#EAE3D9] rounded text-[#1A1F2C]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#6B7280] mb-1">City Hub</label>
                  <select
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full p-2 bg-[#FAF8F5] border border-[#EAE3D9] rounded text-[#1A1F2C]"
                  >
                    <option value="Jaipur">Jaipur</option>
                    <option value="Udaipur">Udaipur</option>
                    <option value="Jodhpur">Jodhpur</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#6B7280] mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+91 98290 12345"
                    className="w-full p-2 bg-[#FAF8F5] border border-[#EAE3D9] rounded text-[#1A1F2C]"
                  />
                </div>
                <div>
                  <label className="block text-[#6B7280] mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="vendor@heritage.in"
                    className="w-full p-2 bg-[#FAF8F5] border border-[#EAE3D9] rounded text-[#1A1F2C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#6B7280] mb-1">GSTIN (Optional)</label>
                <input
                  type="text"
                  value={newGst}
                  onChange={(e) => setNewGst(e.target.value)}
                  placeholder="08AAAAA0000A1Z5"
                  className="w-full p-2 bg-[#FAF8F5] border border-[#EAE3D9] rounded text-[#1A1F2C]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-[#F4EFEA] text-[#1A1F2C] rounded hover:bg-[#EAE3D9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1A1F2C] text-[#FAF8F5] rounded font-medium hover:bg-[#2C3444]"
                >
                  Save Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

