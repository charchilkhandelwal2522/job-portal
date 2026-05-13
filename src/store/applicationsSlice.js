import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../api/client';

/**
 * json-server coerces `userId:eq=2` to a number, but stored rows use string ids (`"2"`).
 * Strict `===` in filters then matches nothing. Use `_where` with explicit string `eq`.
 */
function whereStringEq(fields) {
  const o = {};
  for (const [key, val] of Object.entries(fields)) {
    o[key] = { eq: String(val) };
  }
  return JSON.stringify(o);
}

export const fetchMyApplications = createAsyncThunk(
  'applications/fetchMine',
  async (userId) => {
    const { data } = await api.get('/applications', {
      params: {
        _where: whereStringEq({ userId }),
        _embed: 'job',
      },
    });
    const list = Array.isArray(data) ? data : data?.data ?? [];
    return list;
  }
);

export const fetchAllApplicationsAdmin = createAsyncThunk(
  'applications/fetchAllAdmin',
  async () => {
    const { data } = await api.get('/applications?_embed=user&_embed=job');
    const list = Array.isArray(data) ? data : data?.data ?? [];
    return list;
  }
);

/** @param {{ jobId: string, userId: string }} arg */
export const applyToJob = createAsyncThunk(
  'applications/apply',
  async ({ jobId, userId }, { rejectWithValue }) => {
    const dup = await api.get('/applications', {
      params: {
        _where: whereStringEq({ userId, jobId }),
      },
    });
    const existing = Array.isArray(dup.data) ? dup.data : dup.data?.data ?? [];
    if (existing.length) {
      return rejectWithValue('You have already applied to this job.');
    }
    const { data } = await api.post('/applications', {
      jobId: String(jobId),
      userId: String(userId),
      appliedAt: new Date().toISOString(),
      status: 'submitted',
    });
    return data;
  }
);

const applicationsSlice = createSlice({
  name: 'applications',
  initialState: {
    mine: [],
    mineStatus: 'idle',
    all: [],
    allStatus: 'idle',
    applyStatus: 'idle',
    applyError: null,
  },
  reducers: {
    clearApplyError(state) {
      state.applyError = null;
      state.applyStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyApplications.pending, (state) => {
        state.mineStatus = 'loading';
      })
      .addCase(fetchMyApplications.fulfilled, (state, action) => {
        state.mineStatus = 'succeeded';
        state.mine = action.payload;
      })
      .addCase(fetchMyApplications.rejected, (state) => {
        state.mineStatus = 'failed';
      })
      .addCase(fetchAllApplicationsAdmin.pending, (state) => {
        state.allStatus = 'loading';
      })
      .addCase(fetchAllApplicationsAdmin.fulfilled, (state, action) => {
        state.allStatus = 'succeeded';
        state.all = action.payload;
      })
      .addCase(fetchAllApplicationsAdmin.rejected, (state) => {
        state.allStatus = 'failed';
      })
      .addCase(applyToJob.pending, (state) => {
        state.applyStatus = 'loading';
        state.applyError = null;
      })
      .addCase(applyToJob.fulfilled, (state) => {
        state.applyStatus = 'succeeded';
      })
      .addCase(applyToJob.rejected, (state, action) => {
        state.applyStatus = 'failed';
        state.applyError =
          typeof action.payload === 'string' ? action.payload : 'Could not submit application.';
      });
  },
});

export const { clearApplyError } = applicationsSlice.actions;
export default applicationsSlice.reducer;
