import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

export const dashboardAPI = {
  metrics: () => api.get('/api/dashboard/metrics'),
};

export const leadsAPI = {
  list: (skip = 0, limit = 50, params: Record<string, string | undefined> = {}) =>
    api.get('/api/leads', { params: { skip, limit, ...params } }),
  get: (id: number) => api.get(`/api/leads/${id}`),
  create: (lead: unknown) => api.post('/api/leads', lead),
  update: (id: number, lead: unknown) => api.put(`/api/leads/${id}`, lead),
  delete: (id: number) => api.delete(`/api/leads/${id}`),
};

export const importAPI = {
  csv: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/import/csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const extractionAPI = {
  start: (filters: unknown) => api.post('/api/extraction/start', filters),
  status: (jobId: number) => api.get(`/api/extraction/job/${jobId}`),
};

export const outreachAPI = {
  logWhatsApp: (leadId: number, messageText: string) =>
    api.post('/api/outreach', {
      lead_id: leadId,
      channel: 'whatsapp',
      message_text: messageText,
    }),
};

export default api;
