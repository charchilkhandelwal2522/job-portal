import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api, buildJobsQuery, normalizePagedList } from '../api/client';

const initialFilters = {
  q: '',
  employmentType: '',
  location: '',
};

export const fetchJobs = createAsyncThunk(
  'jobs/fetchPaged',
  async ({ page, perPage, q, employmentType, location }) => {
    const qs = buildJobsQuery({ page, perPage, q, employmentType, location });
    const { data } = await api.get(`/jobs?${qs}`);
    const normalized = normalizePagedList(data);
    return {
      ...normalized,
      page,
    };
  }
);

export const fetchJobById = createAsyncThunk('jobs/fetchOne', async (id) => {
  const { data } = await api.get(`/jobs/${id}`);
  return data;
});

export const fetchAllJobsAdmin = createAsyncThunk('jobs/fetchAllAdmin', async () => {
  const { data } = await api.get('/jobs');
  return Array.isArray(data) ? data : data?.data ?? [];
});

export const createJob = createAsyncThunk('jobs/create', async (payload) => {
  const { data } = await api.post('/jobs', payload);
  return data;
});

export const updateJob = createAsyncThunk('jobs/update', async ({ id, ...payload }) => {
  const { data } = await api.put(`/jobs/${id}`, { ...payload, id });
  return data;
});

export const deleteJob = createAsyncThunk('jobs/delete', async (id) => {
  await api.delete(`/jobs/${id}`);
  return id;
});

const jobsSlice = createSlice({
  name: 'jobs',
  initialState: {
    list: [],
    page: 1,
    pages: 1,
    total: 0,
    perPage: 6,
    filters: { ...initialFilters },
    listStatus: 'idle',
    listError: null,
    currentJob: null,
    currentStatus: 'idle',
    currentError: null,
    adminList: [],
    adminStatus: 'idle',
  },
  reducers: {
    setJobFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
      state.page = 1;
    },
    setJobPage(state, action) {
      state.page = action.payload;
    },
    resetJobFilters(state) {
      state.filters = { ...initialFilters };
      state.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.listStatus = 'loading';
        state.listError = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.listStatus = 'succeeded';
        state.list = action.payload.rows;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
        state.total = action.payload.total;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.listStatus = 'failed';
        state.listError = action.error.message ?? 'Could not load jobs.';
      })
      .addCase(fetchJobById.pending, (state) => {
        state.currentStatus = 'loading';
        state.currentError = null;
        state.currentJob = null;
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.currentStatus = 'succeeded';
        state.currentJob = action.payload;
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.currentStatus = 'failed';
        state.currentError = action.error.message ?? 'Job not found.';
      })
      .addCase(fetchAllJobsAdmin.pending, (state) => {
        state.adminStatus = 'loading';
      })
      .addCase(fetchAllJobsAdmin.fulfilled, (state, action) => {
        state.adminStatus = 'succeeded';
        state.adminList = action.payload;
      })
      .addCase(fetchAllJobsAdmin.rejected, (state) => {
        state.adminStatus = 'failed';
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.adminList.push(action.payload);
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        const i = state.adminList.findIndex((j) => j.id === action.payload.id);
        if (i !== -1) state.adminList[i] = action.payload;
        if (state.currentJob?.id === action.payload.id) {
          state.currentJob = action.payload;
        }
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.adminList = state.adminList.filter((j) => j.id !== action.payload);
        if (state.currentJob?.id === action.payload) {
          state.currentJob = null;
        }
      });
  },
});

export const { setJobFilters, setJobPage, resetJobFilters } = jobsSlice.actions;
export default jobsSlice.reducer;
