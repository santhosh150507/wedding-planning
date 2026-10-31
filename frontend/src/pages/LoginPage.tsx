import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Crown, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('founder@royalknot.in');
  const [password, setPassword] = useState('Royal@123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const demoAccounts = [
    { role: 'Founder / Super Admin', email: 'founder@royalknot.in', desc: 'Full agency & financial control' },
    { role: 'Administrator', email: 'admin@royalknot.in', desc: 'Staff & operational configuration' },
    { role: 'Wedding Planner', email: 'planner@royalknot.in', desc: 'Couples, vendors, tasks, day-of' },
    { role: 'Planning Staff', email: 'staff@royalknot.in', desc: 'On-site execution & arrival check-ins' },
    { role: 'Finance Manager', email: 'finance@royalknot.in', desc: 'Vendor bills, milestones & reconciliation' },
  ];

  const handleQuickFill = (accountEmail: string) => {
    setEmail(accountEmail);
    setPassword('Royal@123');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          'Failed to sign in. Please verify your credentials.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#C5A880]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#1A1F2C]/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3 relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 group">
          <div className="w-12 h-12 rounded-full bg-[#1A1F2C] border-2 border-[#C5A880] flex items-center justify-center text-[#C5A880] shadow-md">
            <Crown className="w-6 h-6 text-[#C5A880]" />
          </div>
        </Link>
        <h1 className="font-serif text-3xl font-semibold tracking-wider text-[#1A1F2C]">
          THE ROYAL KNOT
        </h1>
        <p className="text-xs uppercase tracking-[0.25em] text-[#C5A880] font-bold">
          Internal Management Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl sm:px-10 border border-[#EAE3D9] space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#1A1F2C]">Employee Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="planner@royalknot.in"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EAE3D9] text-xs focus:outline-none focus:border-[#C5A880] bg-[#FAF8F5]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#1A1F2C]">Secure Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EAE3D9] text-xs focus:outline-none focus:border-[#C5A880] bg-[#FAF8F5]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-full bg-[#1A1F2C] text-[#FAF8F5] text-xs uppercase tracking-widest font-bold border border-[#C5A880] hover:bg-[#2C3444] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#C5A880] border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In To Portal</span>
                  <ArrowRight className="w-4 h-4 text-[#C5A880]" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Role Selector */}
          <div className="pt-4 border-t border-[#EAE3D9] space-y-3">
            <div className="flex items-center justify-between text-[11px] text-[#64748B]">
              <span className="font-semibold uppercase tracking-wider text-[#9D7B50] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#C5A880]" />
                Instant Demo Role Switcher:
              </span>
              <span className="text-[10px] text-[#94A3B8]">Click to test role</span>
            </div>

            <div className="space-y-1.5">
              {demoAccounts.map((acc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickFill(acc.email)}
                  className={`w-full p-2 rounded-xl text-left text-xs transition-all border flex items-center justify-between ${
                    email === acc.email
                      ? 'bg-[#FAF8F5] border-[#C5A880] font-medium'
                      : 'bg-white border-[#EAE3D9] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-[#1A1F2C] text-[11px]">{acc.role}</div>
                    <div className="text-[10px] text-[#64748B]">{acc.desc}</div>
                  </div>
                  <span className="text-[10px] text-[#C5A880] font-mono">{acc.email.split('@')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-[#94A3B8]">
          <Link to="/" className="hover:text-[#1A1F2C] transition-colors underline">
            &larr; Return to Public Website
          </Link>
        </div>
      </div>
    </div>
  );
};
