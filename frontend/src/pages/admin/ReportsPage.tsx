import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  TrendingUp, 
  Download, 
  Share2, 
  AlertTriangle, 
  CheckCircle2, 
  IndianRupee, 
  Calendar, 
  FileText,
  Copy,
  Sparkles
} from 'lucide-react';
import { reportsApi } from '../../api/endpoints';
import { SeasonProfitability } from '../../types';

export const ReportsPage: React.FC = () => {
  const [seasonData, setSeasonData] = useState<SeasonProfitability | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    fetchSeasonData();
  }, []);

  const fetchSeasonData = async () => {
    try {
      setLoading(true);
      const data = await reportsApi.getSeasonProfitability(2026);
      setSeasonData(data);
    } catch (err) {
      console.error('Failed to load season profitability report', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateShareLink = async () => {
    try {
      const res = await reportsApi.createShareLink();
      setShareLink(`${window.location.origin}${res.share_link}`);
    } catch (err) {
      alert('Failed to generate share link');
    }
  };

  const copyShareLink = () => {
    if (!shareLink) return;
    navigator.clipboard.writeText(shareLink);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  const downloadCsv = () => {
    window.open('http://127.0.0.1:8000/api/v1/reports/export/csv', '_blank');
  };

  const downloadPdf = () => {
    window.open('http://127.0.0.1:8000/api/v1/reports/export/pdf', '_blank');
  };

  const chartData = seasonData?.weddings_ranking.map((w) => ({
    name: w.couple_title.split('&')[0].trim(),
    revenue: w.revenue / 100000,
    cost: w.total_cost / 100000,
    profit: w.net_profit / 100000
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#EAE3D9]">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif text-[#1A1F2C] flex items-center gap-2">
            <span>Executive Profitability & Season Analytics</span>
            <span className="text-sm font-sans font-normal px-2.5 py-1 bg-[#F4EFEA] text-[#C5A880] rounded border border-[#EAE3D9]">
              Season 2026
            </span>
          </h1>
          <p className="text-sm text-[#6B7280] mt-1 font-sans">
            Revenue – (Vendor Disbursements + Direct Expenses + Team Hours * Cost Rate) with loss-making wedding alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={downloadCsv}
            className="px-3.5 py-2 bg-[#FAF8F5] border border-[#EAE3D9] text-[#1A1F2C] rounded text-xs font-medium hover:bg-[#F4EFEA] flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={downloadPdf}
            className="px-3.5 py-2 bg-[#1A1F2C] text-[#FAF8F5] rounded text-xs font-medium hover:bg-[#2C3444] flex items-center gap-1.5 shadow-xs"
          >
            <FileText className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Download PDF Report</span>
          </button>
          <button
            onClick={handleGenerateShareLink}
            className="px-3.5 py-2 bg-[#1B4332] text-[#FAF8F5] rounded text-xs font-medium hover:bg-[#133024] flex items-center gap-1.5 shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Shareable Link</span>
          </button>
        </div>
      </div>

      {/* Share Link Banner */}
      {shareLink && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs space-y-2">
          <span className="font-semibold text-emerald-950 block">Expiring Executive Share Link (3 Days Validity):</span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareLink}
              className="flex-1 p-2 bg-white border border-emerald-300 rounded font-mono text-[11px] text-[#1A1F2C]"
            />
            <button
              onClick={copyShareLink}
              className="px-3 py-2 bg-emerald-700 text-white rounded font-medium flex items-center gap-1 hover:bg-emerald-800"
            >
              <Copy className="w-3 h-3" />
              <span>{copySuccess ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
          <span className="text-[11px] text-emerald-800">
            Shareholders can view real-time season profitability without requiring internal agency login credentials.
          </span>
        </div>
      )}

      {/* Season Totals Cards */}
      {seasonData && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-xs">
          <div className="p-4 bg-white rounded-lg border border-[#EAE3D9] shadow-2xs space-y-1">
            <span className="text-[#6B7280]">Total Season Revenue</span>
            <span className="text-xl font-serif font-bold text-[#1A1F2C] block">
              ₹{seasonData.total_revenue.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-[#C5A880]">25 Target Luxury Weddings</span>
          </div>

          <div className="p-4 bg-[#FAF8F5] rounded-lg border border-[#EAE3D9] shadow-2xs space-y-1">
            <span className="text-[#6B7280]">Vendor Outflows</span>
            <span className="text-xl font-serif font-bold text-[#1A1F2C] block">
              ₹{seasonData.total_vendor_expenses.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-[#6B7280]">Turnkey palace suppliers</span>
          </div>

          <div className="p-4 bg-[#FAF8F5] rounded-lg border border-[#EAE3D9] shadow-2xs space-y-1">
            <span className="text-[#6B7280]">Internal Team Costs</span>
            <span className="text-xl font-serif font-bold text-[#1A1F2C] block">
              ₹{seasonData.total_team_costs.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-[#6B7280]">Hourly logged time entries</span>
          </div>

          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 space-y-1">
            <span className="text-emerald-800">Net Season Profit</span>
            <span className="text-xl font-serif font-bold text-emerald-900 block">
              ₹{seasonData.total_profit.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold">
              {seasonData.overall_margin_percentage}% Operating Margin
            </span>
          </div>

          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 space-y-1">
            <span className="text-amber-800">Receivables Next 30 Days</span>
            <span className="text-xl font-serif font-bold text-amber-900 block">
              ₹{seasonData.receivables_due_next_30_days.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-amber-700">Scheduled client milestones</span>
          </div>
        </div>
      )}

      {/* Visual Chart */}
      <div className="bg-white p-5 rounded-lg border border-[#EAE3D9] shadow-sm space-y-4">
        <h2 className="text-base font-serif font-bold text-[#1A1F2C]">Revenue vs Total Cost vs Net Profit (₹ Lakhs)</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F4EFEA" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
              <Tooltip 
                formatter={(val: any) => [`₹${(val * 100000).toLocaleString('en-IN')}`, 'Amount']} 
                contentStyle={{ backgroundColor: '#FAF8F5', borderColor: '#EAE3D9', fontSize: '11px' }} 
              />
              <Bar dataKey="revenue" name="Revenue" fill="#C5A880" />
              <Bar dataKey="cost" name="Total Cost" fill="#94A3B8" />
              <Bar dataKey="profit" name="Net Profit" fill="#1B4332" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Season-Wide Weddings Profit Ranking Table (Highlighting Loss-Making) */}
      <div className="bg-white rounded-lg border border-[#EAE3D9] shadow-sm overflow-hidden p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#EAE3D9]">
          <h2 className="text-base font-serif font-bold text-[#1A1F2C]">Season Wedding Profitability Rankings</h2>
          <span className="text-xs text-[#6B7280]">Sorted by net profit descending</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-y border-[#EAE3D9] text-[#6B7280]">
              <tr>
                <th className="py-2.5 px-3">Wedding / Couple</th>
                <th className="py-2.5 px-3">Destination</th>
                <th className="py-2.5 px-3">Revenue</th>
                <th className="py-2.5 px-3">Vendor Costs</th>
                <th className="py-2.5 px-3">Team Costs</th>
                <th className="py-2.5 px-3">Direct Exp</th>
                <th className="py-2.5 px-3">Net Profit</th>
                <th className="py-2.5 px-3">Margin %</th>
                <th className="py-2.5 px-3">Audit Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE3D9]">
              {seasonData?.weddings_ranking.map((row) => (
                <tr 
                  key={row.wedding_id} 
                  className={`hover:bg-[#FAF8F5] ${row.is_loss_making ? 'bg-rose-50/50' : ''}`}
                >
                  <td className="py-3 px-3">
                    <span className="font-semibold text-[#1A1F2C] block">{row.couple_title}</span>
                    <span className="font-mono text-[10px] text-[#C5A880]">{row.wedding_number}</span>
                  </td>
                  <td className="py-3 px-3 text-[#4B5563]">{row.destination}</td>
                  <td className="py-3 px-3 font-semibold text-[#1A1F2C]">₹{row.revenue.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3 text-[#6B7280]">₹{row.vendor_expenses.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3 text-[#6B7280]">₹{row.team_costs.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3 text-[#6B7280]">₹{row.direct_expenses.toLocaleString('en-IN')}</td>
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
                    {row.is_loss_making ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white flex items-center gap-1 w-max">
                        <AlertTriangle className="w-3 h-3" /> LOSS-MAKING
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        ✓ Profitable
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

