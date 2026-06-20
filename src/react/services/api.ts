// API Client for MyGate Backend Integration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://app.mygatebell.com/backend';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('auth_token');
    // Also sync from window.State for legacy SPA compatibility
    if (typeof window !== 'undefined' && (window as any).State?.token) {
      this.token = (window as any).State.token;
    }
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
    // Also sync to window.State for legacy SPA compatibility
    if (typeof window !== 'undefined') {
      (window as any).State = (window as any).State || {};
      (window as any).State.token = token;
    }
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
    // Also clear window.State for legacy SPA compatibility
    if (typeof window !== 'undefined') {
      (window as any).State = (window as any).State || {};
      (window as any).State.token = null;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    // Add authorization header if token exists (except for login endpoint)
    if (this.token && !endpoint.includes('/auth/login')) {
      headers['Authorization'] = `Bearer ${this.token}`;
    } else if (!this.token && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
      console.warn('No token available for request to:', endpoint);
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle 401 unauthorized
        if (response.status === 401) {
          console.error('401 Unauthorized - clearing token');
          this.clearToken();
          window.location.href = '/login';
          throw new Error('Session expired');
        }
        throw new Error(data.message || 'Request failed');
      }

      if (data && typeof data === 'object') {
        // Normalize status -> success
        data.success = data.status ?? data.success ?? true;

        // If data.data has nested { data: [...], pagination: {...} } from sendPaginatedResponse
        if (data.data && typeof data.data === 'object' && Array.isArray(data.data.data)) {
          if (data.data.pagination) {
            const p = data.data.pagination;
            data.pagination = {
              current_page: p.page ?? 1,
              per_page: p.limit ?? 20,
              total: p.total ?? 0,
              total_pages: p.pages ?? 1,
            };
          }
          data.data = data.data.data;
        }
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(phone: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password }),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getMe() {
    return this.request('/auth/me', {
      method: 'GET',
    });
  }

  // Super Admin endpoints
  async getSuperAdminStats() {
    return this.request('/superadmin/stats');
  }

  async getRegistrations(status?: string) {
    const params = status ? `?status=${status}` : '';
    return this.request(`/superadmin/registrations${params}`);
  }

  async updateRegistration(id: string, data: any) {
    return this.request(`/superadmin/registrations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async approveRegistration(id: string, data?: any) {
    return this.request(`/superadmin/registrations/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  }

  async getSocieties(status?: string) {
    const params = status ? `?status=${status}` : '';
    return this.request(`/superadmin/societies${params}`);
  }

  async getSociety(id: string) {
    return this.request(`/superadmin/societies/${id}`);
  }

  async createSociety(data: any) {
    return this.request('/superadmin/societies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSociety(id: string, data: any) {
    return this.request(`/superadmin/societies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async approveSociety(id: string, data: any) {
    return this.request(`/superadmin/societies/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async suspendSociety(id: string) {
    return this.request(`/superadmin/societies/${id}/suspend`, {
      method: 'PUT',
    });
  }

  async deleteSociety(id: string) {
    return this.request(`/superadmin/societies/${id}`, {
      method: 'DELETE',
    });
  }

  async getAdmins() {
    return this.request('/superadmin/admins');
  }

  async toggleAdmin(id: string) {
    return this.request(`/superadmin/admins/${id}/toggle`, {
      method: 'PUT',
    });
  }

  // Admin endpoints
  async getCompleteSociety(id: string) {
    return this.request(`/admin/societies/${id}/complete`);
  }

  async updateSocietyAdmin(id: string, data: any) {
    return this.request(`/admin/societies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async createBuilding(data: any) {
    return this.request('/buildings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBuildingsBySociety(societyId: string) {
    return this.request(`/buildings/by-society/${societyId}`);
  }

  async createFlats(data: any) {
    return this.request('/flats', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createSingleFlatWithOwner(data: {
    building_id: number | string;
    flat_number: string;
    flat_type?: string;
    floor_number?: string;
    area_sqft?: number;
    society_id: number;
    user_role?: 'owner' | 'renting_family' | 'renting_flatmates';
    occupancy_status?: 'residing' | 'let_out' | 'empty';
    owner?: {
      name: string;
      email?: string;
      phone: string;
      password: string;
      role?: 'resident';
      society_id: number;
      resident_type?: 'owner' | 'tenant' | 'family_member' | 'other';
      bio?: string;
      profession?: string;
      hometown?: string;
      cover_image_url?: string;
      profile_image?: string;
    };
  }) {
    return this.request('/flat/add-home', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getFlatOwner(flatId: string | number) {
    return this.request(`/flats/${flatId}/owner`);
  }

  async getAllFlatsBySociety(societyId: string) {
    return this.request(`/flats/all-by-society/${societyId}`);
  }

  async getFlatsByBuilding(buildingId: string) {
    return this.request(`/flats/by-building/${buildingId}`);
  }

  async searchSocieties(query: string, limit?: number) {
    const params = `?q=${encodeURIComponent(query)}${limit ? `&limit=${limit}` : ''}`;
    return this.request(`/societies/search${params}`);
  }

  // User Management
  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
    search?: string;
    society_id?: string;
  }) {
    const queryString = new URLSearchParams(params as any).toString();
    return this.request(`/admin/users${queryString ? `?${queryString}` : ''}`);
  }

  async getUser(id: string) {
    return this.request(`/admin/users/${id}`);
  }

  async createUser(data: any) {
    return this.request('/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: string, data: any) {
    return this.request(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string) {
    return this.request(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  async updateUserStatus(id: string, status: string) {
    return this.request(`/auth/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Accounting
  async getChargeHeads(params?: { page?: number; limit?: number; is_active?: number }) {
    const queryString = new URLSearchParams(params as any).toString();
    return this.request(`/accounting/charge-heads${queryString ? `?${queryString}` : ''}`);
  }

  async createChargeHead(data: any) {
    return this.request('/accounting/charge-heads', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getInvoices(params?: { page?: number; limit?: number; status?: string }) {
    const queryString = new URLSearchParams(params as any).toString();
    return this.request(`/accounting/invoices${queryString ? `?${queryString}` : ''}`);
  }

  async getInvoice(id: string) {
    return this.request(`/accounting/invoices/${id}`);
  }

  async createInvoice(data: any) {
    return this.request('/accounting/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateInvoiceStatus(id: string, status: string) {
    return this.request(`/accounting/invoices/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async processPayment(data: any) {
    return this.request('/accounting/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Communications
  async getGroups(params?: { page?: number; limit?: number; is_active?: number }) {
    const queryString = new URLSearchParams(params as any).toString();
    return this.request(`/communications/groups${queryString ? `?${queryString}` : ''}`);
  }

  async createGroup(data: any) {
    return this.request('/communications/groups', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAnnouncements(params?: { page?: number; limit?: number; is_draft?: number }) {
    const queryString = new URLSearchParams(params as any).toString();
    return this.request(`/communications/announcements${queryString ? `?${queryString}` : ''}`);
  }

  async createAnnouncement(data: any) {
    return this.request('/communications/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPolls(params?: { page?: number; limit?: number; is_active?: number }) {
    const queryString = new URLSearchParams(params as any).toString();
    return this.request(`/communications/polls${queryString ? `?${queryString}` : ''}`);
  }

  async createPoll(data: any) {
    return this.request('/communications/polls', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Helpdesk
  async getTickets(params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    priority?: string;
  }) {
    const queryString = new URLSearchParams(params as any).toString();
    return this.request(`/helpdesk/tickets${queryString ? `?${queryString}` : ''}`);
  }

  async getTicket(id: string) {
    return this.request(`/helpdesk/tickets/${id}`);
  }

  async createTicket(data: any) {
    return this.request('/helpdesk/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTicketStatus(id: string, status: string) {
    return this.request(`/helpdesk/tickets/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async assignTicket(id: string, assignedTo: string) {
    return this.request(`/helpdesk/tickets/${id}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ assigned_to: assignedTo }),
    });
  }

  async addComment(ticketId: string, comment: string) {
    return this.request(`/helpdesk/tickets/${ticketId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    });
  }

  // Amenities
  async getAmenities(params?: { page?: number; limit?: number; is_active?: number }) {
    const queryString = new URLSearchParams(params as any).toString();
    return this.request(`/amenities${queryString ? `?${queryString}` : ''}`);
  }

  async createAmenity(data: any) {
    return this.request('/amenities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBookings(params?: { page?: number; limit?: number; status?: string }) {
    const queryString = new URLSearchParams(params as any).toString();
    return this.request(`/amenities/bookings${queryString ? `?${queryString}` : ''}`);
  }

  async updateBookingStatus(bookingId: string, status: string) {
    return this.request(`/amenities/bookings/${bookingId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Security
  async getAlerts(params?: {
    page?: number;
    limit?: number;
    status?: string;
    severity?: string;
    alert_type?: string;
  }) {
    const queryString = new URLSearchParams(params as any).toString();
    return this.request(`/security/alerts${queryString ? `?${queryString}` : ''}`);
  }

  async reportAlert(data: any) {
    return this.request('/security/alerts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAlertStatus(id: string, status: string) {
    return this.request(`/security/alerts/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async getEmergencyContacts(params?: { page?: number; limit?: number; is_active?: number }) {
    const queryString = new URLSearchParams(params as any).toString();
    return this.request(`/security/emergency-contacts${queryString ? `?${queryString}` : ''}`);
  }

  async addEmergencyContact(data: any) {
    return this.request('/security/emergency-contacts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Guard Module (guard self-service — used by mobile app only, kept for API completeness)
  async getGuardResidents(params?: { page?: number; limit?: number; search?: string }) {
    const queryString = new URLSearchParams(params as any).toString();
    return this.request(`/guard/residents${queryString ? `?${queryString}` : ''}`);
  }

  async getGuardVehicleEntries(params?: { page?: number; limit?: number; status?: string }) {
    const queryString = new URLSearchParams(params as any).toString();
    return this.request(`/guard/vehicle-entries${queryString ? `?${queryString}` : ''}`);
  }

  async addGuardVehicleEntry(data: {
    vehicle_type: string;
    vehicle_number: string;
    driver_name: string;
    driver_phone: string;
    purpose: string;
    resident_id?: number | null;
  }) {
    return this.request('/guard/vehicle-entries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateGuardVehicleEntryStatus(id: string | number, status: 'inside' | 'exited') {
    return this.request(`/guard/vehicle-entries/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async getGuardAttendance() {
    return this.request('/guard/attendance');
  }

  async markGuardAttendance(type: 'in' | 'out') {
    return this.request('/guard/attendance/mark', {
      method: 'POST',
      body: JSON.stringify({ type }),
    });
  }

  // Admin Guard Management
  async getAdminGuards(params?: { page?: number; limit?: number; search?: string; status?: string }) {
    const queryString = new URLSearchParams(params as any).toString();
    return this.request(`/admin/guards${queryString ? `?${queryString}` : ''}`);
  }

  async getAdminGuardAttendance(params?: {
    page?: number;
    limit?: number;
    guard_id?: number;
    date_from?: string;
    date_to?: string;
    status?: string;
  }) {
    const queryString = new URLSearchParams(params as any).toString();
    return this.request(`/admin/guards/attendance${queryString ? `?${queryString}` : ''}`);
  }

  // Assets
  async getAssetCategories() {
    return this.request('/assets/categories');
  }

  async getAssets() {
    return this.request('/assets');
  }

  async addAsset(data: any) {
    return this.request('/assets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getInventory() {
    return this.request('/assets/inventory');
  }

  async addInventoryItem(data: any) {
    return this.request('/assets/inventory', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Notifications
  async getNotifications(params?: { page?: number; limit?: number; unread_only?: number }) {
    const queryString = new URLSearchParams(params as any).toString();
    return this.request(`/notifications${queryString ? `?${queryString}` : ''}`);
  }

  async markNotificationRead(id: string | number) {
    return this.request(`/notifications/${id}/read`, { method: 'PUT' });
  }

  async markAllNotificationsRead() {
    return this.request('/notifications/read-all', { method: 'PUT' });
  }

  async getUnreadNotificationCount() {
    return this.request('/notifications/unread-count');
  }

  async registerWebPushToken(token: string) {
    return this.request('/notifications/tokens', {
      method: 'POST',
      body: JSON.stringify({ device_token: token, device_type: 'web' }),
    });
  }

  // Community Management
  async getCommunityPosts(params?: { page?: number; limit?: number }) {
    const queryString = new URLSearchParams(params as any).toString();
    return this.request(`/community/posts${queryString ? `?${queryString}` : ''}`);
  }

  async deleteCommunityPost(id: string | number) {
    return this.request(`/community/posts/${id}`, { method: 'DELETE' });
  }

  // Marketplace Management (placeholder for future admin use)
  async getMarketplaceItems(params?: { page?: number; limit?: number }) {
    const queryString = new URLSearchParams(params as any).toString();
    return this.request(`/marketplace/products${queryString ? `?${queryString}` : ''}`);
  }

  // Events Management
  async getEvents(params?: { page?: number; limit?: number }) {
    const queryString = new URLSearchParams(params as any).toString();
    return this.request(`/events${queryString ? `?${queryString}` : ''}`);
  }

  async createEvent(data: any) {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEvent(id: string | number, data: any) {
    return this.request(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEvent(id: string | number) {
    return this.request(`/events/${id}`, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
