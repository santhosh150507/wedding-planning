# Architecture Blueprint & Implementation Plan: The Royal Knot

**Platform:** Luxury Wedding Planning Agency Management Platform  
**Target Operations:** Jaipur & Udaipur, Rajasthan, India  
**Target Scale:** ~25 luxury weddings/season, 400+ guests, 18+ vendors per wedding, multi-crore budgets (INR)  
**Document Version:** 1.0.0

---

## 1. System Architecture Overview

The Royal Knot platform is engineered as a unified, production-grade monorepo containing:
1. **Frontend (`/frontend`)**: React 18+ with TypeScript, Vite, Tailwind CSS, shadcn/ui, Lucide Icons, TanStack Query, React Hook Form, Zod, Recharts, and dnd-kit.
2. **Backend (`/backend`)**: FastAPI (Python 3.10+), Pydantic v2, SQLAlchemy 2.0, Alembic, APScheduler, WebSockets, and ReportLab.
3. **Database (`PostgreSQL 18`)**: Normalized relational tables, foreign key cascades, soft delete mechanisms, check constraints, and `NUMERIC(14, 2)` precision for all financial calculations in INR (₹).

```
+---------------------------------------------------------------------------------------+
|                                    CLIENT LAYER                                       |
|                                                                                       |
|  +---------------------------+  +---------------------------+  +--------------------+ |
|  |   Public Luxury Website   |  |   Internal Agency Portal  |  | Mobile Token Portal| |
|  | (Client Acquisition, SEO, |  |  (RBAC: Founder, Admin,   |  | (Client Signatures,| |
|  |  Enquiry Flow, Portfolio) |  |   Planner, Staff, Finance)|  |  Vendor RFQ & QR)  | |
|  +-------------+-------------+  +-------------+-------------+  +---------+----------+ |
+----------------|------------------------------|--------------------------|------------+
                 |                              |                          |
                 +----------------------+-------+--------------------------+
                                        | HTTPS / WSS
                                        v
+---------------------------------------------------------------------------------------+
|                                  FASTAPI BACKEND                                      |
|                                                                                       |
|  +---------------------------------------------------------------------------------+  |
|  | API Router & Auth Middleware (JWT Bearer, RBAC Dependencies, Token Link Verifier)|  |
|  +---------------------------------------------------------------------------------+  |
|                                        |                                              |
|  +-------------------------------------+-------------------------------------------+  |
|  |                         BUSINESS SERVICES LAYER (Core Logic)                    |  |
|  | - Enquiry & CRM Service       - Instant Plan Generator   - Vendor RFQ Matching  |  |
|  | - Proposal & Contract Service - Live Operations Hub      - Financial Reconciler |  |
|  | - Guest Attendance Engine     - Profitability & BI       - Document/PDF Engine  |  |
|  +-------------------------------------+-------------------------------------------+  |
|                                        |                                              |
|  +-------------------------+  +--------+---------------+  +------------------------+  |
|  |    APScheduler Tasks    |  |  SQLAlchemy 2.0 ORM    |  | WebSocket Connection   |  |
|  | (Vendor Late Detection, |  | (Unit of Work, Async/  |  | Manager (Day-Of Ops    |  |
|  |  Follow-up & Due Alerts)|  |  Sync Session Factory) |  |  Real-time Broadcast)  |  |
|  +-------------------------+  +--------+---------------+  +------------------------+  |
+----------------------------------------|----------------------------------------------+
                                         |
                                         v
+---------------------------------------------------------------------------------------+
|                               POSTGRESQL DATABASE                                     |
|  Users, Roles, Enquiries, Weddings, Tasks, Guests, Vendors, Quotations, Payments...   |
+---------------------------------------------------------------------------------------+
```

---

## 2. Luxury UI/UX Design System

In accordance with The Royal Knot's brand identity:

- **Color Palette**:
  - **Backgrounds**: Ivory (`#FAF8F5`), Off-white Silk (`#F4EFEA`), Pure White Card Canvas (`#FFFFFF`).
  - **Text & High Contrast**: Royal Charcoal (`#1A1F2C`), Midnight Slate (`#2C3444`), Muted Dove (`#6B7280`).
  - **Brand Accents**: Antique Royal Gold (`#C5A880`), Warm Marigold (`#D4AF37`), Deep Regal Emerald (`#1B4332`, used selectively for status).
  - **Borders & Dividers**: Subtle Sandstone (`#EAE3D9`).
- **Typography**:
  - Headings & Editorial: **Cormorant Garamond** / **Playfair Display** (refined serif evoking Rajasthani palace luxury).
  - User Interface & Data Tables: **Plus Jakarta Sans** / **Inter** (clean, crisp, high legibility for dense operational dashboards).
- **Aesthetic Principles**:
  - Micro-interactions on buttons, status badges, and tab transitions.
  - Zero gaudy neon colors; strictly curated high-end editorial layouts.
  - High information density for internal workspaces without clutter.
  - Mobile-first layouts for token-authenticated external users (couple agreement signing, vendor live arrival button).

---

## 3. Database Schema & Relationships

### Core Relational Entities:
1. **Authentication & Team**:
   - `roles`: `id`, `name` (Founder, Administrator, Wedding Planner, Planning Staff, Finance Manager), `permissions` (JSONB).
   - `users`: `id`, `email`, `hashed_password`, `full_name`, `phone`, `role_id`, `hourly_cost_rate`, `is_active`, `created_at`.
   - `time_entries`: `id`, `user_id`, `wedding_id`, `date`, `hours`, `hourly_rate`, `notes`, `created_at`.

2. **Client Acquisition & CRM**:
   - `enquiries`: `id` (UUID), `enquiry_number` (Unique, e.g., `RK-ENQ-2026-0001`), `bride_name`, `groom_name`, `email`, `phone`, `preferred_date`, `alternative_date`, `destination` (Jaipur, Udaipur, Jodhpur, etc.), `venue_preference`, `guest_count`, `function_count`, `functions_requested` (JSONB), `theme_preference`, `budget_max` (NUMERIC), `package_type` (`full_service` | `partial_day_of`), `catering_preferences`, `decor_preferences`, `additional_notes`, `source` (Website, Call, WhatsApp, Instagram, Referral), `status` (New, Contacted, Consultation Scheduled, Proposal Sent, Negotiation, Confirmed, Lost), `assigned_planner_id`, `last_activity_at`, `is_deleted` (Soft delete flag), `created_at`, `updated_at`.
   - `enquiry_notes`: `id`, `enquiry_id`, `author_id`, `content`, `created_at`.
   - `consultations`: `id`, `enquiry_id`, `scheduled_at`, `meeting_type` (In-Person, Zoom, Call), `status`, `notes`.

3. **Proposals & Digital Contracts**:
   - `proposals`: `id`, `enquiry_id`, `package_type`, `pricing_breakdown` (JSONB), `scope_of_work`, `status` (Draft, Sent, Accepted, Rejected), `created_at`.
   - `contracts`: `id`, `enquiry_id`, `wedding_id`, `contract_number`, `package_type`, `total_amount` (NUMERIC), `terms_content`, `pdf_url`, `status` (Draft, Sent, Viewed, Signed, Rejected), `signed_at`, `signed_by_name`, `signed_signature_image`, `signer_ip`, `signer_user_agent`, `created_at`.
   - `signing_tokens`: `id`, `token` (secure random UUID), `target_type` (`contract` | `vendor_rfq` | `vendor_checkin`), `target_id`, `expires_at`, `is_revoked`, `created_at`.

4. **Weddings Workspace**:
   - `weddings`: `id` (UUID), `wedding_number` (e.g. `RK-WED-2026-001`), `enquiry_id` (1-to-1), `couple_title` (e.g. "Aditi & Kabir"), `primary_contact_name`, `contact_phone`, `contact_email`, `wedding_date_start`, `wedding_date_end`, `destination`, `venue_name`, `expected_guest_count`, `package_type`, `agreed_budget` (NUMERIC), `assigned_planner_id`, `status` (Draft, Planning, Active, In Progress, Completed, Cancelled), `created_at`.
   - `wedding_events`: `id`, `wedding_id`, `title` (Haldi, Mehendi, Sangeet, Wedding Ceremony, Royal Reception), `venue`, `event_date`, `start_time`, `end_time`, `dress_code`, `notes`.

5. **Vendor Management & RFQ**:
   - `vendor_categories`: `id`, `name`, `code` (catering, decor, photo, video, music, makeup, transport, venue, lighting).
   - `vendors`: `id`, `business_name`, `contact_person`, `category_id`, `phone`, `email`, `address`, `gst_number`, `rating`, `on_time_percentage`, `bill_variance_percentage`, `is_active`.
   - `quotation_requests`: `id`, `wedding_id`, `category_id`, `title`, `specifications`, `status` (Open, Closed, Awarded), `created_at`.
   - `vendor_quotations`: `id`, `quotation_request_id`, `vendor_id`, `total_amount` (NUMERIC), `price_per_plate`, `extra_hour_rate`, `status` (Submitted, Accepted, Closed - Not Selected), `notes`.
   - `quotation_line_items`: `id`, `vendor_quotation_id`, `item_name`, `description`, `quantity`, `unit_rate`, `total_price`, `is_inclusion`.
   - `wedding_vendors`: `id`, `wedding_id`, `vendor_id`, `accepted_quotation_id`, `category_id`, `agreed_amount`, `rate_card` (JSONB), `status`.

6. **Tasks & Team Management**:
   - `task_templates`: `id`, `package_type` (`full_service` | `partial_day_of`), `title`, `description`, `default_priority`, `role_assignee`, `days_offset_from_wedding`.
   - `tasks`: `id`, `wedding_id`, `template_task_id`, `event_id`, `assigned_to_id`, `title`, `description`, `status` (To Plan, In Progress, Done, Blocked), `priority` (Low, Medium, High, Urgent), `due_date`, `created_at`.

7. **Guest Management**:
   - `guests`: `id`, `wedding_id`, `full_name`, `phone`, `email`, `category` (Bride Family, Groom Family, VIP, Friend), `expected_party_size`, `rsvp_status` (Invited, Confirmed, Declined, Tentative), `dietary_preference`, `table_number`, `actual_checked_in_count`, `notes`.

8. **Wedding-Day Operations**:
   - `schedule_items`: `id`, `wedding_id`, `event_id`, `planned_time`, `activity_title`, `owner_id`, `vendor_id`, `status` (Pending, In Progress, Completed, Delayed).
   - `vendor_checkins`: `id`, `wedding_id`, `vendor_id`, `expected_time`, `arrived_time`, `status` (Expected, Arrived, Late, No Show).
   - `wedding_day_issues`: `id`, `wedding_id`, `title`, `severity` (Low, Medium, High, Emergency), `assigned_to_id`, `status` (Open, In Progress, Resolved), `reported_at`, `resolved_at`.

9. **Financial Accounting & Reconciliation**:
   - `client_payment_milestones`: `id`, `wedding_id`, `milestone_name` (Booking Deposit, Advance Payment, Final Settlement), `percentage`, `due_date`, `expected_amount`, `status` (Pending, Overdue, Paid).
   - `client_payments`: `id`, `wedding_id`, `milestone_id`, `amount` (NUMERIC), `payment_date`, `payment_method`, `transaction_reference` (Unique), `receipt_pdf_url`, `created_at`.
   - `vendor_invoices`: `id`, `wedding_id`, `vendor_id`, `invoice_number`, `invoice_date`, `claimed_amount` (NUMERIC), `agreed_baseline_amount`, `variance_amount`, `variance_status` (OK, Flagged), `status` (Draft, Approved, Paid).
   - `vendor_payments`: `id`, `wedding_id`, `vendor_invoice_id`, `vendor_id`, `amount` (NUMERIC), `payment_date`, `transaction_reference` (Unique), `created_at`.
   - `extra_charges`: `id`, `wedding_id`, `vendor_id`, `category`, `description`, `unit_rate`, `quantity`, `total_amount` (NUMERIC), `is_billable_to_client`, `added_to_client_bill`, `created_at`.
   - `expenses`: `id`, `wedding_id`, `category`, `amount`, `date`, `receipt_url`, `notes`.

---

## 4. Backend Service-Layer Architecture

Route handlers remain thin; all core workflows are encapsulated in idempotent, unit-tested services under `/backend/app/services`:
- `enquiry_service.py`: Sequential ID generation (`RK-ENQ-YYYY-####`), soft-delete filtering, 3-day inactivity alerts.
- `proposal_contract_service.py`: Agreement generation, expiring token creation, canvas signature capture + IP/timestamp recording, lock/unlock gatekeeper.
- `wedding_service.py`: Enquiry-to-Wedding transformation with transactional integrity.
- `task_engine_service.py`: Instant Plan idempotent cloning with unique constraint on `(wedding_id, template_task_id)` and date math.
- `vendor_rfq_service.py`: Multi-vendor quotation comparison, 1-transaction award (marks winning quote Accepted, closes competitors, binds `wedding_vendors`).
- `live_ops_service.py`: Arrival logging, 1-minute APScheduler late detector, issue timeline broadcaster via WebSocket.
- `reconciliation_service.py`: Automated variance computation (`claimed_amount - agreed_baseline`), extra plate/hour pass-through, overpayment blocker.
- `profitability_service.py`: Revenue - (Vendor Invoices + Expenses + Time Cost) with margin %.

---

## 5. Five-Phase Implementation Roadmap

### Phase 1: Client Acquisition & CRM Foundation
- Public luxury website (6 pages: Home, About Us, Services, Portfolio/Experiences, Contact, Plan Your Wedding).
- Plan Your Wedding form with Zod & Pydantic validation, sequential ID (`RK-ENQ-2026-0001`), soft-delete preservation.
- Authentication & JWT RBAC (Founder, Administrator, Planner, Staff, Finance).
- Internal Executive Dashboard with key metrics & Recharts.
- Enquiry CRM with List & Kanban views, quick status updates, notes, assignment, and inactivity reminder flags.
- **Done When:** Couple submits enquiry on website -> Receives confirmation with ID -> Enquiry appears live in internal CRM -> Planner can filter, assign, add notes, and move through Kanban pipeline.

### Phase 2: Contracts, Wedding Workspaces & Vendor RFQ
- Proposal generation, milestone setup, and PDF contract builder.
- Mobile-friendly signature canvas link with token validation, IP and timestamp capture.
- Contract Signed gatekeeper (locks vendor & floor plans until signed).
- Enquiry-to-Wedding conversion workflow.
- Vendor directory and RFQ side-by-side quotation comparison engine.
- Single-transaction quotation award & rate card binding.
- **Done When:** Contract signed via mobile token -> Unlocks wedding conversion -> 3 caterer quotes compared line-by-line -> Winning vendor selected atomically.

### Phase 3: Tasks, Team, Calendar & Guest Management
- Reusable Task Templates (Full-Service 25+ tasks & Partial/Day-of).
- Instant Plan generator (calculates due dates relative to wedding date, idempotent).
- Task Board (Kanban, List, Filters).
- Team workload directory and hourly rate time tracking.
- Interactive wedding calendar (monthly, weekly, daily with color-coded events).
- Guest list management with CSV import/export, RSVP tracking, walk-in counter.
- **Done When:** Wedding creation seeds 25+ tasks without duplicates, Kanban works smoothly, and CSV of 400+ guests imports without data loss.

### Phase 4: Wedding-Day Live Operations & Financial Reconciliation
- Minute-by-minute live wedding timeline.
- Vendor arrival tracker with 1-minute APScheduler late check & timeline risk highlighting.
- Live issues & emergency reporting dashboard with WebSocket broadcast.
- Client staged payment milestones, PDF receipts, and overdue alert engine.
- Vendor invoice reconciliation with variance detection, rate card extra-plate calculation, and duplicate payment prevention.
- **Done When:** Vendors can check in via mobile or staff, late vendors turn red automatically, client payments issue receipts, and over-quota vendor payments are rejected.

### Phase 5: Profitability Analytics, Audit & Polish
- Business Intelligence dashboard for Founder (Revenue, Expenses, Team Cost, Profit, Margin %).
- Season-wide wedding ranking table with loss-making highlights.
- PDF and CSV report export, expiring shareable financial links.
- End-to-end service layer test suite (pytest).
- Visual polish, dark/light theme accents, responsive checks.
- **Done When:** Profitability formulas reconcile precisely with live database data, reports export accurately, and all automated tests pass.
