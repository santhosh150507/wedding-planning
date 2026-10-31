export type UserRole = 
  | 'Founder / Super Admin'
  | 'Administrator'
  | 'Wedding Planner'
  | 'Planning Staff'
  | 'Finance Manager';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: {
    id: string;
    name: UserRole;
    description?: string;
    permissions: string[];
  };
  hourly_cost_rate: number;
  is_active: boolean;
  created_at: string;
}

export type EnquiryStatus = 
  | 'New'
  | 'Contacted'
  | 'Consultation Scheduled'
  | 'Proposal Sent'
  | 'Negotiation'
  | 'Confirmed'
  | 'Lost';

export type EnquirySource = 
  | 'Website'
  | 'Call'
  | 'WhatsApp'
  | 'Instagram'
  | 'Referral';

export interface Enquiry {
  id: string;
  enquiry_number: string;
  bride_name: string;
  groom_name: string;
  email: string;
  phone: string;
  preferred_date: string;
  alternative_date?: string;
  destination: string;
  venue_preference?: string;
  guest_count: number;
  function_count: number;
  functions_requested: string[];
  theme_preference?: string;
  budget_max: number;
  package_type: 'full_service' | 'partial_day_of';
  catering_preferences?: string;
  decor_preferences?: string;
  additional_notes?: string;
  source: EnquirySource;
  status: EnquiryStatus;
  assigned_planner_id?: string;
  assigned_planner_name?: string;
  last_activity_at: string;
  follow_up_date?: string;
  is_inactive_3_days: boolean;
  notes_count: number;
  created_at: string;
  updated_at: string;
}

export interface EnquiryNote {
  id: string;
  enquiry_id: string;
  author_id: string;
  author_name: string;
  content: string;
  created_at: string;
}

export interface Consultation {
  id: string;
  enquiry_id: string;
  scheduled_at: string;
  meeting_type: string;
  status: string;
  notes?: string;
  created_at: string;
}

export interface DashboardOverview {
  total_weddings: number;
  active_weddings: number;
  upcoming_weddings: number;
  completed_weddings: number;
  new_enquiries: number;
  confirmed_bookings: number;
  
  total_revenue: number;
  total_expenses: number;
  overall_profit: number;
  profit_margin_percentage: number;
  pending_client_payments: number;
  pending_vendor_payments: number;
  
  upcoming_deadlines: number;
  overdue_tasks: number;
  flagged_inactive_enquiries: number;
  
  monthly_financials: {
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }[];
  
  wedding_status_distribution: {
    name: string;
    count: number;
    color: string;
  }[];
  
  profitability_by_wedding: {
    wedding_title: string;
    revenue: number;
    expenses: number;
    profit: number;
    margin: number;
  }[];
  
  recent_activities: {
    id: string;
    action: string;
    details: any;
    created_at: string;
    user_name: string;
  }[];
  
  follow_up_reminders: {
    id: string;
    enquiry_number: string;
    couple: string;
    status: string;
    days_inactive: number;
    is_stale: boolean;
    follow_up_date?: string;
  }[];
}

// Weddings
export interface WeddingSummary {
  id: string;
  wedding_number: string;
  couple_title: string;
  bride_name: string;
  groom_name: string;
  wedding_date_start: string;
  destination: string;
  venue_name: string;
  expected_guest_count: number;
  package_type: 'full_service' | 'partial_day_of';
  agreed_budget: number;
  assigned_planner_name: string;
  status: 'Draft' | 'Planning' | 'Active' | 'In Progress' | 'Completed' | 'Cancelled';
  progress_percentage: number;
  total_paid: number;
  payment_status: string;
  is_contract_signed: boolean;
}

export interface WeddingWorkspace {
  overview: {
    id: string;
    wedding_number: string;
    couple_title: string;
    bride_name: string;
    groom_name: string;
    primary_contact_name: string;
    contact_phone: string;
    contact_email: string;
    wedding_date_start: string;
    wedding_date_end: string;
    destination: string;
    venue_name: string;
    expected_guest_count: number;
    package_type: 'full_service' | 'partial_day_of';
    agreed_budget: number;
    assigned_planner_name: string;
    assigned_planner_id?: string;
    status: string;
    notes?: string;
    is_contract_signed: boolean;
  };
  contract?: {
    id: string;
    contract_number: string;
    status: string;
    total_amount: number;
    pdf_url?: string;
    signed_at?: string;
    signed_by?: string;
  };
  events: {
    id: string;
    title: string;
    venue: string;
    event_date: string;
    start_time: string;
    end_time: string;
    dress_code?: string;
    description?: string;
  }[];
  vendors: {
    id: string;
    vendor_id: string;
    business_name: string;
    category: string;
    agreed_amount: number;
    rate_card: any;
    status: string;
  }[];
  gatekeeper_locked: boolean;
  tasks_count: number;
  guests_count: number;
  total_revenue: number;
  total_vendor_expenses: number;
}

// Tasks
export interface WeddingTask {
  id: string;
  title: string;
  description?: string;
  status: 'To Plan' | 'In Progress' | 'Done' | 'Blocked';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  due_date: string;
  assigned_to_name: string;
  assigned_to_id?: string;
}

// Vendors & RFQs
export interface VendorItem {
  id: string;
  business_name: string;
  contact_person: string;
  category_id: string;
  category_name: string;
  phone: string;
  email: string;
  city: string;
  rating: number;
  on_time_percentage: number;
  bill_variance_percentage: number;
  gst_number?: string;
  notes?: string;
}

export interface VendorCategoryItem {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export interface RFQComparisonItem {
  quotation_id: string;
  vendor_id: string;
  vendor_name: string;
  contact_person: string;
  vendor_rating: number;
  on_time_percentage: number;
  bill_variance_percentage: number;
  price_per_plate?: number;
  extra_hour_rate?: number;
  taxes: number;
  total_amount: number;
  normalized_total_for_guests: number;
  status: string;
  inclusions: string[];
  exclusions: string[];
  missing_inclusions: string[];
  line_items: {
    item_name: string;
    description?: string;
    quantity: number;
    unit_rate: number;
    total_price: number;
    is_inclusion: boolean;
  }[];
  notes?: string;
}

export interface RFQComparisonData {
  rfq_id: string;
  rfq_title: string;
  category_name: string;
  guest_count: number;
  rfq_status: string;
  lowest_total_estimate: number;
  recommended_lowest_quote_id: string;
  quotations: RFQComparisonItem[];
}

// Guests
export interface GuestItem {
  id: string;
  wedding_id: string;
  full_name: string;
  phone?: string;
  email?: string;
  category: string;
  expected_party_size: number;
  rsvp_status: 'Invited' | 'Confirmed' | 'Declined' | 'Tentative';
  dietary_preference: string;
  table_number?: string;
  actual_checked_in_count: number;
  additional_walkin_count: number;
  notes?: string;
}

export interface GuestStats {
  total_parties: number;
  total_expected_heads: number;
  confirmed_heads: number;
  declined_heads: number;
  tentative_heads: number;
  actual_checked_in: number;
  additional_walkins: number;
  dietary_breakdown: Record<string, number>;
}

// Live Ops
export interface LiveOpsSummary {
  wedding_id: string;
  couple_title: string;
  wedding_date: string;
  venue_name: string;
  stats: {
    total_vendors_expected: number;
    vendors_arrived: number;
    vendors_late: number;
    open_issues: number;
    emergency_issues: number;
    at_risk_items_count: number;
  };
  at_risk_items: string[];
  timeline: {
    id: string;
    planned_time: string;
    activity_title: string;
    description?: string;
    status: 'Pending' | 'In Progress' | 'Completed' | 'Delayed';
    owner_name: string;
    vendor_name?: string;
    is_at_risk: boolean;
  }[];
  vendor_checkins: {
    id: string;
    vendor_id: string;
    business_name: string;
    category: string;
    contact_person: string;
    phone: string;
    expected_time: string;
    arrived_time?: string;
    status: 'Expected' | 'Arrived' | 'Late' | 'No Show';
    notes?: string;
  }[];
  issues: {
    id: string;
    title: string;
    description?: string;
    severity: 'Low' | 'Medium' | 'High' | 'Emergency';
    status: 'Open' | 'In Progress' | 'Resolved';
    assigned_to_name: string;
    reported_at: string;
    resolved_at?: string;
    resolution_notes?: string;
  }[];
}

// Financials
export interface WeddingFinancials {
  wedding_id: string;
  couple_title: string;
  agreed_budget: number;
  total_client_received: number;
  client_outstanding: number;
  total_extras_billable: number;
  total_vendor_invoiced: number;
  total_vendor_paid: number;
  vendor_outstanding: number;
  total_agency_expenses: number;
  total_team_cost: number;
  is_all_settled: boolean;
  milestones: {
    id: string;
    milestone_name: string;
    percentage: number;
    expected_amount: number;
    due_date: string;
    status: string;
  }[];
  client_payments: {
    id: string;
    amount: number;
    payment_date: string;
    payment_method: string;
    transaction_reference: string;
    receipt_pdf_url?: string;
    notes?: string;
  }[];
  vendor_invoices: {
    id: string;
    invoice_number: string;
    vendor_id: string;
    vendor_name: string;
    invoice_date: string;
    claimed_amount: number;
    agreed_baseline_amount: number;
    variance_amount: number;
    variance_status: string;
    status: string;
    total_paid_towards_invoice: number;
  }[];
  vendor_payments: {
    id: string;
    vendor_id: string;
    vendor_name: string;
    amount: number;
    payment_date: string;
    transaction_reference: string;
    payment_method: string;
  }[];
  extra_charges: {
    id: string;
    category: string;
    description: string;
    quantity: number;
    unit_rate: number;
    total_amount: number;
    is_billable_to_client: boolean;
    added_to_client_bill: boolean;
  }[];
  expenses: {
    id: string;
    category: string;
    amount: number;
    date: string;
    notes?: string;
  }[];
  settlement_checklist: {
    vendor_id: string;
    vendor_name: string;
    category: string;
    agreed_amount: number;
    has_invoice: boolean;
    total_invoiced: number;
    total_paid: number;
    is_fully_paid: boolean;
  }[];
}

// Reports
export interface SeasonProfitability {
  season_year: number;
  total_weddings: number;
  total_revenue: number;
  total_vendor_expenses: number;
  total_team_costs: number;
  total_direct_expenses: number;
  total_profit: number;
  overall_margin_percentage: number;
  receivables_due_next_30_days: number;
  weddings_ranking: {
    wedding_id: string;
    wedding_number: string;
    couple_title: string;
    status: string;
    wedding_date: string;
    destination: string;
    package_type: string;
    revenue: number;
    vendor_expenses: number;
    team_costs: number;
    direct_expenses: number;
    total_cost: number;
    net_profit: number;
    margin_percentage: number;
    is_loss_making: boolean;
  }[];
}

// Calendar
export interface CalendarEventItem {
  id: string;
  title: string;
  event_type: 'Wedding' | 'Ceremony' | 'Task Deadline' | 'Payment Due' | 'Consultation';
  start_date: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  destination?: string;
  venue?: string;
  dress_code?: string;
  priority?: string;
  status?: string;
  assignee?: string;
  color: string;
  wedding_id?: string;
}

// Team
export interface TeamMemberItem {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  hourly_cost_rate: number;
  active_weddings_count: number;
  pending_tasks_count: number;
}
