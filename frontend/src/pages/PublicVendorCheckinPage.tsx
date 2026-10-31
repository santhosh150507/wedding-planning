import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, Clock, MapPin, Sparkles, AlertCircle } from 'lucide-react';
import { liveOpsApi } from '../api/endpoints';

export const PublicVendorCheckinPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConfirmArrival = async () => {
    if (!token) return;
    try {
      setSubmitting(true);
      const res = await liveOpsApi.publicArrival(token);
      setResult(res);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid or expired check-in link.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg border border-[#EAE3D9] shadow-sm text-center space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-mono font-semibold text-[#C5A880] tracking-widest uppercase block">
            The Royal Knot • On-Site Gate
          </span>
          <h1 className="text-2xl font-serif text-[#1A1F2C]">Supplier Arrival Check-in</h1>
          <p className="text-xs text-[#6B7280]">
            Confirm your physical arrival at the venue security desk to notify the Lead Wedding Planner.
          </p>
        </div>

        {error ? (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded text-xs text-rose-900 space-y-2">
            <AlertCircle className="w-6 h-6 text-rose-600 mx-auto" />
            <p>{error}</p>
          </div>
        ) : result ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-900 space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-700 mx-auto" />
            <span className="text-sm font-bold block text-emerald-950">Arrival Confirmed!</span>
            <p>{result.message}</p>
            <span className="text-[10px] text-emerald-800 font-mono block">
              Checked In: {new Date(result.arrived_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <button
              onClick={handleConfirmArrival}
              disabled={submitting}
              className="w-full py-4 bg-[#1B4332] text-[#FAF8F5] rounded-lg text-sm font-bold hover:bg-[#133024] transition-all shadow-md flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5 text-[#C5A880]" />
              <span>{submitting ? 'Verifying Arrival...' : "I've Arrived at the Palace"}</span>
            </button>
            <span className="text-[11px] text-[#6B7280] block">
              Tapping confirms you are present on-site with your team and ready for stage mobilization.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

