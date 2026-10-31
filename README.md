# ⚜️ The Royal Knot – Luxury Wedding Planning Management Platform

A complete, production-quality Wedding Planning Agency ERP & Client Acquisition Platform tailored for high-net-worth destination weddings across the iconic heritage palaces of **Jaipur** and **Udaipur**, Rajasthan, India. Designed for ~25 ultra-luxury weddings per season, 400+ guests each, 18+ vendors per event, multi-crore INR staged budgets, and precision day-of execution.

---

## 1. Demo Credentials (Role-Based Access)

Sign in to the internal management system at `http://127.0.0.1:5173/login`. You can also click the **Instant Role Switcher** buttons on the login page for one-click authentication:

| Role | Email | Password | Permissions & Responsibilities |
| :--- | :--- | :--- | :--- |
| **Founder / Super Admin** | `founder@royalknot.in` | `Royal@123` | Unrestricted executive oversight, season margin rankings, loss-making alerts, agency settings |
| **Administrator** | `admin@royalknot.in` | `Royal@123` | Operational management, team allocation, staff assignments, task template curation |
| **Wedding Planner** | `planner@royalknot.in` | `Royal@123` | Client CRM leads, proposals & contracts, RFQ vendor curation, wedding workspaces, task tracking |
| **Planning Staff** | `staff@royalknot.in` | `Royal@123` | Day-of live ops execution, supplier arrival tracking, timeline management, emergency logs |
| **Finance Manager** | `finance@royalknot.in` | `Royal@123` | Client payment milestones, PDF receipts, vendor invoice variance analysis, extra charges, settlement checklists |

> **Single-Purpose Mobile Links (Zero Account Friction)**:
> External couples and vendors never create accounts. They access single-purpose, expiring token URLs:
> - **Couples**: Digital Service Agreement & E-Signature Canvas (`/sign/:token`)
> - **Vendors**: On-site Arrival Verification Check-in (`/vendor-checkin/:token`)
> - **Board/Stakeholders**: Read-Only Season Financial Report Portal (`/shared-report/:token`)

---

## 2. Technology Stack & Architecture

- **Frontend**:
  - React 19, TypeScript, Vite
  - Tailwind CSS v4, Lucide Icons
  - React Router v7, TanStack Query, Axios
  - React Hook Form, Zod Schema Validation
  - Recharts (Interactive Financial & Operational BI)
  - `@dnd-kit` (Drag-and-drop Kanban Pipeline & Task Boards)
  - `react-signature-canvas` (Touch-enabled Mobile E-Signature Capture)
- **Backend**:
  - FastAPI (Python 3.10+) with Pydantic v2
  - SQLAlchemy 2.0 ORM with Alembic-ready migrations
  - Strict NUMERIC currency math for INR (₹) — zero floating-point approximation
  - PyJWT & bcrypt for role-enforced dependency injection
  - APScheduler for background jobs (60-second vendor late arrival scanner)
  - Native WebSockets (`/api/v1/ws/live-ops/{wedding_id}`) with automatic 10s polling fallback
  - ReportLab for pixel-perfect PDF contracts, payment receipts, and landscape financial reports
  - Local file storage abstraction (`backend/uploads/`)
- **Database & Containerization**:
  - PostgreSQL 16 (production container) with zero-config local SQLite fallback (`royal_knot.db`)
  - Docker Compose multi-container setup (`postgres`, `backend`, `frontend`)
- **Luxury Aesthetic**:
  - Royal Charcoal (`#1A1F2C`), Warm Ivory (`#FAF8F5`), Antique Gold (`#C5A880`, `#D4AF37`), Deep Crimson (`#9E2A2B`)
  - Cormorant Garamond serif typography paired with Plus Jakarta Sans

---

## 3. Quick Start & Local Execution

### Option A: Local Development (Fast & Interactive)

#### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create & activate Python virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1    # On Windows PowerShell
# source venv/bin/activate     # On macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Seed realistic database with users, enquiries, weddings, vendors, RFQs, tasks, and finances
python seed.py

# Launch FastAPI backend server (port 8000)
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Interactive Swagger API documentation: `http://127.0.0.1:8000/docs`

#### 2. Frontend Setup
```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server (port 5173)
npm run dev
```
Open application in browser: `http://127.0.0.1:5173`

---

### Option B: Docker Compose (Production Environment)

To spin up the complete isolated environment (PostgreSQL 16 + FastAPI + Nginx Frontend):
```bash
# From the project root
docker compose up --build
```
- Frontend: `http://localhost:5173`
- Backend API & Docs: `http://localhost:8000/docs`
- PostgreSQL: `localhost:5432` (database: `royal_knot`)

---

## 4. Automated Testing & Verification

### Unit & Integration Tests (15/15 Passed)
```bash
# From the root directory:
$env:PYTHONPATH="backend"
.\backend\venv\Scripts\pytest backend/tests -v
```
Tests cover:
- Public enquiry creation & unique sequence generation (`RK-ENQ-2026-####`)
- Soft delete filtering (no leads lost)
- JWT role authentication & route guards
- Digital agreement generation, token expiry & mobile canvas signing
- Side-by-side 3-quote RFQ comparison & 1-transaction atomic winner selection
- One-click wedding workspace conversion & gatekeeper vendor lock
- Instant Plan 25+ task generation & idempotency guarantee
- Guest CSV bulk import with error reporting & walk-in counter
- 1-minute APScheduler late vendor scanner
- Strict duplicate transaction rejection & overpayment blocker
- Rate-card extra charges calculation (guest count x per-plate + extra hours)
- Season profitability calculations & loss-making wedding alerts

### End-to-End Full Journey Validation Script
```bash
$env:PYTHONPATH="backend"; $env:PYTHONIOENCODING="utf-8"; .\backend\venv\Scripts\python.exe test_full_journey.py
```
Executes and validates the entire operational lifecycle from client enquiry through signing, quotation comparison, wedding conversion, task execution, day-of live ops, milestone billing, and season margin ranking.

---

## 5. Comprehensive Module Guide

### Public Client Acquisition Website
1. **Home (`/`)**: Luxury hero banner, signature palace highlights (Taj Lake Palace, Rambagh Palace, Leela Palace Udaipur), statistics ribbon, client love testimonials.
2. **About Us (`/about`)**: Royal heritage narrative, agency ethos, transparency, and high-discretion principles.
3. **Our Services (`/services`)**: Full-Service Palace Architecture vs Partial/Day-of Orchestration, Khansama Gastronomy, Scenography.
4. **Wedding Portfolio (`/portfolio`)**: Past palace weddings across Jaipur and Udaipur, guest scales, function counts, and signature moments.
5. **Contact Concierge (`/contact`)**: Studio locations in Civil Lines (Jaipur) and Lake Pichola (Udaipur), inquiry form, direct lines.
6. **Plan Your Wedding (`/plan-your-wedding`)**: Luxury enquiry form with client-side Zod validation, guest count sliders, function checklists (Mehendi, Haldi, Sangeet, Wedding, Reception), budget range selector in Lakhs/Crores, and confirmation screen returning sequential ID `RK-ENQ-2026-####`.

---

### Internal Management System (ERP)

#### 1. Executive Dashboard (`/admin/dashboard`)
- Key metrics: Active/Upcoming/Completed Weddings, New Enquiries, Confirmed Bookings.
- Financial overview: Total Collected Revenue, Operating Expenses, Net Profit, Season Margin % in INR (₹).
- Recharts visualizations: Monthly revenue/expense trends (Bar Chart) and wedding status distribution (Donut Chart).
- Actionable banners: Inactive enquiries idle for 3+ days, upcoming deadlines, overdue tasks, live audit log.

#### 2. Enquiry CRM (`/admin/enquiries` & `/admin/enquiries/:id`)
- Paginated, searchable, filterable data table + drag-and-drop Kanban pipeline (`New → Contacted → Consultation Scheduled → Proposal Sent → Negotiation → Confirmed → Lost`).
- Manual intake modal for WhatsApp, phone, and Instagram leads.
- Inactivity indicator: inquiries idle for 3+ days highlighted in red.
- Consultation scheduler (Zoom/In-Person in Jaipur/Udaipur).
- Internal team communication notes timeline.
- Soft-delete protection ensuring lead data is never permanently removed.

#### 3. Proposals & Contracts (`/admin/contracts` & `/sign/:token`)
- Package selection, custom deliverables, staged payment schedules.
- Formal Royal Knot Agreement PDF generation.
- Expiring single-purpose digital signature link (`/sign/:token`).
- Touch-friendly mobile e-signature canvas capturing signer name, client IP address, user agent, and timestamp.
- Official executed agreement stored as downloadable ReportLab PDF.
- **The Gatekeeper Rule**: In the wedding workspace, Vendor Selection and Floor Plans stay strictly locked until the service agreement has been executed (`Signed`).

#### 4. Wedding Workspace Management (`/admin/weddings` & `/admin/weddings/:id`)
10 dedicated workspace tabs:
1. **Overview**: Key contacts, destination venue, package type, days until wedding, overall progress bar.
2. **Events & Functions**: Multi-day itinerary (Mehendi, Haldi, Sangeet, Vivah, Reception) with timings and venues.
3. **Vendors**: Contracted vendors and rate cards. Displays security lock if contract is unsigned.
4. **Tasks**: Instant Plan deliverables with status badges and assignees.
5. **Guests**: RSVP breakdown, vegetarian/Jain dietary tags, room allocations, walk-in counter.
6. **Budget**: Target budget vs actual committed costs and variance breakdown.
7. **Client Payments**: Milestone tracking, balance remaining, transaction receipts.
8. **Vendor Payments**: Invoice submission, variance warnings, disbursement records.
9. **Documents**: Service agreements, vendor contracts, rate cards, floor plans.
10. **Activity History**: Immutable timestamped audit log of all workspace modifications.

#### 5. Vendor Directory & 3-Quote RFQ Matrix (`/admin/vendors`)
- Directory spanning 12 specialized categories (Catering, Scenography & Decor, Photography, Videography, Makeup, DJ/Sound, Entertainment, Florists, Royal Transport, Heritage Venue, Architectural Lighting, Guest Hospitality).
- Performance ratings, GST verification, historical bill variance %, on-time delivery metrics.
- **Quotation Comparison Matrix**:
  - Side-by-side comparison across competing suppliers.
  - Normalization to per-plate rates (`price_per_plate * guest_count`), extra-hour fees, and tax calculations.
  - Automated detection of missing critical inclusions and lowest estimate highlight.
  - **1-Transaction Atomic Award**: Binds accepted rate card to wedding workspace and automatically marks non-selected quotes as `Closed - Not Selected`.

#### 6. Task Engine & Multi-View Calendar (`/admin/tasks` & `/admin/calendar`)
- **Instant Plan Engine**: Auto-generates 25+ milestone tasks relative to wedding date (e.g. T-180 venue finalization, T-30 food tasting, T-1 final walkthrough) with assigned staff roles and unique idempotent keys.
- **Interactive Kanban Board**: Drag-and-drop status changes (`To Do → In Progress → Under Review → Completed`) powered by `@dnd-kit`.
- **Operational Calendar**: Month grid and agenda schedule with color-coded ceremony, task, and payment events.

#### 7. Guest Hospitality & RSVP Management (`/admin/guests`)
- Guest registry tracking RSVPs (`Confirmed`, `Tentative`, `Declined`), dietary preferences (Jain, Pure Veg, Halal), and accommodation.
- CSV bulk import modal with header parsing, validation, and row-level error reporting.
- Real-time Walk-in Counter for on-site guest surges on wedding day.

#### 8. Day-of Live Operations Command Center (`/admin/live-ops`)
- Minute-by-minute royal ceremony timeline.
- Supplier arrival tracker with one-tap verification and single-purpose mobile check-in (`/vendor-checkin/:token`).
- **1-Minute Background Late Scanner**: Runs via APScheduler every 60 seconds; flags delayed suppliers in red.
- **Downstream At-Risk Items**: Automatically detects and highlights dependent timeline events in danger of cascade delays.
- Real-time WebSockets with 10-second polling fallback.
- Emergency issue logger for on-site incident resolution.

#### 9. Finance, Billing & Invoice Variance (`/admin/client-payments` & `/admin/vendor-payments`)
- **Client Billing**: Staged payment milestones (Booking 25%, Advance 50%, Final 25%) with instant ReportLab PDF payment receipts.
- **Vendor Invoices**: Automated >5% bill variance alerts against contracted quotations.
- **Rate-Card Extra Charges**: Automatically calculates extra plate counts and extra hours against bound rate card; updates vendor payable and appends billable charges to client account.
- **Fraud & Error Prevention**: Strict rejection of duplicate transaction reference numbers and zero-tolerance overpayment blocker.
- **Wedding Settlement Checklist**: 6-point financial closeout verification before a wedding can be marked `Completed`.

#### 10. Profitability BI, Team Logs & Settings (`/admin/reports`, `/admin/team`, `/admin/settings`)
- **Season Profitability**: Net profit calculation factoring client revenue, vendor costs, direct expenses, and allocated team hours.
- **Portfolio Ranking**: Identifies high-margin events (e.g. `RK-WED-2026-002` at 40% margin) and flags loss-making weddings in red (e.g. `RK-WED-2026-003` affected by unexpected weather expenses).
- **Export & Sharing**: Downloadable landscape ReportLab PDF executive summaries, CSV financial exports, and expiring read-only share links (`/shared-report/:token`).
- **Team Time Logging**: Hourly rate cards, billable hour logging, and employee capacity balance.
- **Agency Settings**: Company branding, default payment milestone percentages, and 25+ Instant Plan task template manager.

---

## 6. Directory Structure

```
wedding-planning/
├── backend/
│   ├── app/
│   │   ├── api/routes/         # FastAPI endpoints (auth, enquiries, weddings, vendors, tasks, live_ops, finance, reports...)
│   │   ├── core/               # Configuration, database engine, JWT security, role dependencies
│   │   ├── models/             # SQLAlchemy ORM models (normalized schema)
│   │   ├── schemas/            # Pydantic v2 validation models
│   │   ├── services/           # Pure business logic (gatekeeper, RFQ award, finances, PDF generators, task engine)
│   │   └── main.py             # App initialization, WebSocket route, APScheduler lifecycle
│   ├── tests/                  # Pytest test suite (15/15 tests passing)
│   ├── uploads/                # Generated PDFs (contracts, receipts, reports)
│   ├── Dockerfile              # Backend container definition
│   ├── requirements.txt        # Python dependencies
│   └── seed.py                 # Comprehensive luxury demo data seeder
├── frontend/
│   ├── src/
│   │   ├── api/                # Axios API client & typed endpoints
│   │   ├── components/         # Navigation, layout, UI widgets
│   │   ├── pages/              # Public website pages, token-link pages, admin ERP pages
│   │   ├── types/              # Full TypeScript domain interfaces
│   │   ├── App.tsx             # Route definitions (public, token, admin)
│   │   └── main.tsx            # Application entry point
│   ├── Dockerfile              # Frontend multi-stage container
│   ├── nginx.conf              # Nginx web server config for Docker
│   ├── package.json            # Node dependencies
│   └── vite.config.ts          # Vite build config
├── docker-compose.yml          # Multi-container orchestration (Postgres, Backend, Frontend)
├── .env.example                # Environment variable blueprint
├── test_full_journey.py        # End-to-end integration journey test script
└── README.md                   # Complete documentation
```

---

## 7. License & Credits

Built for **The Royal Knot** Luxury Wedding Planning Agency. All intellectual property, palace imagery curation, and design assets reserved.
