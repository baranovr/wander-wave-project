// src/features/posts/subscriptionSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../api/axiosInstance';

interface SubscriptionState {
  loading: boolean;
  error: string | null;
}

const initialState: SubscriptionState = {
  loading: false,
  error: null,
};

export const subscribeToAuthor = createAsyncThunk(
  'posts/subscribeToAuthor',
  async ({ postId }: { postId: number }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `http://127.0.0.1:8080/api/platform/posts/${postId}/author-profile/subscribe/`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue('Subscription failed');
    }
  },
);

export const unsubscribeFromAuthor = createAsyncThunk(
  'posts/unsubscribeFromAuthor',
  async ({ postId }: { postId: number }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `http://127.0.0.1:8080/api/platform/posts/${postId}/author-profile/unsubscribe/`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue('Unsubscription failed');
    }
  },
);

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    clearSubscriptionState(state) {
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(subscribeToAuthor.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(subscribeToAuthor.fulfilled, state => {
        state.loading = false;
      })
      .addCase(
        subscribeToAuthor.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload;
        },
      )
      .addCase(unsubscribeFromAuthor.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(unsubscribeFromAuthor.fulfilled, state => {
        state.loading = false;
      })
      .addCase(
        unsubscribeFromAuthor.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload;
        },
      );
  },
});

export const { clearSubscriptionState } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
