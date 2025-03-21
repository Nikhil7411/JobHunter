import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Job, InsertJob, Application } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { RootState } from './index';

interface JobsState {
  jobs: Job[];
  currentJob: Job | null;
  applications: Application[];
  stats: {
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
    viewCount: number;
  };
  filters: {
    search: string;
    location: string;
    type: string;
    tags: string[];
  };
  loading: boolean;
  error: string | null;
}

const initialState: JobsState = {
  jobs: [],
  currentJob: null,
  applications: [],
  stats: {
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    viewCount: 0
  },
  filters: {
    search: '',
    location: '',
    type: '',
    tags: []
  },
  loading: false,
  error: null
};

// Fetch all jobs with optional filters
export const fetchJobs = createAsyncThunk(
  'jobs/fetchJobs',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const { search, location, type, tags } = state.jobs.filters;
      
      let url = '/api/jobs';
      const params = new URLSearchParams();
      
      if (search) params.append('search', search);
      if (location) params.append('location', location);
      if (type) params.append('type', type);
      if (tags.length > 0) params.append('tags', tags.join(','));
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await apiRequest('GET', url);
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch jobs');
    }
  }
);

// Fetch a job by ID
export const fetchJobById = createAsyncThunk(
  'jobs/fetchJobById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await apiRequest('GET', `/api/jobs/${id}`);
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch job details');
    }
  }
);

// Create a new job
export const createJob = createAsyncThunk(
  'jobs/createJob',
  async (jobData: InsertJob, { rejectWithValue }) => {
    try {
      const response = await apiRequest('POST', '/api/jobs', jobData);
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create job');
    }
  }
);

// Update a job
export const updateJob = createAsyncThunk(
  'jobs/updateJob',
  async ({ id, jobData }: { id: number; jobData: Partial<Job> }, { rejectWithValue }) => {
    try {
      const response = await apiRequest('PUT', `/api/jobs/${id}`, jobData);
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update job');
    }
  }
);

// Delete a job
export const deleteJob = createAsyncThunk(
  'jobs/deleteJob',
  async (id: number, { rejectWithValue }) => {
    try {
      await apiRequest('DELETE', `/api/jobs/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete job');
    }
  }
);

// Apply for a job
export const applyForJob = createAsyncThunk(
  'jobs/applyForJob',
  async ({ id, applicationData }: { id: number; applicationData: any }, { rejectWithValue }) => {
    try {
      const response = await apiRequest('POST', `/api/jobs/${id}/apply`, applicationData);
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to submit application');
    }
  }
);

// Fetch applications
export const fetchApplications = createAsyncThunk(
  'jobs/fetchApplications',
  async (jobId?: number, { rejectWithValue }) => {
    try {
      let url = '/api/applications';
      if (jobId) {
        url += `?jobId=${jobId}`;
      }
      
      const response = await apiRequest('GET', url);
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch applications');
    }
  }
);

// Update application status
export const updateApplicationStatus = createAsyncThunk(
  'jobs/updateApplicationStatus',
  async ({ id, status }: { id: number; status: string }, { rejectWithValue }) => {
    try {
      const response = await apiRequest('PUT', `/api/applications/${id}/status`, { status });
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update application status');
    }
  }
);

// Fetch stats
export const fetchStats = createAsyncThunk(
  'jobs/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiRequest('GET', '/api/stats');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch stats');
    }
  }
);

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<{ key: string; value: any }>) => {
      const { key, value } = action.payload;
      (state.filters as any)[key] = value;
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearCurrentJob: (state) => {
      state.currentJob = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch jobs
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchJobs.fulfilled, (state, action: PayloadAction<Job[]>) => {
        state.loading = false;
        state.jobs = action.payload;
        state.error = null;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch job by ID
    builder
      .addCase(fetchJobById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchJobById.fulfilled, (state, action: PayloadAction<Job>) => {
        state.loading = false;
        state.currentJob = action.payload;
        state.error = null;
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create job
    builder
      .addCase(createJob.pending, (state) => {
        state.loading = true;
      })
      .addCase(createJob.fulfilled, (state, action: PayloadAction<Job>) => {
        state.loading = false;
        state.jobs.unshift(action.payload);
        state.error = null;
        // Invalidate jobs query to refresh the list
        queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
        queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      })
      .addCase(createJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update job
    builder
      .addCase(updateJob.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateJob.fulfilled, (state, action: PayloadAction<Job>) => {
        state.loading = false;
        state.jobs = state.jobs.map(job => 
          job.id === action.payload.id ? action.payload : job
        );
        if (state.currentJob && state.currentJob.id === action.payload.id) {
          state.currentJob = action.payload;
        }
        state.error = null;
        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
        queryClient.invalidateQueries({ queryKey: [`/api/jobs/${action.payload.id}`] });
        queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      })
      .addCase(updateJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete job
    builder
      .addCase(deleteJob.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteJob.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.jobs = state.jobs.filter(job => job.id !== action.payload);
        if (state.currentJob && state.currentJob.id === action.payload) {
          state.currentJob = null;
        }
        state.error = null;
        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
        queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      })
      .addCase(deleteJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Apply for job
    builder
      .addCase(applyForJob.pending, (state) => {
        state.loading = true;
      })
      .addCase(applyForJob.fulfilled, (state, action: PayloadAction<Application>) => {
        state.loading = false;
        state.applications.unshift(action.payload);
        state.error = null;
        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
        queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      })
      .addCase(applyForJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch applications
    builder
      .addCase(fetchApplications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchApplications.fulfilled, (state, action: PayloadAction<Application[]>) => {
        state.loading = false;
        state.applications = action.payload;
        state.error = null;
      })
      .addCase(fetchApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update application status
    builder
      .addCase(updateApplicationStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateApplicationStatus.fulfilled, (state, action: PayloadAction<Application>) => {
        state.loading = false;
        state.applications = state.applications.map(app => 
          app.id === action.payload.id ? action.payload : app
        );
        state.error = null;
        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
      })
      .addCase(updateApplicationStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch stats
    builder
      .addCase(fetchStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStats.fulfilled, (state, action: PayloadAction<typeof initialState.stats>) => {
        state.loading = false;
        state.stats = action.payload;
        state.error = null;
      })
      .addCase(fetchStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setFilter, clearFilters, clearCurrentJob, clearError } = jobsSlice.actions;
export default jobsSlice.reducer;
