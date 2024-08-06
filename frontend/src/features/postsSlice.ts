/* eslint-disable no-param-reassign */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Post } from '../types/Post';
import axiosInstance from '../api/axiosInstance';
import { PostData } from '../types/PostDetails';

type PostsState = {
  posts: Post[];
  loading: boolean;
  error: boolean;
  createLoading: boolean;
  createError: boolean;
};

const initialState: PostsState = {
  posts: [],
  loading: false,
  error: false,
  createLoading: false,
  createError: false,
};

export const init = createAsyncThunk('posts/fetchPosts', async () => {
  const response = await axiosInstance.get('api/platform/posts');
  return response.data;
});

export const createPost = createAsyncThunk(
  'posts/createPost',
  async (formData: PostData) => {
    const response = await axiosInstance.post('/api/posts/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
);

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(init.pending, state => {
      state.loading = true;
      state.error = false;
    });

    builder.addCase(init.rejected, state => {
      state.loading = false;
      state.error = true;
    });

    builder.addCase(init.fulfilled, (state, action) => {
      state.loading = false;
      state.posts = action.payload;
    });

    builder.addCase(createPost.pending, state => {
      state.createLoading = true;
      state.createError = false;
    });

    builder.addCase(createPost.rejected, state => {
      state.createLoading = false;
      state.createError = true;
    });

    builder.addCase(createPost.fulfilled, (state, action) => {
      state.createLoading = false;
      state.posts.push(action.payload);
    });
  },
});

export default postsSlice.reducer;
