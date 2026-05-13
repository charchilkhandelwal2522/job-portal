import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../api/client';

const STORAGE_KEY = 'jp_user';

function persistUser(user) {
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    const { data } = await api.get('/users', {
      params: {
        'email:eq': email,
        'password:eq': password,
      },
    });
    const list = Array.isArray(data) ? data : data?.data ?? [];
    if (!list.length) {
      return rejectWithValue('Invalid email or password.');
    }
    const user = list[0];
    const safe = { id: user.id, email: user.email, name: user.name, role: user.role };
    persistUser(safe);
    return safe;
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ email, password, name }, { rejectWithValue }) => {
    const check = await api.get('/users', { params: { 'email:eq': email } });
    const existing = Array.isArray(check.data) ? check.data : check.data?.data ?? [];
    if (existing.length) {
      return rejectWithValue('An account with this email already exists.');
    }
    const { data } = await api.post('/users', {
      email,
      password,
      name,
      role: 'user',
    });
    const safe = { id: data.id, email: data.email, name: data.name, role: data.role };
    persistUser(safe);
    return safe;
  }
);

function loadStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: loadStoredUser(),
    status: 'idle',
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.error = null;
      state.status = 'idle';
      persistUser(null);
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = typeof action.payload === 'string' ? action.payload : 'Login failed.';
      })
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = typeof action.payload === 'string' ? action.payload : 'Registration failed.';
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
