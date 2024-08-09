import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../api/axiosInstance';
import { fetchUserProfile } from './myProfileSlice';
import { jwtDecode } from 'jwt-decode';



interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  expiresAt: number | null;
}

const initialState: AuthState = {
  accessToken: localStorage.getItem('access'),
  refreshToken: localStorage.getItem('refresh'),
  loading: false,
  error: null,
  isAuthenticated: false,
  expiresAt: null,
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
  'auth/authenticate',
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      // Step 1: Log in and get tokens
      const response = await axiosInstance.post('http://127.0.0.1:8080/api/user/token/', { email, password });
      const { access, refresh } = response.data;
      localStorage.setItem('access', access);
      localStorage.setItem('refresh', refresh);

      // Step 2: Decode token to get expiration time
      const { exp } = jwtDecode<{ exp: number }>(access);

      // Step 3: Fetch user data if token is valid
      if (exp * 1000 > Date.now()) {
        const user = await fetchUserProfile();
        return { access, refresh, user, expiresAt: exp };
      }

      // Step 4: Refresh token if expired
      await refreshToken();
    } catch (error) {
      return rejectWithValue('Authentication failed');
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.post('http://127.0.0.1:8080/api/user/token/refresh/', {
      refresh: localStorage.getItem('refresh'),
    });
    const { access, refresh } = data;
    localStorage.setItem('access', access);
    localStorage.setItem('refresh', refresh);
    const { exp } = jwtDecode<{ exp: number }>(access);
    return { accessToken: access, refreshToken: refresh, expiresAt: exp };
  } catch (error) {
    return rejectWithValue('Token refresh failed');
  }
});

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { auth: AuthState };
    const refreshToken = state.auth.refreshToken;

    try {
      const response = await axiosInstance.post('http://127.0.0.1:8080/api/user/my_profile/logout/', {
        refresh: refreshToken,
      });
      if (response.status === 205) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
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
        'http://127.0.0.1:8080/api/user/register/',
        registrationData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      const { access, refresh } = response.data;
      localStorage.setItem('access', access);
      localStorage.setItem('refresh', refresh);
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
      .addCase(login.fulfilled, (state, action: PayloadAction<{ access: string; refresh: string; user: any; expiresAt: number } | undefined>) => {
        state.loading = false;
        if (action.payload) {
          state.accessToken = action.payload.access;
          state.refreshToken = action.payload.refresh;
          state.loading = false;
          state.isAuthenticated = true;
          state.expiresAt = action.payload.expiresAt;
        } else {
          state.error = 'Authentication failed';
        }
      })
      .addCase(login.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.accessToken = action.payload?.accessToken;
        state.refreshToken = action.payload?.refreshToken;
        state.expiresAt = action.payload?.expiresAt;
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