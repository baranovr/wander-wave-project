import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../api/axiosInstance';
import { User } from '../types/User';
import { Post } from '../types/Post';
import {refreshToken} from "./authSlice";

export type Subscription = {
  id: number;
  avatar: string;
  status: string;
  username: string;
  email: string;
  full_name: string;
  view_more: string;
  unsubscribe: string;
};

export type Liked = {
  id: number;
  post: Post;
};

interface ProfileState {
  profile: User | null;
  loading: boolean;
  error: string | null;
  subscriptions: Subscription[];
  liked: Liked[];
  favorites: Liked[];
  favLoading: boolean;
  favError: boolean;
}

const initialState: ProfileState = {
  profile: null,
  loading: false,
  error: null,
  subscriptions: [],
  liked: [],
  favorites: [],
  favLoading: false,
  favError: false,
};

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const retryWithBackoff = async (fn: () => Promise<any>, maxRetries = 3) => {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      return await fn();
    } catch (error: any) {
      if (error.response && error.response.status === 429) {
        retries++;
        const delay = Math.pow(2, retries) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries reached');
};

export const fetchUserProfile = createAsyncThunk(
  'profile/fetchUserProfile',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await retryWithBackoff(() => axiosInstance.get('http://127.0.0.1:8080/api/user/my_profile/'));
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        // If error 401 - try to refresh
        try {
          await dispatch(refreshToken()).unwrap();
          // If the token update was successful, retry the profile request
          const retryResponse = await axiosInstance.get('http://127.0.0.1:8080/api/user/my_profile/');
          return retryResponse.data;
        } catch (refreshError) {
          // If the token update fails, redirect to the login page
          // Here you can dispatch action to redirect or use navigate from react-router
          return rejectWithValue('Session expired. Please log in again.');
        }
      }
      return rejectWithValue('Failed to fetch user profile');
    }
  }
);

export const fetchSubscriptions = createAsyncThunk(
  'profile/fetchMySubscriptions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('http://127.0.0.1:8080/api/user/my_profile/subscriptions/');
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to fetch subscriptions');
    }
  },
);

export const fetchMyLiked = createAsyncThunk(
  'profile/fetchMyLiked',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('http://127.0.0.1:8080/api/user/my_profile/my_liked/');
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to fetch likes');
    }
  },
);

export const fetchMyFavorites = createAsyncThunk(
  'profile/fetchMyFavorites',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('http://127.0.0.1:8080/api/user/my_profile/my_favorites/');
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to fetch favorites');
    }
  },
);

const myProfileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfileState(state) {
      state.profile = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchUserProfile.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchUserProfile.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.loading = false;
          state.profile = action.payload;
        },
      )
      .addCase(
        fetchUserProfile.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload;
        },
      )
      .addCase(
        fetchSubscriptions.fulfilled,
        (state, action: PayloadAction<Subscription[]>) => {
          state.subscriptions = action.payload;
        },
      )
      .addCase(
        fetchMyLiked.fulfilled,
        (state, action: PayloadAction<Liked[]>) => {
          state.liked = action.payload;
        },
      )
      .addCase(
        fetchMyFavorites.pending,
        (state) => {
          state.favLoading = true;
          state.favError = false;
        },
      )
      .addCase(
        fetchMyFavorites.rejected,
        (state) => {
          state.favError = true;
          state.favLoading = false;
        },
      )
      .addCase(
        fetchMyFavorites.fulfilled,
        (state, action: PayloadAction<Liked[]>) => {
          state.favorites = action.payload;
          state.favLoading = false;
        },
      );
  },
});

export const { clearProfileState } = myProfileSlice.actions;
export default myProfileSlice.reducer;
