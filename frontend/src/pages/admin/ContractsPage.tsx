import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Send, 
  CheckCircle2, 
  Clock, 
  Download, 
  ExternalLink, 
  Copy, 
  Plus, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';
import { enquiryApi, contractApi } from '../../api/endpoints';
import { Enquiry } from '../../types';

export const ContractsPage: React.FC = () => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);

  // Contract Generation Form
  const [packageType, setPackageType] = useState('full_service');
  const [totalAmount, setTotalAmount] = useState(25000000);
  const [generatedContract, setGeneratedContract] = useState<any | null>(null);
  const [signingLinkData, setSigningLinkData] = useState<{ signing_link: string; token: string; expires_at: string } | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const data = await enquiryApi.list();
      setEnquiries(data);
      if (data.length > 0) {
        setSelectedEnquiry(data[0]);
        setTotalAmount(data[0].budget_max || 25000000);
      }
    } catch (err) {
      console.error('Failed to fetch enquiries for contracts', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateContract = async () => {
    if (!selectedEnquiry) return;
    try {
      const res = await contractApi.generateContract({
        enquiry_id: selectedEnquiry.id,
        package_type: packageType,
        total_amount: Number(totalAmount)
      });
      setGeneratedContract(res);
    } catch (err) {
      alert('Failed to generate contract');
    }
  };

  const handleSendSigningLink = async () => {
    if (!generatedContract || !selectedEnquiry) return;
    try {
      const res = await contractApi.sendContract(generatedContract.id, {
        recipient_email: selectedEnquiry.email,
        recipient_name: `${selectedEnquiry.bride_name} & ${selectedEnquiry.groom_name}`
      });
      setSigningLinkData(res);
    } catch (err) {
      alert('Failed to generate signing link');
    }
  };

  const copyToClipboard = () => {
    if (!signingLinkData) return;
    const fullUrl = `${window.location.origin}${signingLinkData.signing_link}`;
    navigator.clipboard.writeText(fullUrl);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#EAE3D9]">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif text-[#1A1F2C] flex items-center gap-2">
            <span>Contracts & Proposals Hub</span>
            <span className="text-sm font-sans font-normal px-2.5 py-1 bg-[#F4EFEA] text-[#C5A880] rounded border border-[#EAE3D9]">
              Legal Engine
            </span>
          </h1>
          <p className="text-sm text-[#6B7280] mt-1 font-sans">
            Prepare turnkey proposals, generate formal Service Agreements, and dispatch mobile token links with cryptographic audit capture.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Enquiries list */}
        <div className="bg-white p-4 rounded-lg border border-[#EAE3D9] shadow-sm space-y-3">
          <h2 className="text-sm font-serif font-semibold text-[#1A1F2C] pb-2 border-b border-[#EAE3D9]">
            Select Client Enquiry
          </h2>
          {loading ? (
            <p className="text-xs text-[#6B7280]">Loading client records...</p>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {enquiries.map((enq) => (
                <div
                  key={enq.id}
                  onClick={() => {
                    setSelectedEnquiry(enq);
                    setTotalAmount(enq.budget_max || 25000000);
                    setGeneratedContract(null);
                    setSigningLinkData(null);
                  }}
                  className={`p-3 rounded border text-xs cursor-pointer transition-all ${
                    selectedEnquiry?.id === enq.id
                      ? 'bg-[#FAF8F5] border-[#C5A880] shadow-xs'
                      : 'border-[#EAE3D9] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-[#1A1F2C]">{enq.bride_name} & {enq.groom_name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-[#F4EFEA] text-[#C5A880]">
                      {enq.status}
                    </span>
                  </div>
                  <span className="text-[#6B7280] block">{enq.destination} • {enq.guest_count} Guests</span>
                  <span className="text-[#9CA3AF] text-[10px] block mt-1">{enq.enquiry_number}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Middle & Right: Contract Workflow */}
        <div className="lg:col-span-2 space-y-6">
          {selectedEnquiry ? (
            <div className="bg-white p-6 rounded-lg border border-[#EAE3D9] shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D9]">
                <div>
                  <span className="text-xs font-mono text-[#C5A880]">{selectedEnquiry.enquiry_number}</span>
                  <h2 className="text-xl font-serif text-[#1A1F2C]">{selectedEnquiry.bride_name} & {selectedEnquiry.groom_name}</h2>
                </div>
                <div className="text-right text-xs text-[#6B7280]">
                  <span>Preferred Date: {new Date(selectedEnquiry.preferred_date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                </div>
              </div>

              {/* Step 1: Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[#6B7280] mb-1 font-medium">Package Level</label>
                  <select
                    value={packageType}
                    onChange={(e) => setPackageType(e.target.value)}
                    className="w-full p-2 bg-[#FAF8F5] border border-[#EAE3D9] rounded text-[#1A1F2C]"
                  >
                    <option value="full_service">Full-Service Royal Palatial Curation</option>
                    <option value="partial_day_of">Partial / Day-of Management</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#6B7280] mb-1 font-medium">Agreed Management Fee (INR ₹)</label>
                  <input
                    type="number"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(Number(e.target.value))}
                    className="w-full p-2 bg-[#FAF8F5] border border-[#EAE3D9] rounded text-[#1A1F2C]"
                  />
                </div>
              </div>

              {/* Action: Generate Contract */}
              {!generatedContract && (
                <button
                  onClick={handleGenerateContract}
                  className="w-full py-2.5 bg-[#1A1F2C] text-[#FAF8F5] rounded text-xs font-medium hover:bg-[#2C3444] flex items-center justify-center gap-2 shadow-sm"
                >
                  <FileText className="w-4 h-4 text-[#C5A880]" />
                  <span>Generate Official Service Agreement</span>
                </button>
              )}

              {/* Step 2: Generated Contract Details */}
              {generatedContract && (
                <div className="p-4 bg-[#FAF8F5] border border-[#EAE3D9] rounded-lg space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-[#C5A880] font-semibold block">{generatedContract.contract_number}</span>
                      <span className="text-sm font-serif font-bold text-[#1A1F2C]">Agreement Ready for Client Execution</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold text-[11px]">
                      ● Status: {generatedContract.status}
                    </span>
                  </div>

                  <div className="p-3 bg-white border border-[#EAE3D9] rounded text-[#4B5563] leading-relaxed max-h-48 overflow-y-auto font-mono text-[11px] whitespace-pre-wrap">
                    {generatedContract.terms_content}
                  </div>

                  {/* Staged Payment Milestones Breakdown */}
                  <div className="p-3 bg-white border border-[#EAE3D9] rounded space-y-1.5">
                    <span className="font-semibold text-[#1A1F2C] block">Staged Payment Architecture:</span>
                    <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                      <div className="p-2 bg-[#FAF8F5] rounded">
                        <span className="block text-[#6B7280]">Booking Deposit (25%)</span>
                        <span className="font-bold text-[#1A1F2C]">₹{(totalAmount * 0.25).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="p-2 bg-[#FAF8F5] rounded">
                        <span className="block text-[#6B7280]">Advance Payment (50%)</span>
                        <span className="font-bold text-[#1A1F2C]">₹{(totalAmount * 0.50).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="p-2 bg-[#FAF8F5] rounded">
                        <span className="block text-[#6B7280]">Final Settlement (25%)</span>
                        <span className="font-bold text-[#1A1F2C]">₹{(totalAmount * 0.25).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Send Link Button */}
                  {!signingLinkData ? (
                    <button
                      onClick={handleSendSigningLink}
                      className="w-full py-2 bg-[#1B4332] text-[#FAF8F5] rounded text-xs font-medium hover:bg-[#133024] flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>Generate Expiring Mobile Token Signing Link</span>
                    </button>
                  ) : (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded space-y-3">
                      <div className="flex items-center gap-2 text-emerald-900 font-semibold text-xs">
                        <ShieldCheck className="w-4 h-4 text-emerald-700" />
                        <span>Expiring Mobile Signing Link Active (7 Days Validity)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={`${window.location.origin}${signingLinkData.signing_link}`}
                          className="flex-1 p-2 bg-white border border-emerald-200 rounded font-mono text-[11px] text-[#1A1F2C]"
                        />
                        <button
                          onClick={copyToClipboard}
                          className="px-3 py-2 bg-emerald-700 text-white rounded text-xs hover:bg-emerald-800 flex items-center gap-1 font-medium"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{copySuccess ? 'Copied!' : 'Copy'}</span>
                        </button>
                        <a
                          href={signingLinkData.signing_link}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 bg-white border border-emerald-200 text-emerald-800 rounded hover:bg-emerald-100"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                      <p className="text-[11px] text-emerald-800">
                        Couple can open this link directly on mobile/tablet to draw their signature on the interactive canvas. IP and timestamp will be cryptographically bound.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-lg border border-[#EAE3D9] text-xs text-[#6B7280]">
              Select a client enquiry from the left panel to generate or view agreements.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

