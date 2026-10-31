import React, { useState, useEffect } from 'react';
import { 
  IndianRupee, 
  Search, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileCheck, 
  Calculator,
  ShieldAlert,
  X
} from 'lucide-react';
import { financeApi, weddingApi } from '../../api/endpoints';
import { WeddingSummary, WeddingFinancials } from '../../types';

export const VendorPaymentsPage: React.FC = () => {
  const [weddings, setWeddings] = useState<WeddingSummary[]>([]);
  const [selectedWeddingId, setSelectedWeddingId] = useState<string>('');
  const [financials, setFinancials] = useState<WeddingFinancials | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showPayModal, setShowPayModal] = useState(false);
  const [showExtraModal, setShowExtraModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payTxRef, setPayTxRef] = useState('');
  const [payError, setPayError] = useState<string | null>(null);

  // Extras calculation state
  const [extraPlates, setExtraPlates] = useState<number>(60);
  const [extraHours, setExtraHours] = useState<number>(2.0);
  const [extraCategory, setExtraCategory] = useState('Catering');

  const fetchWeddings = async () => {
    try {
      setLoading(true);
      const wList = await weddingApi.list();
      setWeddings(wList);
      if (wList.length > 0) {
        const targetId = wList[0].id;
        setSelectedWeddingId(targetId);
        loadFinancials(targetId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadFinancials = async (wId: string) => {
    try {
      const data = await financeApi.getSummary(wId);
      setFinancials(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchWeddings();
  }, []);

  const handleWeddingChange = (wId: string) => {
    setSelectedWeddingId(wId);
    loadFinancials(wId);
  };

  const handleOpenPayModal = (inv: any) => {
    setSelectedInvoice(inv);
    const balance = inv.claimed_amount - inv.total_paid_towards_invoice;
    setPayAmount(balance > 0 ? balance : 0);
    setPayTxRef(`VPAY-${inv.invoice_number}-${Math.floor(100 + Math.random() * 900)}`);
    setPayError(null);
    setShowPayModal(true);
  };

  const handleRecordVendorPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWeddingId || !selectedInvoice || !payTxRef) return;
    setPayError(null);

    try {
      await financeApi.recordVendorPayment(selectedWeddingId, {
        vendor_invoice_id: selectedInvoice.id,
        amount: Number(payAmount),
        transaction_reference: payTxRef.trim()
      });
      setShowPayModal(false);
      loadFinancials(selectedWeddingId);
    } catch (err: any) {
      // Clear overpayment or duplicate error display
      setPayError(err.response?.data?.detail || 'Payment transaction failed');
    }
  };

  const handleCalculateRateCardExtras = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWeddingId || !financials?.settlement_checklist.length) return;
    try {
      const vendorId = financials.settlement_checklist[0].vendor_id;
      await financeApi.calculateExtraCharges(selectedWeddingId, {
        vendor_id: vendorId,
        category: extraCategory,
        extra_plates: Number(extraPlates),
        extra_hours: Number(extraHours)
      });
      setShowExtraModal(false);
      loadFinancials(selectedWeddingId);
    } catch (err) {
      alert('Failed to calculate rate card extras.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#EAE3D9]">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif text-[#1A1F2C] flex items-center gap-2">
            <span>Vendor Payments & Expense Reconciliation</span>
            <span className="text-sm font-sans font-normal px-2.5 py-1 bg-[#F4EFEA] text-[#C5A880] rounded border border-[#EAE3D9]">
              Reconciliation Hub
            </span>
          </h1>
          <p className="text-sm text-[#6B7280] mt-1 font-sans">
            Strict duplicate reference rejection, rate-card extra plate computations, and wedding settlement checklists.
          </p>
        </div>

        <button
          onClick={() => setShowExtraModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B4332] text-[#FAF8F5] rounded text-xs font-medium hover:bg-[#133024] transition-all shadow-sm"
        >
          <Calculator className="w-4 h-4 text-[#C5A880]" />
          <span>Calculate Rate Card Extras</span>
        </button>
      </div>

      {/* Target Wedding Selector */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-lg border border-[#EAE3D9] shadow-sm">
        <span className="text-xs text-[#6B7280]">Select Wedding:</span>
        <select
          value={selectedWeddingId}
          onChange={(e) => handleWeddingChange(e.target.value)}
          className="p-1.5 bg-[#FAF8F5] border border-[#EAE3D9] rounded font-serif text-sm font-medium text-[#1A1F2C]"
        >
          {weddings.map((w) => (
            <option key={w.id} value={w.id}>
              {w.wedding_number} – {w.couple_title}
            </option>
          ))}
        </select>
      </div>

      {/* Financial Health Bar */}
      {financials && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-white rounded-lg border border-[#EAE3D9] shadow-2xs space-y-1">
            <span className="text-[#6B7280]">Total Supplier Billed</span>
            <span className="text-xl font-serif font-bold text-[#1A1F2C] block">
              ₹{financials.total_vendor_invoiced.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-[#6B7280]">Agreed baseline + extras</span>
          </div>

          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 space-y-1">
            <span className="text-emerald-800">Total Disbursements Paid</span>
            <span className="text-xl font-serif font-bold text-emerald-900 block">
              ₹{financials.total_vendor_paid.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-emerald-700">Cleared through bank transfer</span>
          </div>

          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 space-y-1">
            <span className="text-amber-800">Payable Balance Outstanding</span>
            <span className="text-xl font-serif font-bold text-amber-900 block">
              ₹{financials.vendor_outstanding.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-amber-700">Pending final settlement</span>
          </div>

          <div className="p-4 bg-white rounded-lg border border-[#EAE3D9] shadow-2xs space-y-1">
            <span className="text-[#6B7280]">Wedding Settlement Checklist</span>
            <span className="text-xl font-serif font-bold text-[#1A1F2C] block">
              {financials.is_all_settled ? (
                <span className="text-emerald-700 flex items-center gap-1 font-sans text-sm">
                  <CheckCircle2 className="w-4 h-4" /> 100% Settled
                </span>
              ) : (
                <span className="text-amber-700 flex items-center gap-1 font-sans text-sm">
                  <Clock className="w-4 h-4" /> Pending Checklist
                </span>
              )}
            </span>
            <span className="text-[11px] text-[#6B7280]">All vendor bookings verified</span>
          </div>
        </div>
      )}

      {/* Vendor Invoices & Variance Audit Table */}
      <div className="bg-white rounded-lg border border-[#EAE3D9] shadow-sm overflow-hidden p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#EAE3D9]">
          <h2 className="text-base font-serif font-bold text-[#1A1F2C]">Vendor Invoices & Variance Audit</h2>
          <span className="text-xs text-[#6B7280]">Variance &gt; 5% automatically triggers audit flag</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-y border-[#EAE3D9] text-[#6B7280]">
              <tr>
                <th className="py-2.5 px-3">Supplier / Business</th>
                <th className="py-2.5 px-3">Invoice #</th>
                <th className="py-2.5 px-3">Claimed Billed</th>
                <th className="py-2.5 px-3">Agreed RFQ Baseline</th>
                <th className="py-2.5 px-3">Bill Variance</th>
                <th className="py-2.5 px-3">Paid so Far</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE3D9]">
              {financials?.vendor_invoices.map((inv) => {
                const isFlagged = inv.variance_status === 'Flagged';
                const balance = inv.claimed_amount - inv.total_paid_towards_invoice;
                const isFullyPaid = balance <= 0.01;

                return (
                  <tr key={inv.id} className="hover:bg-[#FAF8F5]">
                    <td className="py-3 px-3 font-semibold text-[#1A1F2C]">{inv.vendor_name}</td>
                    <td className="py-3 px-3 font-mono text-[#6B7280]">{inv.invoice_number}</td>
                    <td className="py-3 px-3 font-bold text-[#1A1F2C]">₹{inv.claimed_amount.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-[#4B5563]">₹{inv.agreed_baseline_amount.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3">
                      {inv.variance_amount > 0 ? (
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          isFlagged ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          +₹{inv.variance_amount.toLocaleString('en-IN')} ({isFlagged ? 'FLAGGED' : 'OK'})
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-medium">Exact Match (₹0)</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-emerald-700 font-medium">
                      ₹{inv.total_paid_towards_invoice.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        isFullyPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isFullyPaid ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {!isFullyPaid && (
                        <button
                          onClick={() => handleOpenPayModal(inv)}
                          className="px-2.5 py-1 bg-[#1A1F2C] text-[#FAF8F5] rounded text-[11px] font-medium hover:bg-[#2C3444]"
                        >
                          Disburse (₹{balance.toLocaleString('en-IN')})
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Wedding Settlement Checklist */}
      <div className="bg-white rounded-lg border border-[#EAE3D9] shadow-sm p-5 space-y-3">
        <h2 className="text-base font-serif font-bold text-[#1A1F2C]">Vendor Settlement Sign-Off Checklist</h2>
        <p className="text-xs text-[#6B7280]">
          Every contracted wedding supplier must submit a final invoice and have cleared all milestone payments prior to archiving.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-y border-[#EAE3D9] text-[#6B7280]">
              <tr>
                <th className="py-2.5 px-3">Vendor / Supplier</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Contracted Fee</th>
                <th className="py-2.5 px-3">Invoice Submitted</th>
                <th className="py-2.5 px-3">Total Paid</th>
                <th className="py-2.5 px-3">Checklist Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE3D9]">
              {financials?.settlement_checklist.map((item, idx) => (
                <tr key={idx} className="hover:bg-[#FAF8F5]">
                  <td className="py-3 px-3 font-semibold text-[#1A1F2C]">{item.vendor_name}</td>
                  <td className="py-3 px-3 text-[#4B5563]">{item.category}</td>
                  <td className="py-3 px-3">₹{item.agreed_amount.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3">
                    {item.has_invoice ? (
                      <span className="text-emerald-700 font-medium">✓ Received</span>
                    ) : (
                      <span className="text-rose-700 font-medium">Missing Bill</span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-medium">₹{item.total_paid.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3">
                    {item.is_fully_paid ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        ✓ Settled
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                        ⏳ Open Balance
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disburse Vendor Payment Modal */}
      {showPayModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-[#EAE3D9] shadow-lg max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#EAE3D9]">
              <h3 className="text-base font-serif font-bold text-[#1A1F2C]">Disburse Vendor Payment</h3>
              <button onClick={() => setShowPayModal(false)}>
                <X className="w-4 h-4 text-[#6B7280]" />
              </button>
            </div>

            {/* Error banner for overpayment or duplicate reference */}
            {payError && (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded text-xs text-rose-950 space-y-1">
                <span className="font-bold flex items-center gap-1 text-rose-900">
                  <ShieldAlert className="w-4 h-4 text-rose-600" /> Payment Rejected by Backend:
                </span>
                <p>{payError}</p>
              </div>
            )}

            <form onSubmit={handleRecordVendorPayment} className="space-y-3">
              <div>
                <label className="block text-[#6B7280] mb-1">Paying Supplier</label>
                <input
                  type="text"
                  disabled
                  value={selectedInvoice.vendor_name}
                  className="w-full p-2 bg-[#FAF8F5] border border-[#EAE3D9] rounded font-medium text-[#1A1F2C]"
                />
              </div>

              <div>
                <label className="block text-[#6B7280] mb-1">Amount to Pay (INR ₹)</label>
                <input
                  type="number"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full p-2 bg-[#FAF8F5] border border-[#EAE3D9] rounded text-[#1A1F2C]"
                />
                <span className="text-[10px] text-[#6B7280] block mt-0.5">
                  Max claimable remaining: ₹{(selectedInvoice.claimed_amount - selectedInvoice.total_paid_towards_invoice).toLocaleString('en-IN')}
                </span>
              </div>

              <div>
                <label className="block text-[#6B7280] mb-1">Unique Bank Transaction Reference</label>
                <input
                  type="text"
                  required
                  value={payTxRef}
                  onChange={(e) => setPayTxRef(e.target.value)}
                  className="w-full p-2 bg-[#FAF8F5] border border-[#EAE3D9] rounded font-mono text-[#1A1F2C]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="px-3 py-1.5 bg-[#F4EFEA] text-[#1A1F2C] rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1A1F2C] text-[#FAF8F5] rounded font-medium hover:bg-[#2C3444]"
                >
                  Confirm & Disburse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Extra Charges Calculator Modal */}
      {showExtraModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-[#EAE3D9] shadow-lg max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#EAE3D9]">
              <h3 className="text-base font-serif font-bold text-[#1A1F2C]">Calculate Rate Card Extras</h3>
              <button onClick={() => setShowExtraModal(false)}>
                <X className="w-4 h-4 text-[#6B7280]" />
              </button>
            </div>

            <p className="text-[#6B7280]">
              Calculate walk-in guest banqueting plates and curfew overtime charges directly from the accepted vendor rate card:
            </p>

            <form onSubmit={handleCalculateRateCardExtras} className="space-y-3">
              <div>
                <label className="block text-[#6B7280] mb-1">Additional Guest Plates</label>
                <input
                  type="number"
                  min="0"
                  value={extraPlates}
                  onChange={(e) => setExtraPlates(Number(e.target.value))}
                  placeholder="e.g. 60"
                  className="w-full p-2 bg-[#FAF8F5] border border-[#EAE3D9] rounded text-[#1A1F2C]"
                />
                <span className="text-[10px] text-[#6B7280] block mt-0.5">Calculated at vendor per-plate rate (e.g. ₹4,500)</span>
              </div>

              <div>
                <label className="block text-[#6B7280] mb-1">Curfew Overtime Hours</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={extraHours}
                  onChange={(e) => setExtraHours(Number(e.target.value))}
                  placeholder="e.g. 2.0"
                  className="w-full p-2 bg-[#FAF8F5] border border-[#EAE3D9] rounded text-[#1A1F2C]"
                />
                <span className="text-[10px] text-[#6B7280] block mt-0.5">Calculated at extra hour rate (e.g. ₹25,000/hr)</span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExtraModal(false)}
                  className="px-3 py-1.5 bg-[#F4EFEA] text-[#1A1F2C] rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1A1F2C] text-[#FAF8F5] rounded font-medium hover:bg-[#2C3444]"
                >
                  Add to Bill & Payables
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

