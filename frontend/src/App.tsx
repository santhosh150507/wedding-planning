import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Public Components & Pages
import { PublicNavbar } from './components/public/Navbar';
import { PublicFooter } from './components/public/Footer';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ServicesPage } from './pages/ServicesPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { ContactPage } from './pages/ContactPage';
import { PlanWeddingPage } from './pages/PlanWeddingPage';
import { LoginPage } from './pages/LoginPage';

// Public Mobile Token Single-Purpose Pages
import { PublicSignPage } from './pages/PublicSignPage';
import { PublicVendorCheckinPage } from './pages/PublicVendorCheckinPage';
import { PublicSharedReportPage } from './pages/PublicSharedReportPage';

// Admin Components & Pages
import { AdminLayout } from './components/admin/AdminLayout';
import { DashboardPage } from './pages/admin/DashboardPage';
import { EnquiriesPage } from './pages/admin/EnquiriesPage';
import { EnquiryDetailPage } from './pages/admin/EnquiryDetailPage';
import { WeddingsPage } from './pages/admin/WeddingsPage';
import { WeddingDetailPage } from './pages/admin/WeddingDetailPage';
import { ContractsPage } from './pages/admin/ContractsPage';
import { VendorsPage } from './pages/admin/VendorsPage';
import { TasksPage } from './pages/admin/TasksPage';
import { CalendarPage } from './pages/admin/CalendarPage';
import { GuestsPage } from './pages/admin/GuestsPage';
import { LiveOpsPage } from './pages/admin/LiveOpsPage';
import { ClientPaymentsPage } from './pages/admin/ClientPaymentsPage';
import { VendorPaymentsPage } from './pages/admin/VendorPaymentsPage';
import { ReportsPage } from './pages/admin/ReportsPage';
import { TeamPage } from './pages/admin/TeamPage';
import { SettingsPage } from './pages/admin/SettingsPage';

const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <PublicNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Website Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/plan-your-wedding" element={<PlanWeddingPage />} />
          </Route>

          {/* Authentication */}
          <Route path="/login" element={<LoginPage />} />

          {/* Single-Purpose Mobile Token Routes (Couples & Vendors have no accounts) */}
          <Route path="/sign/:token" element={<PublicSignPage />} />
          <Route path="/vendor-checkin/:token" element={<PublicVendorCheckinPage />} />
          <Route path="/shared-report/:token" element={<PublicSharedReportPage />} />

          {/* Internal ERP Admin Workspaces */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="enquiries" element={<EnquiriesPage />} />
            <Route path="enquiries/:id" element={<EnquiryDetailPage />} />
            
            {/* Integrated Operational Modules */}
            <Route path="weddings" element={<WeddingsPage />} />
            <Route path="weddings/:id" element={<WeddingDetailPage />} />
            <Route path="contracts" element={<ContractsPage />} />
            <Route path="vendors" element={<VendorsPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="guests" element={<GuestsPage />} />
            <Route path="live-ops" element={<LiveOpsPage />} />
            <Route path="client-payments" element={<ClientPaymentsPage />} />
            <Route path="vendor-payments" element={<VendorPaymentsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="team" element={<TeamPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Catch all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
