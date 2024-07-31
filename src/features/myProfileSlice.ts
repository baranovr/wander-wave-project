import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { User } from '../types/User';
import { Post } from '../types/Post';

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

export const fetchUserProfile = createAsyncThunk(
  'profile/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/user/my_profile');
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to fetch user profile');
    }
  },
);

export const fetchSubscriptions = createAsyncThunk(
  'profile/fetchMySubscriptions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/user/my_profile/subscriptions/');
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
      const response = await axios.get('/api/user/my_profile/my_liked/');
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
      const response = await axios.get('/api/user/my_profile/my_favorites/');
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
