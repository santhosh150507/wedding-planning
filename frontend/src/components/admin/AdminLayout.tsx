import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminNavbar } from './AdminNavbar';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#C5A880] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="font-serif text-lg text-[#1A1F2C]">Loading The Royal Knot Workspace...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col md:flex-row">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <AdminNavbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
