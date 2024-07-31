// src/features/author/authorSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { User } from '../types/User';

interface AuthorState {
  profile: User | null;
  loading: boolean;
  error: boolean;
}

const initialState: AuthorState = {
  profile: null,
  loading: false,
  error: false,
};

export const fetchAuthorProfile = createAsyncThunk(
  'author/fetchAuthorProfile',
  async (postId: number, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `/api/platform/posts/${postId}/author-profile/`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to fetch author profile');
    }
  },
);

const authorSlice = createSlice({
  name: 'author',
  initialState,
  reducers: {
    clearAuthorProfileState(state) {
      state.profile = null;
      state.loading = false;
      state.error = false;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchAuthorProfile.pending, state => {
        state.loading = true;
        state.error = false;
      })
      .addCase(
        fetchAuthorProfile.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.loading = false;
          state.profile = action.payload;
        },
      )
      .addCase(
        fetchAuthorProfile.rejected,
        (state) => {
          state.loading = false;
          state.error = true;
        },
      );
  },
});

export const { clearAuthorProfileState } = authorSlice.actions;
export default authorSlice.reducer;
