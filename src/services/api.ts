import { User, Voucher, DashboardStats, VoucherFilterParams } from '../types';

const TOKEN_KEY = 'ev_auth_token';

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = authStorage.getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as any)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}: Request failed`);
  }

  return data as T;
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    authStorage.setToken(res.token);
    return res;
  },

  async switchDemo(role: string, email?: string): Promise<{ token: string; user: User }> {
    const res = await request<{ token: string; user: User }>('/auth/switch-demo', {
      method: 'POST',
      body: JSON.stringify({ role, email }),
    });
    authStorage.setToken(res.token);
    return res;
  },

  async getDemoUsers(): Promise<{ users: User[] }> {
    return request<{ users: User[] }>('/auth/demo-users');
  },

  async getCurrentUser(): Promise<{ user: User }> {
    return request<{ user: User }>('/auth/me');
  },

  async updateSignature(signature: string): Promise<{ defaultSignature: string }> {
    return request<{ defaultSignature: string }>('/auth/signature', {
      method: 'PUT',
      body: JSON.stringify({ signature }),
    });
  },

  // Vouchers
  async getDashboardStats(): Promise<{ stats: DashboardStats }> {
    return request<{ stats: DashboardStats }>('/vouchers/dashboard');
  },

  async getVouchers(params: VoucherFilterParams = {}): Promise<{ vouchers: Voucher[]; total: number }> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    const qs = query.toString();
    return request<{ vouchers: Voucher[]; total: number }>(`/vouchers${qs ? `?${qs}` : ''}`);
  },

  async getVoucherById(id: string): Promise<{ voucher: Voucher }> {
    return request<{ voucher: Voucher }>(`/vouchers/${id}`);
  },

  async createVoucher(data: {
    department: string;
    expenseTitle: string;
    expenseCategory: string;
    expenseDescription?: string;
    expenseDate: string;
    amount: number;
    currency?: string;
    employeeSignature?: string;
  }): Promise<{ message: string; voucher: Voucher }> {
    return request<{ message: string; voucher: Voucher }>('/vouchers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateVoucher(
    id: string,
    data: Partial<{
      department: string;
      expenseTitle: string;
      expenseCategory: string;
      expenseDescription: string;
      expenseDate: string;
      amount: number;
      currency: string;
      employeeSignature: string;
    }>
  ): Promise<{ message: string; voucher: Voucher }> {
    return request<{ message: string; voucher: Voucher }>(`/vouchers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteVoucher(id: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/vouchers/${id}`, {
      method: 'DELETE',
    });
  },

  async submitVoucher(id: string, signature?: string): Promise<{ message: string; voucher: Voucher }> {
    return request<{ message: string; voucher: Voucher }>(`/vouchers/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ signature }),
    });
  },

  async approveVoucher(id: string, directorSignature: string): Promise<{ message: string; voucher: Voucher }> {
    return request<{ message: string; voucher: Voucher }>(`/vouchers/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ directorSignature }),
    });
  },

  async rejectVoucher(id: string, rejectionReason: string): Promise<{ message: string; voucher: Voucher }> {
    return request<{ message: string; voucher: Voucher }>(`/vouchers/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ rejectionReason }),
    });
  },

  async processReimbursement(
    id: string,
    data: { paymentReference: string; paymentStatus?: 'reimbursed' | 'processing' }
  ): Promise<{ message: string; voucher: Voucher }> {
    return request<{ message: string; voucher: Voucher }>(`/vouchers/${id}/reimburse`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
