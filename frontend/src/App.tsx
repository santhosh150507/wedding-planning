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

// Admin Components & Pages
import { AdminLayout } from './components/admin/AdminLayout';
import { DashboardPage } from './pages/admin/DashboardPage';
import { EnquiriesPage } from './pages/admin/EnquiriesPage';
import { EnquiryDetailPage } from './pages/admin/EnquiryDetailPage';
import { PlaceholderModulePage } from './pages/admin/PlaceholderModulePage';

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

          {/* Internal ERP Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="enquiries" element={<EnquiriesPage />} />
            <Route path="enquiries/:id" element={<EnquiryDetailPage />} />
            
            {/* Scheduled Phase 2-5 Modules */}
            <Route
              path="weddings"
              element={
                <PlaceholderModulePage
                  title="Wedding Management Workspace"
                  phase="Phase 2 Scheduled"
                  description="Complete multi-tab workspace for active weddings with event schedules, assigned planners, vendor rosters, guest lists, and financial health."
                  keyFeatures={[
                    'Unique Wedding ID & Couple Info',
                    '10 Dedicated Sub-Tabs',
                    'Full-Service vs Day-Of Scopes',
                    'Enquiry-to-Wedding One-Click Conversion'
                  ]}
                />
              }
            />
            <Route
              path="contracts"
              element={
                <PlaceholderModulePage
                  title="Contracts & Digital Proposals"
                  phase="Phase 2 Scheduled"
                  description="Prepare proposals, define milestone schedules, generate PDF service agreements, and send secure token mobile links for digital signatures."
                  keyFeatures={[
                    'Mobile Digital Signature Canvas',
                    'IP & Timestamp Audit Capture',
                    'Gatekeeper Lock (Vendor lists hidden until signed)',
                    'Automated PDF Contract Generator'
                  ]}
                />
              }
            />
            <Route
              path="vendors"
              element={
                <PlaceholderModulePage
                  title="Vendor Directory & Quotation Matrix"
                  phase="Phase 2 Scheduled"
                  description="Centralized vendor database and multi-vendor quotation comparison engine with atomic one-transaction selection."
                  keyFeatures={[
                    'Side-by-side RFQ Line-item Comparison',
                    'Lowest Quote & Missing Inclusions Highlight',
                    '1-Transaction Winner Selection & Locking',
                    'Per-plate & Extra-hour Rate Card Binding'
                  ]}
                />
              }
            />
            <Route
              path="tasks"
              element={
                <PlaceholderModulePage
                  title="Tasks & Team Management"
                  phase="Phase 3 Scheduled"
                  description="25+ task instant plan engine with relative due date calculation, role assignments, and drag-and-drop Kanban."
                  keyFeatures={[
                    'Idempotent Instant Plan Cloning',
                    'Relative Due Date Calculator',
                    'Kanban, List & Calendar Views',
                    'Full-Service vs Partial Templates'
                  ]}
                />
              }
            />
            <Route
              path="calendar"
              element={
                <PlaceholderModulePage
                  title="Wedding Operations Calendar"
                  phase="Phase 3 Scheduled"
                  description="Monthly, weekly, and daily views color-coded for ceremonies, vendor deadlines, and client meetings."
                  keyFeatures={[
                    'Color-Coded Event Types',
                    'Function Timeline Synchronization',
                    'Payment Milestone Due Dates',
                    'Interactive Event Filters'
                  ]}
                />
              }
            />
            <Route
              path="live-ops"
              element={
                <PlaceholderModulePage
                  title="Day-of Live Operations Command"
                  phase="Phase 4 Scheduled"
                  description="Minute-by-minute timeline, automated 1-minute vendor late detection, and live emergency issue logger."
                  keyFeatures={[
                    'Minute-by-Minute Event Timeline',
                    '1-Minute Background Late Detection',
                    'Live Risk Timeline Impact Highlighting',
                    'Tablet & Mobile-First Venue Interface'
                  ]}
                />
              }
            />
            <Route
              path="guests"
              element={
                <PlaceholderModulePage
                  title="Guest Management & RSVP"
                  phase="Phase 3 Scheduled"
                  description="400+ guest scale management with CSV import/export, dietary requirements, table mapping, and walk-in extra tracking."
                  keyFeatures={[
                    'CSV Bulk Import with Error Reporting',
                    'RSVP & Meal Preference Matrix',
                    'Day-of Walk-in Counter (Feeds Extras)',
                    'Summary Attendance Statistics'
                  ]}
                />
              }
            />
            <Route
              path="client-payments"
              element={
                <PlaceholderModulePage
                  title="Client Payments & Milestone Invoicing"
                  phase="Phase 4 Scheduled"
                  description="Staged payment plans (Booking, Advance, Final), PDF receipt generation, and automated overdue milestone alerts."
                  keyFeatures={[
                    'Booking / Advance / Final Milestones',
                    'PDF Payment Receipts',
                    'Daily Overdue Milestone Scanner',
                    'Pass-Through Extra Charges (Plates/Hours)'
                  ]}
                />
              }
            />
            <Route
              path="vendor-payments"
              element={
                <PlaceholderModulePage
                  title="Vendor Payments & Expense Reconciliation"
                  phase="Phase 4 Scheduled"
                  description="Vendor invoice tracking, variance calculation against agreed RFQ, duplicate payment prevention, and settlement checklist."
                  keyFeatures={[
                    'Agreed vs Claimed Bill Variance Alerts',
                    'Rate Card Extra Plate Calculations',
                    'Strict Duplicate Payment Rejection',
                    'Wedding Settlement Checklist'
                  ]}
                />
              }
            />
            <Route
              path="reports"
              element={
                <PlaceholderModulePage
                  title="Profitability & Season Analytics"
                  phase="Phase 5 Scheduled"
                  description="Executive business intelligence calculating Revenue - (Vendor Costs + Expenses + Team Hours * Cost Rate) with margin ranking."
                  keyFeatures={[
                    'Net Profit & Margin Breakdown',
                    'Team Hourly Cost Allocation',
                    'Season-wide Wedding Profit Ranking',
                    'Loss-Making Wedding Alerts & PDF/CSV Export'
                  ]}
                />
              }
            />
            <Route
              path="team"
              element={
                <PlaceholderModulePage
                  title="Team Directory & Workload"
                  phase="Phase 3 Scheduled"
                  description="Employee directory, workload balancing, and hourly time entry logging per wedding."
                  keyFeatures={[
                    'Role & Permission Assignment',
                    'Workload & Task Balance View',
                    'Time Entry Logging per Wedding',
                    'Hourly Cost Rate Profiles'
                  ]}
                />
              }
            />
            <Route
              path="settings"
              element={
                <PlaceholderModulePage
                  title="Agency Configuration & Templates"
                  phase="Phase 5 Scheduled"
                  description="Configure company profile, task templates, milestone percentages, vendor categories, and role permissions."
                  keyFeatures={[
                    'Task Template Editor (25+ Tasks)',
                    'Milestone % Configuration',
                    'Vendor Categories & Rate Defaults',
                    'Company Profile & Branding'
                  ]}
                />
              }
            />
          </Route>

          {/* Catch all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
