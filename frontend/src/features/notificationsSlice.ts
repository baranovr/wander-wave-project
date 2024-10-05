import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../api/axiosInstance';
import { Notification } from '../types/Notification';

type NotificationState = {
  notifications: Notification[];
  status: string;
  error: any;
};

const initialState: NotificationState = {
  notifications: [],
  status: 'idle',
  error: null,
};

type NotificationsArray = Notification[] | null;

let cachedNotifications: NotificationsArray = null;

export const fetchAllNotifications = createAsyncThunk(
  'notifications/fetchAllNotifications',
  async (_, { getState }) => {
    if (cachedNotifications) {
      return cachedNotifications;
    }

    const [subscriptionResponse, postResponse, likeResponse, commentResponse] =
      await Promise.all([
        axiosInstance.get<Notification[]>('http://127.0.0.1:8000/api/platform/subscription_notifications/'),
        axiosInstance.get<Notification[]>('http://127.0.0.1:8000/api/platform/post_notifications/'),
        axiosInstance.get<Notification[]>('http://127.0.0.1:8000/api/platform/like_notifications/'),
        axiosInstance.get<Notification[]>('http://127.0.0.1:8000/api/platform/comment_notifications/'),
      ]);

    cachedNotifications = [
      ...subscriptionResponse.data,
      ...postResponse.data,
      ...likeResponse.data,
      ...commentResponse.data,
    ];

    return cachedNotifications;
  },
);

export const clearNotificationsCache = () => {
  cachedNotifications = null;
};

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markNotificationAsRead',
  async ({ id, text }: { id: number; text: string }) => {
    let type = '';

    if (text.includes('subscribed')) {
      type = 'subscription';
    }

    if (text.includes('published')) {
      type = 'post';
    }

    if (text.includes('liked')) {
      type = 'like';
    }
    if (text.includes('commented')) {
      type = 'comment';
    }

    const response = await axiosInstance.post(
      `/platform/${type}_notifications/${id}/mark_as_read/`,
    );
    return { id, text, ...response.data };
  },
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllNotificationsAsRead',
  async () => {
    await Promise.all([
      axiosInstance.post('/platform/subscription_notifications/mark_all_as_read/'),
      axiosInstance.post('/platform/post_notifications/mark_all_as_read/'),
      axiosInstance.post('/platform/like_notifications/mark_all_as_read/'),
      axiosInstance.post('/platform/comment_notifications/mark_all_as_read/'),
    ]);
  },
);

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async ({ id, text }: { id: number; text: string }) => {
    let type = '';

    if (text.includes('subscribed')) {
      type = 'subscription';
    }

    if (text.includes('published')) {
      type = 'post';
    }

    if (text.includes('liked')) {
      type = 'like';
    }
    if (text.includes('commented')) {
      type = 'comment';
    }
    const response = await axiosInstance.delete(
      `/platform/${type}_notifications/${id}/delete_notification/`,
    );
    return { id, text, ...response.data };
  },
);

export const deleteAllNotifications = createAsyncThunk(
  'notifications/deleteAllNotifications',
  async () => {
    await Promise.all([
      axiosInstance.delete(
        '/platform/subscription_notifications/delete_all_notifications/',
      ),
      axiosInstance.delete('/platform/post_notifications/delete_all_notifications/'),
      axiosInstance.delete('/platform/like_notifications/delete_all_notifications/'),
      axiosInstance.delete(
        '/platform/comment_notifications/delete_all_notifications/',
      ),
    ]);
  },
);

export const deleteAllCommentNotifications = createAsyncThunk(
  'notifications/deleteAllCommentNotifications',
  async () => {
    const response = await axiosInstance.delete(
      '/platform/comment_notifications/delete_all_notifications/',
    );
    return response.data;
  },
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchAllNotifications.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchAllNotifications.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.notifications = action.payload;
      })
      .addCase(fetchAllNotifications.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.error.message;
          state.notifications = [];
        })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const { id, text } = action.payload;
        const notification = state.notifications.find(
          n => n.id === id && n.text === text,
        );
        if (notification) {
          notification.is_read = true;
        }
      })
      .addCase(markAllNotificationsAsRead.fulfilled, state => {
        state.notifications.forEach(notification => {
          notification.is_read = true;
        });
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const { id, text } = action.payload;
        state.notifications = state.notifications.filter(
          n => !(n.id === id && n.text === text),
        );
      })
      .addCase(deleteAllNotifications.fulfilled, state => {
        state.notifications = [];
      })
      .addMatcher(
        action =>
          action.type.startsWith('notifications/') &&
          action.type.endsWith('/pending'),
        state => {
          state.status = 'loading';
        },
      )
      .addMatcher(
        action =>
          action.type.startsWith('notifications/') &&
          action.type.endsWith('/rejected'),
        state => {
          state.status = 'failed';
          state.error = 'Failed to fetch user notifications';
        },
      )
      .addMatcher(
        action =>
          action.type.startsWith('notifications/') &&
          action.type.endsWith('/fulfilled'),
        state => {
          state.status = 'succeeded';
        },
      );
  },
});

export default notificationsSlice.reducer;
