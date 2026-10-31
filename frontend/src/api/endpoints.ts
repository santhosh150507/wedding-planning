import { apiClient } from './client';
import {
  Enquiry,
  EnquiryNote,
  Consultation,
  DashboardOverview,
  User,
  WeddingSummary,
  WeddingWorkspace,
  WeddingTask,
  VendorItem,
  VendorCategoryItem,
  RFQComparisonData,
  GuestItem,
  GuestStats,
  LiveOpsSummary,
  WeddingFinancials,
  SeasonProfitability,
  CalendarEventItem,
  TeamMemberItem
} from '../types';

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await apiClient.post<{ access_token: string; user: User }>('/auth/login', credentials);
    return response.data;
  },
  getMe: async () => {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },
  getPlanners: async () => {
    const response = await apiClient.get<User[]>('/auth/planners');
    return response.data;
  },
};

export const enquiryApi = {
  submitPublic: async (data: any) => {
    const response = await apiClient.post<{ enquiry_number: string; message: string; submitted_at: string }>(
      '/enquiries/public',
      data
    );
    return response.data;
  },
  list: async (params?: {
    search?: string;
    status?: string;
    destination?: string;
    assigned_planner_id?: string;
    only_inactive?: boolean;
    page?: number;
    page_size?: number;
  }) => {
    const response = await apiClient.get<Enquiry[]>('/enquiries', { params });
    return response.data;
  },
  get: async (id: string) => {
    const response = await apiClient.get<Enquiry>(`/enquiries/${id}`);
    return response.data;
  },
  createInternal: async (data: any) => {
    const response = await apiClient.post<Enquiry>('/enquiries', data);
    return response.data;
  },
  update: async (id: string, data: Partial<Enquiry>) => {
    const response = await apiClient.patch<Enquiry>(`/enquiries/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await apiClient.delete(`/enquiries/${id}`);
    return response.data;
  },
  addNote: async (id: string, content: string) => {
    const response = await apiClient.post<EnquiryNote>(`/enquiries/${id}/notes`, { content });
    return response.data;
  },
  getNotes: async (id: string) => {
    const response = await apiClient.get<EnquiryNote[]>(`/enquiries/${id}/notes`);
    return response.data;
  },
  scheduleConsultation: async (id: string, data: { scheduled_at: string; meeting_type: string; notes?: string }) => {
    const response = await apiClient.post<Consultation>(`/enquiries/${id}/consultations`, data);
    return response.data;
  },
  getConsultations: async (id: string) => {
    const response = await apiClient.get<Consultation[]>(`/enquiries/${id}/consultations`);
    return response.data;
  },
};

export const dashboardApi = {
  getOverview: async () => {
    const response = await apiClient.get<DashboardOverview>('/dashboard/overview');
    return response.data;
  },
};

export const weddingApi = {
  list: async (params?: { search?: string; status?: string; planner_id?: string }) => {
    const response = await apiClient.get<WeddingSummary[]>('/weddings', { params });
    return response.data;
  },
  getWorkspace: async (weddingId: string) => {
    const response = await apiClient.get<WeddingWorkspace>(`/weddings/${weddingId}`);
    return response.data;
  },
  convertEnquiry: async (enquiryId: string) => {
    const response = await apiClient.post<{ success: boolean; wedding_id: string; wedding_number: string; couple_title: string }>(
      '/weddings/convert',
      { enquiry_id: enquiryId }
    );
    return response.data;
  },
  getTasks: async (weddingId: string) => {
    const response = await apiClient.get<WeddingTask[]>(`/weddings/${weddingId}/tasks`);
    return response.data;
  },
  createTask: async (weddingId: string, data: { title: string; description?: string; priority?: string; status?: string; due_date: string; assigned_to_id?: string }) => {
    const response = await apiClient.post(`/weddings/${weddingId}/tasks`, data);
    return response.data;
  },
  updateTask: async (weddingId: string, taskId: string, data: { status?: string; priority?: string; assigned_to_id?: string }) => {
    const response = await apiClient.patch(`/weddings/${weddingId}/tasks/${taskId}`, data);
    return response.data;
  },
  getEvents: async (weddingId: string) => {
    const response = await apiClient.get(`/weddings/${weddingId}/events`);
    return response.data;
  }
};

export const contractApi = {
  createProposal: async (data: { enquiry_id: string; package_type: string; total_amount: number; pricing_breakdown?: any; scope_of_work?: string }) => {
    const response = await apiClient.post('/contracts/proposals', data);
    return response.data;
  },
  generateContract: async (data: { enquiry_id: string; package_type: string; total_amount: number }) => {
    const response = await apiClient.post('/contracts/generate', data);
    return response.data;
  },
  sendContract: async (contractId: string, data: { recipient_email: string; recipient_name: string }) => {
    const response = await apiClient.post<{ message: string; signing_link: string; token: string; expires_at: string }>(
      `/contracts/${contractId}/send`,
      data
    );
    return response.data;
  },
  getPublicContext: async (token: string) => {
    const response = await apiClient.get(`/contracts/public/signing-context/${token}`);
    return response.data;
  },
  signPublicContract: async (token: string, data: { signed_by_name: string; signature_image: string }) => {
    const response = await apiClient.post(`/contracts/public/sign/${token}`, data);
    return response.data;
  }
};

export const vendorApi = {
  listCategories: async () => {
    const response = await apiClient.get<VendorCategoryItem[]>('/vendors/categories');
    return response.data;
  },
  listVendors: async (params?: { category_id?: string; city?: string; search?: string }) => {
    const response = await apiClient.get<VendorItem[]>('/vendors', { params });
    return response.data;
  },
  createVendor: async (data: any) => {
    const response = await apiClient.post<{ id: string; business_name: string }>('/vendors', data);
    return response.data;
  },
  createRFQ: async (data: { wedding_id: string; category_id: string; title: string; specifications: string }) => {
    const response = await apiClient.post('/vendors/rfq', data);
    return response.data;
  },
  listRFQs: async (weddingId?: string) => {
    const response = await apiClient.get<any[]>('/vendors/rfq', { params: { wedding_id: weddingId } });
    return response.data;
  },
  compareRFQs: async (rfqId: string) => {
    const response = await apiClient.get<RFQComparisonData>(`/vendors/rfq/${rfqId}/compare`);
    return response.data;
  },
  selectWinner: async (quotationId: string) => {
    const response = await apiClient.post<{ success: boolean; message: string; wedding_vendor_id: string; agreed_amount: number; rate_card: any }>(
      '/vendors/rfq/select-winner',
      { quotation_id: quotationId }
    );
    return response.data;
  },
  submitQuote: async (data: any) => {
    const response = await apiClient.post('/vendors/rfq/submit-quote', data);
    return response.data;
  }
};

export const guestApi = {
  list: async (weddingId: string, params?: { search?: string; rsvp_status?: string; category?: string }) => {
    const response = await apiClient.get<GuestItem[]>(`/weddings/${weddingId}/guests`, { params });
    return response.data;
  },
  getStats: async (weddingId: string) => {
    const response = await apiClient.get<GuestStats>(`/weddings/${weddingId}/guests/statistics`);
    return response.data;
  },
  create: async (weddingId: string, data: any) => {
    const response = await apiClient.post(`/weddings/${weddingId}/guests`, data);
    return response.data;
  },
  importCsv: async (weddingId: string, formData: FormData) => {
    const response = await apiClient.post<{ success: boolean; imported_count: number; errors: string[] }>(
      `/weddings/${weddingId}/guests/import-csv`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },
  recordWalkin: async (weddingId: string, guestId: string, walkinCount: number) => {
    const response = await apiClient.post(`/weddings/${weddingId}/guests/walkin`, { guest_id: guestId, walkin_count: walkinCount });
    return response.data;
  }
};

export const liveOpsApi = {
  getSummary: async (weddingId: string) => {
    const response = await apiClient.get<LiveOpsSummary>(`/weddings/${weddingId}/live-ops`);
    return response.data;
  },
  updateVendorStatus: async (weddingId: string, checkinId: string, data: { status: string; notes?: string }) => {
    const response = await apiClient.post(`/weddings/${weddingId}/live-ops/checkins/${checkinId}/status`, data);
    return response.data;
  },
  createArrivalLink: async (weddingId: string, checkinId: string) => {
    const response = await apiClient.post<{ arrival_link: string; token: string; expires_at: string }>(
      `/weddings/${weddingId}/live-ops/checkins/${checkinId}/token`
    );
    return response.data;
  },
  publicArrival: async (token: string) => {
    const response = await apiClient.post(`/live-ops/public/vendor-checkin/${token}`);
    return response.data;
  },
  triggerLateCheck: async (weddingId: string) => {
    const response = await apiClient.post(`/weddings/${weddingId}/live-ops/run-late-check`);
    return response.data;
  },
  createIssue: async (weddingId: string, data: { title: string; severity: string; description?: string; assigned_to_id?: string; issue_id?: string }) => {
    const response = await apiClient.post(`/weddings/${weddingId}/live-ops/issues`, data);
    return response.data;
  },
  resolveIssue: async (weddingId: string, issueId: string, resolution_notes: string) => {
    const response = await apiClient.post(`/weddings/${weddingId}/live-ops/issues/${issueId}/resolve`, { resolution_notes });
    return response.data;
  }
};

export const financeApi = {
  getSummary: async (weddingId: string) => {
    const response = await apiClient.get<WeddingFinancials>(`/weddings/${weddingId}/finance`);
    return response.data;
  },
  recordClientPayment: async (weddingId: string, data: { amount: number; milestone_id?: string; payment_method: string; transaction_reference: string; notes?: string }) => {
    const response = await apiClient.post(`/weddings/${weddingId}/finance/client-payments`, data);
    return response.data;
  },
  recordVendorPayment: async (weddingId: string, data: { vendor_invoice_id: string; amount: number; transaction_reference: string; payment_method?: string; notes?: string }) => {
    const response = await apiClient.post(`/weddings/${weddingId}/finance/vendor-payments`, data);
    return response.data;
  },
  submitVendorInvoice: async (weddingId: string, data: { vendor_id: string; invoice_number: string; claimed_amount: number; agreed_baseline_amount: number; notes?: string }) => {
    const response = await apiClient.post(`/weddings/${weddingId}/finance/vendor-invoices`, data);
    return response.data;
  },
  calculateExtraCharges: async (weddingId: string, data: { vendor_id: string; category?: string; extra_plates: number; extra_hours: number }) => {
    const response = await apiClient.post(`/weddings/${weddingId}/finance/extra-charges`, data);
    return response.data;
  }
};

export const reportsApi = {
  getSeasonProfitability: async (season: number = 2026) => {
    const response = await apiClient.get<SeasonProfitability>('/reports/profitability', { params: { season } });
    return response.data;
  },
  createShareLink: async () => {
    const response = await apiClient.post<{ share_link: string; token: string; expires_at: string }>('/reports/share-link');
    return response.data;
  },
  getPublicSharedReport: async (token: string) => {
    const response = await apiClient.get<SeasonProfitability>(`/reports/public/shared/${token}`);
    return response.data;
  }
};

export const teamApi = {
  listMembers: async () => {
    const response = await apiClient.get<TeamMemberItem[]>('/team/members');
    return response.data;
  },
  createMember: async (data: any) => {
    const response = await apiClient.post('/team/members', data);
    return response.data;
  },
  listTimeEntries: async (params?: { wedding_id?: string; user_id?: string }) => {
    const response = await apiClient.get<any[]>('/team/time-entries', { params });
    return response.data;
  },
  createTimeEntry: async (data: { user_id: string; wedding_id: string; hours: number; notes?: string; date?: string }) => {
    const response = await apiClient.post('/team/time-entries', data);
    return response.data;
  }
};

export const calendarApi = {
  getEvents: async (params?: { month?: number; year?: number }) => {
    const response = await apiClient.get<CalendarEventItem[]>('/calendar/events', { params });
    return response.data;
  }
};

export const settingsApi = {
  getSettings: async () => {
    const response = await apiClient.get<any>('/settings');
    return response.data;
  },
  listTaskTemplates: async (package_type?: string) => {
    const response = await apiClient.get<any[]>('/settings/task-templates', { params: { package_type } });
    return response.data;
  },
  createTaskTemplate: async (data: any) => {
    const response = await apiClient.post('/settings/task-templates', data);
    return response.data;
  }
};
