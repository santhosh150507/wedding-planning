import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Sparkles, AlertCircle, IndianRupee, ShieldCheck } from 'lucide-react';
import { reportsApi } from '../api/endpoints';
import { SeasonProfitability } from '../types';

export const PublicSharedReportPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<SeasonProfitability | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    const fetchReport = async () => {
      try {
        setLoading(true);
        const res = await reportsApi.getPublicSharedReport(token);
        setData(res);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'This shared executive report link is invalid or has expired.');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Sparkles className="w-8 h-8 text-[#C5A880] mx-auto animate-pulse" />
          <p className="text-sm font-serif text-[#1A1F2C]">Loading executive season report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-6 rounded-lg border border-[#EAE3D9] shadow-sm text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
          <h1 className="text-lg font-serif text-[#1A1F2C]">Executive Link Inactive</h1>
          <p className="text-xs text-[#6B7280]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8 px-4 flex flex-col items-center">
      <div className="max-w-5xl w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <span className="text-xs font-mono font-semibold text-[#C5A880] tracking-widest uppercase">
            The Royal Knot • Executive Board Portal
          </span>
          <h1 className="text-2xl md:text-3xl font-serif text-[#1A1F2C]">Season 2026 Profitability & Margin Audit</h1>
          <p className="text-xs text-[#6B7280]">
            Confidential read-only financial metrics and wedding portfolio return analysis.
          </p>
        </div>

        {/* Season Summary Cards */}
        {data && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-white rounded-lg border border-[#EAE3D9] shadow-2xs">
              <span className="text-[#6B7280] block">Gross Season Revenue</span>
              <span className="text-xl font-serif font-bold text-[#1A1F2C] block">
                ₹{data.total_revenue.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="p-4 bg-white rounded-lg border border-[#EAE3D9] shadow-2xs">
              <span className="text-[#6B7280] block">Vendor Outflows</span>
              <span className="text-xl font-serif font-bold text-rose-700 block">
                ₹{data.total_vendor_expenses.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <span className="text-emerald-800 block font-medium">Net Operating Profit</span>
              <span className="text-xl font-serif font-bold text-emerald-950 block">
                ₹{data.total_profit.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="p-4 bg-white rounded-lg border border-[#EAE3D9] shadow-2xs">
              <span className="text-[#6B7280] block">Overall Profit Margin</span>
              <span className="text-xl font-serif font-bold text-[#C5A880] block">
                {data.overall_margin_percentage}%
              </span>
            </div>
          </div>
        )}

        {/* Portfolio Table */}
        <div className="bg-white rounded-lg border border-[#EAE3D9] shadow-sm overflow-hidden p-5 space-y-3">
          <h2 className="text-base font-serif font-bold text-[#1A1F2C]">Portfolio Performance Summary</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-y border-[#EAE3D9] text-[#6B7280]">
                <tr>
                  <th className="py-2.5 px-3">Wedding</th>
                  <th className="py-2.5 px-3">Destination</th>
                  <th className="py-2.5 px-3">Revenue</th>
                  <th className="py-2.5 px-3">Total Cost</th>
                  <th className="py-2.5 px-3">Net Profit</th>
                  <th className="py-2.5 px-3">Margin</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE3D9]">
                {data?.weddings_ranking.map((row) => (
                  <tr key={row.wedding_id} className="hover:bg-[#FAF8F5]">
                    <td className="py-3 px-3 font-semibold text-[#1A1F2C]">{row.couple_title}</td>
                    <td className="py-3 px-3 text-[#4B5563]">{row.destination}</td>
                    <td className="py-3 px-3 font-semibold">₹{row.revenue.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-[#6B7280]">₹{row.total_cost.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 font-bold">
                      <span className={row.is_loss_making ? 'text-rose-700' : 'text-emerald-700'}>
                        {row.net_profit < 0 ? '-' : ''}₹{Math.abs(row.net_profit).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold">
                      <span className={row.is_loss_making ? 'text-rose-700' : 'text-emerald-700'}>
                        {row.margin_percentage}%
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        row.is_loss_making ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {row.is_loss_making ? 'Loss-Making' : 'Profitable'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

