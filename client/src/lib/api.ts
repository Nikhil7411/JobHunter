import { apiRequest } from './queryClient';
import { LoginCredentials } from '@shared/schema';

// Auth API
export const loginApi = async (credentials: LoginCredentials) => {
  const response = await apiRequest('POST', '/api/auth/login', credentials);
  return response.json();
};

export const registerApi = async (userData: any) => {
  const response = await apiRequest('POST', '/api/auth/register', userData);
  return response.json();
};

export const getCurrentUserApi = async () => {
  const response = await apiRequest('GET', '/api/auth/me');
  return response.json();
};

export const updateProfileApi = async (profileData: any) => {
  const response = await apiRequest('PUT', '/api/profile', profileData);
  return response.json();
};

// Jobs API
export const getJobsApi = async (filters?: {
  search?: string;
  location?: string;
  type?: string;
  tags?: string[];
}) => {
  let url = '/api/jobs';
  
  if (filters) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.location) params.append('location', filters.location);
    if (filters.type) params.append('type', filters.type);
    if (filters.tags && filters.tags.length > 0) params.append('tags', filters.tags.join(','));
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
  }
  
  const response = await apiRequest('GET', url);
  return response.json();
};

export const getJobByIdApi = async (id: number) => {
  const response = await apiRequest('GET', `/api/jobs/${id}`);
  return response.json();
};

export const createJobApi = async (jobData: any) => {
  const response = await apiRequest('POST', '/api/jobs', jobData);
  return response.json();
};

export const updateJobApi = async (id: number, jobData: any) => {
  const response = await apiRequest('PUT', `/api/jobs/${id}`, jobData);
  return response.json();
};

export const deleteJobApi = async (id: number) => {
  await apiRequest('DELETE', `/api/jobs/${id}`);
  return id;
};

// Applications API
export const getApplicationsApi = async (jobId?: number) => {
  let url = '/api/applications';
  if (jobId) {
    url += `?jobId=${jobId}`;
  }
  
  const response = await apiRequest('GET', url);
  return response.json();
};

export const applyForJobApi = async (id: number, applicationData: any) => {
  const response = await apiRequest('POST', `/api/jobs/${id}/apply`, applicationData);
  return response.json();
};

export const updateApplicationStatusApi = async (id: number, status: string) => {
  const response = await apiRequest('PUT', `/api/applications/${id}/status`, { status });
  return response.json();
};

// Stats API
export const getStatsApi = async () => {
  const response = await apiRequest('GET', '/api/stats');
  return response.json();
};
