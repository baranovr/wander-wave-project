import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../api/axiosInstance';



interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  accessToken: localStorage.getItem('access_token'),
  refreshToken: localStorage.getItem('refresh_token'),
  loading: false,
  error: null,
  isAuthenticated: false,
};

type registerData = {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  status: string;
  about_me: string;
  avatar: string;
};


export const login = createAsyncThunk(
  'auth/login',
  async (
    { username, password }: { username: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await axiosInstance.post('/api/user/token/', { username, password });
      const { access, refresh } = response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      return { access, refresh };
    } catch (error) {
      return rejectWithValue('Login failed');
    }
  },
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { auth: AuthState };
    const refreshToken = state.auth.refreshToken;

    try {
      const response = await axiosInstance.post('/api/user/token/refresh/', {
        refresh: refreshToken,
      });
      const { access, refresh } = response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      return { access, refresh };
    } catch (error) {
      return rejectWithValue('Token refresh failed');
    }
  },
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { auth: AuthState };
    const refreshToken = state.auth.refreshToken;

    try {
      const response = await axiosInstance.post('/api/user/my_profile/logout/', {
        refresh_token: refreshToken,
      });
      if (response.status === 205) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        return;
      } else {
        return rejectWithValue('Logout failed');
      }
    } catch (error) {
      return rejectWithValue('Logout failed');
    }
  },
);

export const register = createAsyncThunk(
  'auth/register',
  async (registrationData: registerData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        '/api/user/register/',
        registrationData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      const { access, refresh } = response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      return { access, refresh };
    } catch (error) {
      return rejectWithValue('Registration failed');
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthState(state) {
      state.accessToken = null;
      state.refreshToken = null;
      state.loading = false;
      state.error = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(login.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        login.fulfilled,
        (state, action: PayloadAction<{ access: string; refresh: string }>) => {
          state.loading = false;
          state.accessToken = action.payload.access;
          state.refreshToken = action.payload.refresh;
          state.isAuthenticated = true;
        },
      )
      .addCase(login.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(refreshToken.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        refreshToken.fulfilled,
        (state, action: PayloadAction<{ access: string; refresh: string }>) => {
          state.loading = false;
          state.accessToken = action.payload.access;
          state.refreshToken = action.payload.refresh;
        },
      )
      .addCase(refreshToken.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logout.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, state => {
        state.loading = false;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      })
      .addCase(logout.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(register.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        register.fulfilled,
        (state, action: PayloadAction<{ access: string; refresh: string }>) => {
          state.loading = false;
          state.accessToken = action.payload.access;
          state.refreshToken = action.payload.refresh;
          state.isAuthenticated = true;
        },
      )
      .addCase(register.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAuthState } = authSlice.actions;
export default authSlice.reducer;