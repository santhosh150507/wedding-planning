import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Crown,
  LayoutDashboard,
  Users,
  Heart,
  FileText,
  Building2,
  CheckSquare,
  Calendar,
  Radio,
  UserCheck,
  CreditCard,
  Receipt,
  BarChart3,
  Users2,
  Settings,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: any;
  allowedRoles?: UserRole[];
  badge?: string;
}

export const AdminSidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, hasRole } = useAuth();

  const navigation: NavItem[] = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Enquiries (CRM)', path: '/admin/enquiries', icon: Users, allowedRoles: ['Founder / Super Admin', 'Administrator', 'Wedding Planner'] },
    { label: 'Weddings', path: '/admin/weddings', icon: Heart },
    { label: 'Proposals & Contracts', path: '/admin/contracts', icon: FileText, allowedRoles: ['Founder / Super Admin', 'Administrator', 'Wedding Planner', 'Finance Manager'] },
    { label: 'Vendors & RFQ', path: '/admin/vendors', icon: Building2, allowedRoles: ['Founder / Super Admin', 'Administrator', 'Wedding Planner', 'Finance Manager'] },
    { label: 'Tasks & Team', path: '/admin/tasks', icon: CheckSquare },
    { label: 'Calendar', path: '/admin/calendar', icon: Calendar, allowedRoles: ['Founder / Super Admin', 'Administrator', 'Wedding Planner', 'Planning Staff'] },
    { label: 'Day-of Operations', path: '/admin/live-ops', icon: Radio, allowedRoles: ['Founder / Super Admin', 'Administrator', 'Wedding Planner', 'Planning Staff'] },
    { label: 'Guest Management', path: '/admin/guests', icon: UserCheck, allowedRoles: ['Founder / Super Admin', 'Administrator', 'Wedding Planner', 'Planning Staff'] },
    { label: 'Client Payments', path: '/admin/client-payments', icon: CreditCard, allowedRoles: ['Founder / Super Admin', 'Administrator', 'Finance Manager'] },
    { label: 'Vendor Payments', path: '/admin/vendor-payments', icon: Receipt, allowedRoles: ['Founder / Super Admin', 'Administrator', 'Finance Manager'] },
    { label: 'Reports & Profitability', path: '/admin/reports', icon: BarChart3, allowedRoles: ['Founder / Super Admin', 'Administrator', 'Finance Manager'] },
    { label: 'Team & Workload', path: '/admin/team', icon: Users2, allowedRoles: ['Founder / Super Admin', 'Administrator'] },
    { label: 'Agency Settings', path: '/admin/settings', icon: Settings, allowedRoles: ['Founder / Super Admin', 'Administrator'] },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#1A1F2C] text-[#FAF8F5] border-r border-[#C5A880]/20 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header / Brand */}
        <div className="h-20 px-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#FAF8F5] text-[#1A1F2C] flex items-center justify-center border border-[#C5A880] shadow-xs">
              <Crown className="w-5 h-5 text-[#C5A880]" />
            </div>
            <div>
              <span className="font-serif text-lg tracking-wider text-[#FAF8F5] font-semibold block leading-tight">
                THE ROYAL KNOT
              </span>
              <span className="text-[9px] tracking-[0.25em] text-[#C5A880] font-medium uppercase block">
                Jaipur &bull; Udaipur
              </span>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Role Tag */}
        <div className="px-6 py-3 bg-white/5 border-b border-white/5 flex items-center justify-between text-xs">
          <span className="text-[#94A3B8]">Role:</span>
          <span className="text-[#C5A880] font-medium text-[11px] truncate max-w-[140px]">
            {user?.role?.name || 'Staff'}
          </span>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {navigation.map((item) => {
            const isAllowed = !item.allowedRoles || hasRole(item.allowedRoles);
            if (!isAllowed) return null;

            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[#C5A880] text-[#1A1F2C] font-semibold shadow-xs'
                      : 'text-[#CBD5E1] hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-white/10 text-[10px] text-[#64748B] flex items-center justify-between">
          <span>v1.0.0 &bull; Enterprise</span>
          <span className="text-[#C5A880]">Live ERP</span>
        </div>
      </aside>
    </>
  );
};
