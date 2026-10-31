import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import { 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  Download, 
  Sparkles, 
  AlertCircle,
  Clock,
  Calendar,
  MapPin,
  Lock
} from 'lucide-react';
import { contractApi } from '../api/endpoints';

export const PublicSignPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [context, setContext] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Signature state
  const sigPadRef = useRef<SignatureCanvas | null>(null);
  const [signerName, setSignerName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [signedSuccess, setSignedSuccess] = useState<any | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing signing token.');
      setLoading(false);
      return;
    }

    const fetchContext = async () => {
      try {
        setLoading(true);
        const data = await contractApi.getPublicContext(token);
        setContext(data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'This signing link is invalid or has expired.');
      } finally {
        setLoading(false);
      }
    };

    fetchContext();
  }, [token]);

  const handleClearSignature = () => {
    if (sigPadRef.current) {
      sigPadRef.current.clear();
    }
  };

  const handleSignAgreement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!signerName.trim()) {
      alert('Please enter your full legal name.');
      return;
    }

    if (!sigPadRef.current || sigPadRef.current.isEmpty()) {
      alert('Please provide your digital signature on the canvas.');
      return;
    }

    const signatureDataUrl = sigPadRef.current.toDataURL('image/png');

    try {
      setSubmitting(true);
      const res = await contractApi.signPublicContract(token, {
        signed_by_name: signerName.trim(),
        signature_image: signatureDataUrl
      });
      setSignedSuccess(res);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to record signature.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Sparkles className="w-8 h-8 text-[#C5A880] mx-auto animate-pulse" />
          <p className="text-sm font-serif text-[#1A1F2C]">Verifying secure royal contract link...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-6 rounded-lg border border-[#EAE3D9] shadow-sm text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
          <h1 className="text-lg font-serif text-[#1A1F2C]">Link Inactive or Expired</h1>
          <p className="text-xs text-[#6B7280] leading-relaxed">{error}</p>
          <div className="pt-2">
            <span className="text-[11px] text-[#C5A880] block font-mono">The Royal Knot Concierge Service</span>
          </div>
        </div>
      </div>
    );
  }

  // Success view
  if (signedSuccess) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white p-8 rounded-lg border border-[#EAE3D9] shadow-md text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-2xl font-serif text-[#1A1F2C]">Agreement Digitally Executed</h1>
            <p className="text-xs text-[#6B7280] mt-1">
              Your royal wedding agreement has been cryptographically signed and archived.
            </p>
          </div>

          <div className="p-4 bg-[#FAF8F5] border border-[#EAE3D9] rounded-lg text-xs space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Contract Number:</span>
              <span className="font-mono font-semibold text-[#1A1F2C]">{signedSuccess.contract_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Executed On:</span>
              <span className="font-medium text-[#1A1F2C]">
                {new Date(signedSuccess.signed_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Security Hash:</span>
              <span className="font-mono text-[10px] text-emerald-700">SHA-256 Verified (IP Recorded)</span>
            </div>
          </div>

          {signedSuccess.pdf_url && (
            <a
              href={`http://127.0.0.1:8000${signedSuccess.pdf_url}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 bg-[#1A1F2C] text-[#FAF8F5] rounded text-xs font-medium hover:bg-[#2C3444] flex items-center justify-center gap-2 shadow-sm"
            >
              <Download className="w-4 h-4 text-[#C5A880]" />
              <span>Download Signed PDF Service Agreement</span>
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8 px-4 flex flex-col items-center">
      <div className="max-w-2xl w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-[#C5A880] uppercase">
            <span>The Royal Knot</span>
            <span>•</span>
            <span>Jaipur & Udaipur</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif text-[#1A1F2C]">Service Agreement Execution</h1>
          <p className="text-xs text-[#6B7280]">
            Review and digitally execute your luxury wedding curation agreement.
          </p>
        </div>

        {/* Contract Summary Box */}
        <div className="bg-white p-6 rounded-lg border border-[#EAE3D9] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D9]">
            <div>
              <span className="text-xs font-mono text-[#C5A880]">{context.contract_number}</span>
              <h2 className="text-lg font-serif text-[#1A1F2C]">{context.couple}</h2>
            </div>
            <div className="text-right text-xs">
              <span className="text-[#6B7280] block">Destination</span>
              <span className="font-medium text-[#1A1F2C]">{context.destination}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[#6B7280] block">Celebration Date</span>
              <span className="font-medium text-[#1A1F2C]">
                {new Date(context.wedding_date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
              </span>
            </div>
            <div>
              <span className="text-[#6B7280] block">Agreed Curation Fee</span>
              <span className="font-bold text-sm text-[#1A1F2C]">
                INR ₹{context.total_amount?.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Legal Terms Scrollbox */}
          <div>
            <label className="block text-xs font-semibold text-[#1A1F2C] mb-1">Contractual Clauses & Scope</label>
            <div className="p-4 bg-[#FAF8F5] border border-[#EAE3D9] rounded text-[11px] text-[#4B5563] leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap font-sans">
              {context.terms_content}
            </div>
          </div>

          {/* Staged Milestones Info */}
          <div className="p-3 bg-[#FAF8F5] rounded border border-[#EAE3D9] text-xs space-y-1">
            <span className="font-semibold text-[#1A1F2C] block">Payment Schedule Acknowledgment:</span>
            <ul className="list-disc pl-4 text-[#4B5563] space-y-0.5 text-[11px]">
              <li>25% Booking Deposit due upon execution of this agreement.</li>
              <li>50% Advance Payment due 30 days prior to celebration.</li>
              <li>25% Final Settlement due post-event reconciliation.</li>
            </ul>
          </div>
        </div>

        {/* Digital Signature Card */}
        <form onSubmit={handleSignAgreement} className="bg-white p-6 rounded-lg border border-[#EAE3D9] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-serif font-semibold text-[#1A1F2C] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#C5A880]" />
              <span>Digital Signature Authorization</span>
            </h3>
            <button
              type="button"
              onClick={handleClearSignature}
              className="text-xs text-[#C5A880] hover:underline"
            >
              Clear Canvas
            </button>
          </div>

          <div>
            <label className="block text-xs text-[#6B7280] mb-1">Full Legal Signer Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Kabir Mathur"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              className="w-full p-2.5 bg-[#FAF8F5] border border-[#EAE3D9] rounded text-xs text-[#1A1F2C] focus:ring-1 focus:ring-[#C5A880] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-[#6B7280] mb-1">Draw Signature Below (Touch or Mouse)</label>
            <div className="border border-[#EAE3D9] rounded bg-[#FAF8F5] overflow-hidden">
              <SignatureCanvas
                ref={(ref) => { sigPadRef.current = ref; }}
                canvasProps={{
                  className: 'w-full h-44 cursor-crosshair bg-[#FAF8F5]'
                }}
              />
            </div>
          </div>

          <div className="text-[11px] text-[#6B7280] flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Digital signature, IP address, and timestamp will be permanently bound into the legal agreement.</span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#1A1F2C] text-[#FAF8F5] rounded text-xs font-semibold hover:bg-[#2C3444] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4 text-[#C5A880]" />
            <span>{submitting ? 'Executing Agreement...' : 'Sign & Confirm Service Agreement'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

