import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../api/axiosInstance';
import axiosPublicInstance from '../api/axiosPublicInstance';
import { fetchUserProfile } from './myProfileSlice';
import { jwtDecode } from 'jwt-decode';
import axios from "axios";



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

export type registerData = {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  status: string;
  about_me: string;
  avatar: File | null;
};


export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { dispatch }) => {
    try {
      const response = await axiosInstance.post('http://127.0.0.1:8080/api/user/token/', credentials);
      const { access, refresh } = response.data;
      localStorage.setItem('access', access);
      localStorage.setItem('refresh', refresh);

      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${access}`;

      await dispatch(fetchUserProfile());

      return { access, refresh };
    } catch (error) {
      throw error;
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = localStorage.getItem('refresh');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      const response = await axiosInstance.post('http://127.0.0.1:8080/api/user/token/refresh/', { refresh: refreshToken });
      const { access } = response.data;
      localStorage.setItem('access', access);

      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${access}`;

      return access;
    } catch (error) {
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      return rejectWithValue('Failed to refresh token');
    }
  }
);

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
      // Step 1: User register
      const registerResponse = await axiosPublicInstance.post(
        'user/register/',
        registrationData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      console.log('Registration response:', registerResponse);

      // Step: get tokens
      const { data } = await axiosPublicInstance.post('user/token/', {
        email: registrationData.email,
        password: registrationData.password
      });

      const { access, refresh } = data;
      localStorage.setItem('access', access);
      localStorage.setItem('refresh', refresh);

      const { exp } = jwtDecode<{ exp: number }>(access);

      return { access, refresh, expiresAt: exp };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Registration error:', error.response?.data);
        return rejectWithValue(error.response?.data || 'Registration failed');
      }
      return rejectWithValue('An unexpected error occurred');
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
      state.expiresAt = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.access;
        state.refreshToken = action.payload.refresh;
        state.isAuthenticated = true;
        // state.expiresAt = action.payload.expiresAt;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
        state.isAuthenticated = false;
      })

      // Refresh Token
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.accessToken = action.payload;
        state.error = null;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = 'Token refresh failed';
      })

      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.error = action.error.message || 'Logout failed';
      })

      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.access;
        state.refreshToken = action.payload.refresh;
        state.isAuthenticated = true;
        state.expiresAt = action.payload.expiresAt;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Registration failed';
        state.isAuthenticated = false;
      });
  },
});
export const { clearAuthState } = authSlice.actions;
export default authSlice.reducer;