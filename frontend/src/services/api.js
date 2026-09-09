const API_BASE_URL = 'https://customer-support-helpdesk-ticketing.onrender.com/api';

// Helper to make API requests with automatic Authorization header
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      // Clear token on 401 unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    const error = new Error(data.message || 'An error occurred with the request');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Authentication
  auth: {
    login: (credentials) => request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),
    register: (userData) => request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),
    getMe: () => request('/auth/me'),
    getAgents: () => request('/auth/agents'),
    seed: () => request('/auth/seed', { method: 'POST' })
  },

  // Categories
  categories: {
    getAll: (includeInactive = false) =>
      request(`/categories${includeInactive ? '?includeInactive=true' : ''}`),
    create: (data) => request('/categories', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id, data) => request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    toggleStatus: (id) => request(`/categories/${id}/status`, {
      method: 'PATCH'
    })
  },

  // Tickets
  tickets: {
    list: (params = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query.append(key, value);
        }
      });
      const queryString = query.toString();
      return request(`/tickets${queryString ? `?${queryString}` : ''}`);
    },
    getById: (id) => request(`/tickets/${id}`),
    create: (data) => request('/tickets', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    assign: (id, agentId) => request(`/tickets/${id}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ agentId })
    }),
    updateStatus: (id, status) => request(`/tickets/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    }),
    updatePriority: (id, priority) => request(`/tickets/${id}/priority`, {
      method: 'PUT',
      body: JSON.stringify({ priority })
    }),
    escalate: (id, reason) => request(`/tickets/${id}/escalate`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    }),
    reviewEscalation: (id, data) => request(`/tickets/${id}/escalation-review`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    getSla: (id) => request(`/tickets/${id}/sla`),
    getComments: (id) => request(`/tickets/${id}/comments`),
    addComment: (id, message) => request(`/tickets/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ message })
    }),
    getNotes: (id) => request(`/tickets/${id}/notes`),
    addNote: (id, note) => request(`/tickets/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ note })
    }),
    getSatisfaction: (id) => request(`/tickets/${id}/satisfaction`),
    submitSatisfaction: (id, data) => request(`/tickets/${id}/satisfaction`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  // Analytics
  analytics: {
    getAgentWorkload: () => request('/analytics/agent-workload'),
    getManagerReports: () => request('/analytics/manager-reports')
  }
};
