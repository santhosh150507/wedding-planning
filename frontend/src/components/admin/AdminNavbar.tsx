import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  Search,
  Plus,
  LogOut,
  ExternalLink,
  User as UserIcon,
  Crown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onMenuClick: () => void;
  onOpenNewEnquiry?: () => void;
}

export const AdminNavbar: React.FC<NavbarProps> = ({ onMenuClick, onOpenNewEnquiry }) => {
  const { user, logout } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const notifications = [
    { id: 1, title: 'New Website Enquiry', desc: 'Ananya & Rohan (Udaipur Lake Palace)', time: '2h ago' },
    { id: 2, title: 'Inactivity Reminder', desc: 'Isha & Sameer has had no updates for 4 days.', time: '5h ago' },
    { id: 3, title: 'Deposit Confirmed', desc: '₹70 Lakhs received for Aditi & Kabir.', time: '1d ago' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#EAE3D9] h-20 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile Toggle & Global Search */}
      <div className="flex items-center gap-4 flex-1 max-w-lg">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg text-[#1A1F2C] hover:bg-[#F4EFEA]"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full hidden sm:block">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search enquiries, weddings, couples, venues, contracts..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#EAE3D9] text-xs focus:outline-none focus:border-[#C5A880] bg-white shadow-2xs"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick New Enquiry button */}
        <button
          onClick={() => {
            if (onOpenNewEnquiry) {
              onOpenNewEnquiry();
            } else {
              navigate('/admin/enquiries');
            }
          }}
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#1A1F2C] text-[#FAF8F5] text-xs font-semibold hover:bg-[#2C3444] transition-all shadow-xs"
        >
          <Plus className="w-3.5 h-3.5 text-[#C5A880]" />
          <span>New Enquiry</span>
        </button>

        {/* Public Website Preview */}
        <Link
          to="/"
          target="_blank"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-[#64748B] hover:text-[#1A1F2C] hover:bg-[#F4EFEA] transition-colors"
          title="Open Public Website"
        >
          <ExternalLink className="w-3.5 h-3.5 text-[#C5A880]" />
          <span>View Site</span>
        </Link>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2.5 rounded-xl border border-[#EAE3D9] bg-white text-[#1A1F2C] hover:bg-[#FAF8F5] relative transition-colors shadow-2xs"
          >
            <Bell className="w-4 h-4 text-[#64748B]" />
            <span className="w-2 h-2 rounded-full bg-[#C5A880] absolute top-2 right-2 ring-2 ring-white"></span>
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#EAE3D9] py-3 z-50 animate-fade-in">
              <div className="px-4 py-2 border-b border-[#EAE3D9] flex items-center justify-between">
                <span className="text-xs font-serif text-sm font-semibold text-[#1A1F2C]">Agency Notifications</span>
                <span className="text-[10px] text-[#C5A880] font-bold">3 Unread</span>
              </div>
              <div className="divide-y divide-[#EAE3D9] max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 text-xs hover:bg-[#FAF8F5] transition-colors">
                    <div className="font-semibold text-[#1A1F2C]">{n.title}</div>
                    <div className="text-[11px] text-[#64748B] font-light mt-0.5">{n.desc}</div>
                    <div className="text-[10px] text-[#94A3B8] mt-1">{n.time}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full border border-[#EAE3D9] bg-white hover:bg-[#FAF8F5] transition-colors shadow-2xs"
          >
            <div className="w-8 h-8 rounded-full bg-[#1A1F2C] text-[#C5A880] flex items-center justify-center font-bold text-xs">
              {user?.full_name ? user.full_name.charAt(0) : 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-[#1A1F2C] leading-none truncate max-w-[120px]">
                {user?.full_name || 'Staff User'}
              </div>
              <div className="text-[10px] text-[#9D7B50] font-medium leading-none mt-1">
                {user?.role?.name || 'Planner'}
              </div>
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#EAE3D9] py-2 z-50 animate-fade-in">
              <div className="px-4 py-2.5 border-b border-[#EAE3D9]">
                <div className="text-xs font-semibold text-[#1A1F2C]">{user?.full_name}</div>
                <div className="text-[11px] text-[#64748B] truncate">{user?.email}</div>
                <div className="mt-1 inline-block px-2 py-0.5 rounded bg-[#FAF8F5] text-[10px] text-[#C5A880] font-medium border border-[#EAE3D9]">
                  {user?.role?.name}
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    logout();
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
