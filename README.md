# The Royal Knot – Luxury Wedding Planning Management Platform

A modern, production-quality Wedding Planning Agency ERP & Client Acquisition Platform tailored for high-net-worth destination weddings across the iconic heritage palaces of **Jaipur** and **Udaipur**, Rajasthan, India.

---

## 1. Demo Credentials (Role-Based Access)

Use these credentials to sign in to the internal agency management system at `http://127.0.0.1:5173/login`. You can also use the **Instant Role Switcher** buttons on the login page:

| Role | Email | Password | Primary Responsibilities |
| :--- | :--- | :--- | :--- |
| **Founder / Super Admin** | `founder@royalknot.in` | `Royal@123` | Full agency oversight, profit analysis, executive control |
| **Administrator** | `admin@royalknot.in` | `Royal@123` | Operational management, employee assignments, settings |
| **Wedding Planner** | `planner@royalknot.in` | `Royal@123` | CRM leads, consultation scheduling, tasks, proposals |
| **Planning Staff** | `staff@royalknot.in` | `Royal@123` | On-site execution, live operations, vendor check-ins |
| **Finance Manager** | `finance@royalknot.in` | `Royal@123` | Milestone billing, vendor invoice reconciliation, profit analysis |

---

## 2. Architecture & Technology Stack

- **Frontend**: React 18+ (TypeScript), Vite, Tailwind CSS v4, Lucide Icons, React Router v7, TanStack Query, React Hook Form, Zod, Recharts, canvas-confetti.
- **Backend**: Python FastAPI, Pydantic v2, SQLAlchemy 2.0 ORM, bcrypt, PyJWT, ReportLab, APScheduler.
- **Database**: PostgreSQL 18 (with SQLite local zero-config fallback), NUMERIC precision for INR (₹) currencies.
- **Brand Aesthetic**: Warm Ivory (`#FAF8F5`), Royal Charcoal (`#1A1F2C`), Antique Gold (`#C5A880`, `#D4AF37`), Cormorant Garamond serif typography paired with Plus Jakarta Sans.

---

## 3. Getting Started & Running Locally

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create & activate Python virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows PowerShell

# Install dependencies
pip install -r requirements.txt

# Seed realistic demo data (users, 8+ luxury enquiries, confirmed wedding)
python seed.py

# Launch FastAPI development server (port 8000)
uvicorn app.main:app --host 127.0.0.1 --port 8000
```
Interactive Swagger API documentation is available at `http://127.0.0.1:8000/docs`.

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install npm packages
npm install

# Start Vite dev server (port 5173)
npm run dev
```
Open `http://127.0.0.1:5173` in your browser.

### Automated Test Suite
```bash
cd backend
$env:PYTHONPATH="."
.\venv\Scripts\pytest.exe tests/test_phase1.py -v
```

---

## 4. Phase 1 Accomplishments

### A. Public Acquisition Website (6 Pages)
1. **Home (`/`)**: Luxury hero banner, signature palace showcases (Taj Lake Palace, Rambagh Palace, Leela Palace), stats ribbon, client love.
2. **About Us (`/about`)**: Royal heritage story, founding credo, principles of discretion and transparency.
3. **Our Services (`/services`)**: Full-Service Palace Architecture vs Partial/Day-of Orchestration, Khansama Gastronomy, Scenography.
4. **Wedding Portfolio (`/portfolio`)**: Real palace weddings in Jaipur and Udaipur, guest scales, functions, and highlights.
5. **Contact Concierge (`/contact`)**: Studio locations in Civil Lines (Jaipur) and Lake Pichola (Udaipur), contact information and inquiry form.
6. **Plan Your Wedding (`/plan-your-wedding`)**: Flagship enquiry intake form with frontend Zod validation, guest sliders, function checklists, budget range selector in Lakhs/Crores, and royal confirmation screen with unique enquiry ID (e.g. `RK-ENQ-2026-0009`).

### B. Internal CRM & Agency Management
1. **Employee Authentication (`/login`)**: Role-based access for 5 tiers with quick-fill demo buttons.
2. **Executive Command Dashboard (`/admin/dashboard`)**:
   - Total weddings, active weddings, completed weddings, new website enquiries, confirmed bookings.
   - Financial totals: Collected Revenue, Operating Expenses, Overall Profit, Margin % in INR (₹).
   - Recharts monthly financial trends (Bar chart) and wedding status distribution (Donut chart).
   - 3+ days inactive enquiry alert banner and actionable follow-up list.
   - Live audit & activity log timeline.
3. **Enquiry CRM (`/admin/enquiries`)**:
   - Filterable, searchable data table and Kanban pipeline board (`New → Contacted → Consultation Scheduled → Proposal Sent → Negotiation → Confirmed → Lost`).
   - Manual intake modal for phone calls, WhatsApp, and Instagram leads.
   - Flagged inactive inquiries highlighted in red.
   - Planner assignment and inline status transitions.
4. **Enquiry Detail Profile (`/admin/enquiries/:id`)**:
   - Comprehensive couple requirements, function list, catering and decor vision.
   - Meeting & consultation scheduler (Zoom, in-person at Jaipur/Udaipur).
   - Internal communication notes timeline with immediate activity refresh.
   - Soft-delete protection ensuring no historical lead is ever permanently lost.
