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
