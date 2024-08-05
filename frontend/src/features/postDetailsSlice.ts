import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { PostDetails } from '../types/PostDetails';
import { Comment, CommentData } from '../types/Comments';
import axiosInstance from '../api/axiosInstance';

type DetailsState = {
  postId: number;
  post: PostDetails | null;
  loading: boolean;
  error: boolean;
  likeError: string;
};

const initialState: DetailsState = {
  postId: 0,
  post: null,
  loading: false,
  error: false,
  likeError: '',
};

export const fetchPostDetails = createAsyncThunk(
  'posts/fetchPostDetails',
  async (postId: string) => {
    const response = await axiosInstance.get(`http://127.0.0.1:8080/api/platform/posts/${postId}`);
    return response.data;
  },
);

export const addComment = createAsyncThunk(
  'comments/addComment',
  async ({
    text,
    userId,
    postId,
  }: {
    text: string;
    userId: number;
    postId: number;
  }) => {
    const response = await axiosInstance.post('http://127.0.0.1:8080/api/platform/comments/', {
      text,
      userId,
      postId,
    });
    return response.data;
  },
);

export const setLike = createAsyncThunk(
  'posts/setLike',
  async (postId: number, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `http://127.0.0.1:8080/api/platform/posts/${postId}/set-like/`,
        null,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to set like');
    }
  },
);

export const addToFavorites = createAsyncThunk(
  'posts/addToFavorites',
  async (postId: number, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `http://127.0.0.1:8080/api/platform/posts/${postId}/add-to-favorites/`,
        null,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to add to favorites');
    }
  },
);

const postDetailsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    set: (state, action: PayloadAction<number>) => {
      state.postId = action.payload;
    },
  },
  extraReducers(builder) {
    builder.addCase(fetchPostDetails.pending, state => {
      state.loading = true;
      state.error = false;
    });

    builder.addCase(fetchPostDetails.rejected, state => {
      state.error = true;
      state.loading = false;
    });

    builder.addCase(
      fetchPostDetails.fulfilled,
      (state, action: PayloadAction<PostDetails>) => {
        state.loading = false;
        state.post = action.payload;
      },
    );

    builder.addCase(
      addComment.fulfilled,
      (state, action: PayloadAction<CommentData>) => {
        if (state.post && state.post.comments) {
          state.post.comments.push(action.payload as Comment);
        }
      },
    );

    builder.addCase(
      setLike.fulfilled,
      (
        state,
        action: PayloadAction<{ postId: number; likes_count: number }>,
      ) => {
        if (state.post) {
          state.post.likes_count = action.payload.likes_count;
        }
      },
    );

    builder.addCase(setLike.rejected, (state, action) => {
      state.likeError = action.payload as string;
    });
  },
});

export default postDetailsSlice.reducer;
export const { actions } = postDetailsSlice;
