import React, { useState, useEffect } from 'react';
import { 
  IndianRupee, 
  Search, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Clock, 
  ShieldCheck, 
  CreditCard,
  FileText,
  X
} from 'lucide-react';
import { financeApi, weddingApi } from '../../api/endpoints';
import { WeddingSummary, WeddingFinancials } from '../../types';

export const ClientPaymentsPage: React.FC = () => {
  const [weddings, setWeddings] = useState<WeddingSummary[]>([]);
  const [selectedWeddingId, setSelectedWeddingId] = useState<string>('');
  const [financials, setFinancials] = useState<WeddingFinancials | null>(null);
  const [loading, setLoading] = useState(true);

  // Record Payment Modal
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState<number>(5000000);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState('RTGS / Bank Transfer');
  const [txRef, setTxRef] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentError, setPaymentError] = useState<string | null>(null);

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
      if (data.milestones.length > 0) {
        setSelectedMilestoneId(data.milestones[0].id);
        setAmount(data.milestones[0].expected_amount);
      }
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

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWeddingId || !txRef) return;
    setPaymentError(null);

    try {
      await financeApi.recordClientPayment(selectedWeddingId, {
        amount: Number(amount),
        milestone_id: selectedMilestoneId || undefined,
        payment_method: paymentMethod,
        transaction_reference: txRef.trim(),
        notes: notes || undefined
      });
      setShowModal(false);
      setTxRef('');
      setNotes('');
      loadFinancials(selectedWeddingId);
    } catch (err: any) {
      setPaymentError(err.response?.data?.detail || 'Failed to record payment');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#EAE3D9]">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif text-[#1A1F2C] flex items-center gap-2">
            <span>Client Milestone Payments</span>
            <span className="text-sm font-sans font-normal px-2.5 py-1 bg-[#F4EFEA] text-[#C5A880] rounded border border-[#EAE3D9]">
              Staged Invoicing
            </span>
          </h1>
          <p className="text-sm text-[#6B7280] mt-1 font-sans">
            Track 25% Booking Deposit, 50% Advance, and 25% Final Settlement with automated PDF receipt generation.
          </p>
        </div>

        <button
          onClick={() => {
            setTxRef(`HDFC-RTGS-${Math.floor(100000 + Math.random() * 900000)}`);
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1A1F2C] text-[#FAF8F5] rounded text-sm font-medium hover:bg-[#2C3444] transition-all shadow-sm"
        >
          <Plus className="w-4 h-4 text-[#C5A880]" />
          <span>Record Client Payment</span>
        </button>
      </div>

      {/* Target Wedding Selector */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-lg border border-[#EAE3D9] shadow-sm">
        <span className="text-xs text-[#6B7280]">Target Wedding Workspace:</span>
        <select
          value={selectedWeddingId}
          onChange={(e) => handleWeddingChange(e.target.value)}
          className="p-1.5 bg-[#FAF8F5] border border-[#EAE3D9] rounded font-serif text-sm font-medium text-[#1A1F2C]"
        >
          {weddings.map((w) => (
            <option key={w.id} value={w.id}>
              {w.wedding_number} – {w.couple_title} (₹{w.agreed_budget.toLocaleString('en-IN')})
            </option>
          ))}
        </select>
      </div>

      {/* Top Financial Stat Cards */}
      {financials && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-white rounded-lg border border-[#EAE3D9] shadow-2xs space-y-1">
            <span className="text-[#6B7280]">Total Contracted Wedding Fee</span>
            <span className="text-xl font-serif font-bold text-[#1A1F2C] block">
              ₹{financials.agreed_budget.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-[#C5A880]">Turnkey Royal Scope</span>
          </div>

          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 space-y-1">
            <span className="text-emerald-800">Total Received to Date</span>
            <span className="text-xl font-serif font-bold text-emerald-900 block">
              ₹{financials.total_client_received.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-emerald-700">
              {((financials.total_client_received / (financials.agreed_budget || 1)) * 100).toFixed(1)}% Settled
            </span>
          </div>

          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 space-y-1">
            <span className="text-amber-800">Outstanding Balance</span>
            <span className="text-xl font-serif font-bold text-amber-900 block">
              ₹{financials.client_outstanding.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-amber-700">Scheduled Milestones</span>
          </div>

          <div className="p-4 bg-white rounded-lg border border-[#EAE3D9] shadow-2xs space-y-1">
            <span className="text-[#6B7280]">Billable Extras (Plates/Hours)</span>
            <span className="text-xl font-serif font-bold text-[#1A1F2C] block">
              ₹{financials.total_extras_billable.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-emerald-700">Added to Final Invoice</span>
          </div>
        </div>
      )}

      {/* Milestones Schedule */}
      <div className="bg-white p-6 rounded-lg border border-[#EAE3D9] shadow-sm space-y-4">
        <h2 className="text-base font-serif font-bold text-[#1A1F2C] pb-2 border-b border-[#EAE3D9]">
          Staged Milestone Schedule
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {financials?.milestones.map((m) => (
            <div
              key={m.id}
              className={`p-4 rounded-lg border text-xs space-y-2 ${
                m.status === 'Paid'
                  ? 'bg-emerald-50/50 border-emerald-300'
                  : 'bg-[#FAF8F5] border-[#EAE3D9]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-sm text-[#1A1F2C]">{m.milestone_name}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  m.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {m.status}
                </span>
              </div>

              <div className="text-lg font-serif font-bold text-[#1A1F2C]">
                ₹{m.expected_amount.toLocaleString('en-IN')}
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-[#6B7280] pt-1 border-t border-[#EAE3D9]/60">
                <Clock className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Due: {new Date(m.due_date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions History Table */}
      <div className="bg-white rounded-lg border border-[#EAE3D9] shadow-sm overflow-hidden p-4 space-y-3">
        <h2 className="text-base font-serif font-bold text-[#1A1F2C]">Payment Receipts & Transaction Ledger</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-y border-[#EAE3D9] text-[#6B7280]">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Transaction Reference</th>
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3">Amount Received</th>
                <th className="py-2.5 px-3">PDF Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE3D9]">
              {financials?.client_payments.map((cp) => (
                <tr key={cp.id} className="hover:bg-[#FAF8F5]">
                  <td className="py-3 px-3 text-[#4B5563]">
                    {new Date(cp.payment_date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                  </td>
                  <td className="py-3 px-3 font-mono font-semibold text-[#1A1F2C]">{cp.transaction_reference}</td>
                  <td className="py-3 px-3 text-[#6B7280]">{cp.payment_method}</td>
                  <td className="py-3 px-3 font-bold text-emerald-700">₹{cp.amount.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3">
                    {cp.receipt_pdf_url ? (
                      <a
                        href={`http://127.0.0.1:8000${cp.receipt_pdf_url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[#C5A880] hover:underline font-medium"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download PDF</span>
                      </a>
                    ) : (
                      <span className="text-[#9CA3AF]">Archived</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-[#EAE3D9] shadow-lg max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#EAE3D9]">
              <h3 className="text-base font-serif font-bold text-[#1A1F2C]">Record Client Payment</h3>
              <button onClick={() => setShowModal(false)}>
                <X className="w-4 h-4 text-[#6B7280]" />
              </button>
            </div>

            {paymentError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-900 text-xs">
                {paymentError}
              </div>
            )}

            <form onSubmit={handleRecordPayment} className="space-y-3">
              <div>
                <label className="block text-[#6B7280] mb-1">Allocated Milestone</label>
                <select
                  value={selectedMilestoneId}
                  onChange={(e) => setSelectedMilestoneId(e.target.value)}
                  className="w-full p-2 bg-[#FAF8F5] border border-[#EAE3D9] rounded text-[#1A1F2C]"
                >
                  {financials?.milestones.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.milestone_name} (₹{m.expected_amount.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#6B7280] mb-1">Amount Paid (INR ₹)</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full p-2 bg-[#FAF8F5] border border-[#EAE3D9] rounded text-[#1A1F2C]"
                />
              </div>

              <div>
                <label className="block text-[#6B7280] mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-2 bg-[#FAF8F5] border border-[#EAE3D9] rounded text-[#1A1F2C]"
                >
                  <option value="RTGS / Bank Transfer">RTGS / Bank Transfer</option>
                  <option value="NEFT">NEFT</option>
                  <option value="UPI / Online">UPI / Online Gateway</option>
                  <option value="Cheque">Banker Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-[#6B7280] mb-1">Transaction Reference (Unique)</label>
                <input
                  type="text"
                  required
                  value={txRef}
                  onChange={(e) => setTxRef(e.target.value)}
                  placeholder="e.g. HDFC-RTGS-998811"
                  className="w-full p-2 bg-[#FAF8F5] border border-[#EAE3D9] rounded font-mono text-[#1A1F2C]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 bg-[#F4EFEA] text-[#1A1F2C] rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1A1F2C] text-[#FAF8F5] rounded font-medium hover:bg-[#2C3444]"
                >
                  Issue Receipt & Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

