import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Crown,
  Heart,
  Users,
  IndianRupee,
  Calendar,
  AlertTriangle,
  Clock,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Receipt,
  CreditCard,
  Building2,
  Sparkles
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { dashboardApi } from '../../api/endpoints';
import { DashboardOverview } from '../../types';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setServerError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setIsLoading(true);
        const res = await dashboardApi.getOverview();
        setData(res);
      } catch (err: any) {
        setServerError('Failed to fetch agency dashboard statistics.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOverview();
  }, []);

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-10 h-10 border-3 border-[#C5A880] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <div className="font-serif text-lg text-[#1A1F2C]">Loading Operational Intelligence...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 bg-red-50 rounded-2xl border border-red-200 text-red-700 text-xs">
        {error || 'Unable to load dashboard data.'}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Title & Inactivity Alert Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-[#C5A880] font-semibold">
              Executive Overview
            </span>
            <span className="text-xs text-[#94A3B8]">&bull;</span>
            <span className="text-xs text-[#64748B]">Jaipur &bull; Udaipur Operations</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1F2C] mt-1">
            Agency Command Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/enquiries"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A1F2C] text-[#FAF8F5] text-xs font-semibold hover:bg-[#2C3444] transition-colors shadow-2xs"
          >
            <Users className="w-4 h-4 text-[#C5A880]" />
            <span>Manage Enquiries</span>
          </Link>
        </div>
      </div>

      {/* Flagged Inactive Enquiries Warning Banner (3+ days) */}
      {data.flagged_inactive_enquiries > 0 && (
        <div className="p-4 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F59E0B]/20 text-[#D97706] flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#92400E]">
                {data.flagged_inactive_enquiries} Enquiries Require Immediate Follow-Up
              </div>
              <div className="text-[11px] text-[#B45309] font-light">
                These luxury enquiries have had no client interaction for 3+ days. Do not let potential clients slip away.
              </div>
            </div>
          </div>
          <Link
            to="/admin/enquiries?filter=inactive"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#D97706] text-white text-xs font-semibold hover:bg-[#B45309] transition-colors shrink-0"
          >
            <span>Review Flagged</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Top 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Weddings Scale */}
        <div className="bg-white p-6 rounded-2xl border border-[#EAE3D9] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-medium">Total Weddings</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] text-[#C5A880] flex items-center justify-center border border-[#EAE3D9]">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-3xl text-[#1A1F2C] font-semibold">
            {data.total_weddings}
          </div>
          <div className="flex items-center gap-3 text-[11px] text-[#64748B] pt-1 border-t border-[#FAF8F5]">
            <span className="text-emerald-700 font-medium">{data.active_weddings} Active</span>
            <span>&bull;</span>
            <span className="text-[#C5A880] font-medium">{data.completed_weddings} Completed</span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-[#EAE3D9] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-medium">Collected Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-3xl text-[#1A1F2C] font-semibold">
            {formatCurrency(data.total_revenue)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#64748B] pt-1 border-t border-[#FAF8F5]">
            <span className="text-[#9D7B50] font-semibold">Pending Milestones:</span>
            <span>{formatCurrency(data.pending_client_payments)}</span>
          </div>
        </div>

        {/* Total Expenses & Outflows */}
        <div className="bg-white p-6 rounded-2xl border border-[#EAE3D9] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-medium">Total Outflows &amp; Costs</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-100">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-3xl text-[#1A1F2C] font-semibold">
            {formatCurrency(data.total_expenses)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#64748B] pt-1 border-t border-[#FAF8F5]">
            <span className="text-[#9D7B50] font-semibold">Pending Vendor Bills:</span>
            <span>{formatCurrency(data.pending_vendor_payments)}</span>
          </div>
        </div>

        {/* Profit & Margin */}
        <div className="bg-white p-6 rounded-2xl border border-[#EAE3D9] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-medium">Net Profit (INR)</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] text-[#C5A880] flex items-center justify-center border border-[#EAE3D9]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-3xl text-emerald-800 font-semibold">
            {formatCurrency(data.overall_profit)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#64748B] pt-1 border-t border-[#FAF8F5]">
            <span className="font-semibold text-emerald-700">Margin: {data.profit_margin_percentage}%</span>
            <span>(Includes team cost)</span>
          </div>
        </div>
      </div>

      {/* Secondary Operational Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-[#EAE3D9] flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-lg bg-[#FAF8F5] text-[#C5A880] flex items-center justify-center border border-[#EAE3D9] shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-serif text-[#1A1F2C] font-semibold">{data.new_enquiries}</div>
            <div className="text-[11px] text-[#64748B]">New Website Enquiries</div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#EAE3D9] flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-serif text-[#1A1F2C] font-semibold">{data.confirmed_bookings}</div>
            <div className="text-[11px] text-[#64748B]">Confirmed Bookings</div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#EAE3D9] flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-serif text-[#1A1F2C] font-semibold">{data.upcoming_deadlines}</div>
            <div className="text-[11px] text-[#64748B]">Deadlines in 7 Days</div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#EAE3D9] flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-100 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-serif text-rose-700 font-semibold">{data.overdue_tasks}</div>
            <div className="text-[11px] text-[#64748B]">Overdue Tasks</div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue vs Expenses Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#EAE3D9] shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#FAF8F5] pb-3">
            <div>
              <h2 className="font-serif text-xl text-[#1A1F2C]">Financial Trends (Last 6 Months)</h2>
              <p className="text-[11px] text-[#64748B]">Revenue collected vs vendor and operating expenses in INR</p>
            </div>
            <span className="text-[10px] text-[#C5A880] font-semibold uppercase tracking-wider bg-[#FAF8F5] px-2.5 py-1 rounded border border-[#EAE3D9]">
              Reconciliation Active
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthly_financials} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={10}
                  tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                  contentStyle={{ backgroundColor: '#1A1F2C', borderRadius: '12px', color: '#FAF8F5', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="revenue" name="Revenue" fill="#C5A880" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#1A1F2C" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Wedding Status Distribution Donut Chart (1 col) */}
        <div className="bg-white p-6 rounded-2xl border border-[#EAE3D9] shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="font-serif text-xl text-[#1A1F2C]">Portfolio Status Mix</h2>
            <p className="text-[11px] text-[#64748B]">Distribution of current weddings</p>
          </div>

          <div className="h-56 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.wedding_status_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {data.wedding_status_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} Weddings`, name]}
                  contentStyle={{ backgroundColor: '#1A1F2C', borderRadius: '8px', color: '#FAF8F5', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="font-serif text-2xl font-bold text-[#1A1F2C]">{data.total_weddings}</span>
              <span className="text-[9px] uppercase tracking-wider text-[#94A3B8]">Weddings</span>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-[#FAF8F5]">
            {data.wedding_status_distribution.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[#475569]">{item.name}</span>
                </div>
                <span className="font-semibold text-[#1A1F2C]">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Section: Follow-Up Reminders & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CRM Follow-Up Reminders Widget */}
        <div className="bg-white p-6 rounded-2xl border border-[#EAE3D9] shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#FAF8F5] pb-3">
            <div>
              <h2 className="font-serif text-xl text-[#1A1F2C]">Enquiry Reminders &amp; Inactivity</h2>
              <p className="text-[11px] text-[#64748B]">Ensure no client communication is neglected</p>
            </div>
            <Link
              to="/admin/enquiries"
              className="text-xs text-[#9D7B50] font-semibold hover:text-[#1A1F2C] flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#FAF8F5] space-y-2">
            {data.follow_up_reminders.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#94A3B8]">
                All client enquiries have up-to-date communications.
              </div>
            ) : (
              data.follow_up_reminders.map((item) => (
                <div key={item.id} className="pt-2 flex items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#1A1F2C]">{item.couple}</span>
                      <span className="text-[10px] text-[#94A3B8] font-mono">({item.enquiry_number})</span>
                    </div>
                    <div className="text-[11px] text-[#64748B]">
                      Status: <span className="font-medium text-[#1A1F2C]">{item.status}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.is_stale ? (
                      <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                        {item.days_inactive}d Inactive
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-medium">
                        Active
                      </span>
                    )}
                    <Link
                      to={`/admin/enquiries/${item.id}`}
                      className="p-1.5 rounded-lg border border-[#EAE3D9] hover:bg-[#FAF8F5] text-[#1A1F2C]"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Recent Activities Timeline */}
        <div className="bg-white p-6 rounded-2xl border border-[#EAE3D9] shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#FAF8F5] pb-3">
            <div>
              <h2 className="font-serif text-xl text-[#1A1F2C]">Audit &amp; Activity Log</h2>
              <p className="text-[11px] text-[#64748B]">Chronological events across agency modules</p>
            </div>
            <span className="text-[10px] text-[#94A3B8]">Live System Audit</span>
          </div>

          <div className="divide-y divide-[#FAF8F5] space-y-2.5">
            {data.recent_activities.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#94A3B8]">
                No recent activity logged.
              </div>
            ) : (
              data.recent_activities.map((log) => (
                <div key={log.id} className="pt-2 flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-[#C5A880] mt-1.5 shrink-0" />
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#1A1F2C] text-[11px]">{log.action.replace(/_/g, ' ')}</span>
                      <span className="text-[10px] text-[#94A3B8]">
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#64748B] font-light">
                      By <span className="font-medium text-[#1A1F2C]">{log.user_name}</span> &bull;{' '}
                      {log.details ? JSON.stringify(log.details).slice(0, 50) : ''}...
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
