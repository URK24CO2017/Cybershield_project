import {
  AuthResponse, User, Device, AccessRequest, AccessPolicy, ActiveSession,
  AttackSimResult, ThreatEvaluation, PrivacySimResult, Notification,
  AuditLog, DashboardMetrics
} from '../types';

const API_BASE = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE || '').replace(/\/$/, '') + '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('cybershield_token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('cybershield_token', token);
}

export function removeAuthToken(): void {
  localStorage.removeItem('cybershield_token');
  localStorage.removeItem('cybershield_user');
}

async function fetchWithAuth<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    removeAuthToken();
    window.dispatchEvent(new Event('auth:unauthorized'));
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    let errorMsg = `API Error: ${response.statusText}`;
    try {
      const errData = await response.json();
      errorMsg = errData.detail || errorMsg;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Authentication
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Login failed');
    }
    const data: AuthResponse = await res.json();
    setAuthToken(data.access_token);
    localStorage.setItem('cybershield_user', JSON.stringify(data.user));
    return data;
  },

  register: async (formData: {
    email: string;
    full_name: string;
    password: string;
    confirm_password: string;
    role: string;
  }): Promise<User> => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Registration failed');
    }
    return res.json();
  },

  getMe: async (): Promise<User> => {
    return fetchWithAuth<User>('/auth/me');
  },

  updateProfile: async (full_name: string, department: string): Promise<User> => {
    return fetchWithAuth<User>(`/auth/profile?full_name=${encodeURIComponent(full_name)}&department=${encodeURIComponent(department)}`, {
      method: 'PUT',
    });
  },

  changePassword: async (old_password: string, new_password: string, confirm_password: string) => {
    return fetchWithAuth<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ old_password, new_password, confirm_password }),
    });
  },

  // Dashboard
  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    return fetchWithAuth<DashboardMetrics>('/dashboard/metrics');
  },

  // Access Control
  getAccessRequests: async (): Promise<AccessRequest[]> => {
    return fetchWithAuth<AccessRequest[]>('/access-control/requests');
  },

  evaluateAccess: async (payload: {
    resource: string;
    resource_type: string;
    context_ip?: string;
    simulated_role?: string;
    base_risk_modifier?: number;
  }) => {
    return fetchWithAuth<any>('/access-control/evaluate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  takeAccessAction: async (requestId: string, action: 'Approve' | 'Deny') => {
    return fetchWithAuth<any>(`/access-control/action/${encodeURIComponent(requestId)}?action=${action}`, {
      method: 'POST',
    });
  },

  getAccessPolicies: async (): Promise<AccessPolicy[]> => {
    return fetchWithAuth<AccessPolicy[]>('/access-control/policies');
  },

  updateAccessPolicy: async (policyId: number, data: Partial<AccessPolicy>) => {
    return fetchWithAuth<any>(`/access-control/policies/${policyId}?requires_approval_above_risk=${data.requires_approval_above_risk ?? ''}&auto_deny_above_risk=${data.auto_deny_above_risk ?? ''}`, {
      method: 'PUT',
    });
  },

  getActiveSessions: async (): Promise<ActiveSession[]> => {
    return fetchWithAuth<ActiveSession[]>('/access-control/sessions');
  },

  revokeSession: async (sessionId: string) => {
    return fetchWithAuth<any>(`/access-control/sessions/${sessionId}/revoke`, {
      method: 'POST',
    });
  },

  // Digital Twin
  getTopology: async () => {
    return fetchWithAuth<{
      devices: Device[];
      rooms: any[];
      connections: any[];
      laboratory_name: string;
      last_sync: string;
    }>('/digital-twin/topology');
  },

  toggleQuarantine: async (deviceId: string, isolate: boolean) => {
    return fetchWithAuth<any>(`/digital-twin/quarantine/${deviceId}?isolate=${isolate}`, {
      method: 'POST',
    });
  },

  // Attack Simulation
  getAttackScenarios: async () => {
    return fetchWithAuth<any[]>('/attack-simulation/scenarios');
  },

  runAttackSimulation: async (scenarioId: string): Promise<AttackSimResult> => {
    return fetchWithAuth<AttackSimResult>('/attack-simulation/run', {
      method: 'POST',
      body: JSON.stringify({ scenario_id: scenarioId }),
    });
  },

  containAttack: async (deviceName: string) => {
    return fetchWithAuth<any>(`/attack-simulation/contain/${encodeURIComponent(deviceName)}`, {
      method: 'POST',
    });
  },

  resetAttackSimulation: async () => {
    return fetchWithAuth<any>('/attack-simulation/reset', {
      method: 'POST',
    });
  },

  // Threat Detection
  getThreatEvaluation: async (): Promise<ThreatEvaluation> => {
    return fetchWithAuth<ThreatEvaluation>('/threat-detection/evaluation');
  },

  scoreCustomThreat: async (features: Record<string, number>) => {
    return fetchWithAuth<any>('/threat-detection/score-event', {
      method: 'POST',
      body: JSON.stringify(features),
    });
  },

  // Privacy Simulation
  runPrivacySimulation: async (params: {
    dataset_name?: string;
    privacy_method?: string;
    epsilon: number;
    policy_name?: string;
    sample_size?: number;
  }): Promise<PrivacySimResult> => {
    return fetchWithAuth<PrivacySimResult>('/privacy-simulation/run', {
      method: 'POST',
      body: JSON.stringify({
        dataset_name: params.dataset_name || 'Synthetic Laboratory Data',
        privacy_method: params.privacy_method || 'Differential Privacy',
        epsilon: params.epsilon,
        policy_name: params.policy_name || 'Risk-Adaptive Access Control',
        sample_size: params.sample_size || 500,
      }),
    });
  },

  // Devices
  getDevices: async (): Promise<Device[]> => {
    return fetchWithAuth<Device[]>('/devices');
  },

  createDevice: async (device: Partial<Device>): Promise<Device> => {
    return fetchWithAuth<Device>('/devices', {
      method: 'POST',
      body: JSON.stringify(device),
    });
  },

  updateDevice: async (deviceId: string, data: Partial<Device>): Promise<Device> => {
    return fetchWithAuth<Device>(`/devices/${deviceId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteDevice: async (deviceId: string) => {
    return fetchWithAuth<any>(`/devices/${deviceId}`, {
      method: 'DELETE',
    });
  },

  // Users
  getUsers: async (): Promise<User[]> => {
    return fetchWithAuth<User[]>('/users');
  },

  updateUserRole: async (userId: number, newRole: string): Promise<User> => {
    return fetchWithAuth<User>(`/users/${userId}/role?new_role=${encodeURIComponent(newRole)}`, {
      method: 'PUT',
    });
  },

  toggleUserStatus: async (userId: number, isActive: boolean): Promise<User> => {
    return fetchWithAuth<User>(`/users/${userId}/status?is_active=${isActive}`, {
      method: 'PUT',
    });
  },

  // Logs
  getLogs: async (filters: {
    log_type?: string;
    event_type?: string;
    user_pseudonym?: string;
    device?: string;
  }): Promise<AuditLog[]> => {
    const params = new URLSearchParams();
    if (filters.log_type) params.append('log_type', filters.log_type);
    if (filters.event_type) params.append('event_type', filters.event_type);
    if (filters.user_pseudonym) params.append('user_pseudonym', filters.user_pseudonym);
    if (filters.device) params.append('device', filters.device);
    return fetchWithAuth<AuditLog[]>(`/logs?${params.toString()}`);
  },

  // Settings
  getSettings: async (): Promise<Record<string, string>> => {
    return fetchWithAuth<Record<string, string>>('/settings');
  },

  saveSettings: async (settingsMap: Record<string, string>) => {
    return fetchWithAuth<any>('/settings', {
      method: 'POST',
      body: JSON.stringify(settingsMap),
    });
  },

  // Notifications
  getNotifications: async (): Promise<Notification[]> => {
    return fetchWithAuth<Notification[]>('/notifications');
  },

  markNotificationRead: async (id: number) => {
    return fetchWithAuth<any>(`/notifications/${id}/read`, {
      method: 'POST',
    });
  },

  resolveNotification: async (id: number) => {
    return fetchWithAuth<any>(`/notifications/${id}/resolve`, {
      method: 'POST',
    });
  },

  markAllNotificationsRead: async () => {
    return fetchWithAuth<any>('/notifications/mark-all-read', {
      method: 'POST',
    });
  },
};
