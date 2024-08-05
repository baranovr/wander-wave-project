import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';

import postsSlice from '../features/postsSlice';
import postDetailsSlice from '../features/postDetailsSlice';
import authSlice from '../features/authSlice';
import myProfileSlice from '../features/myProfileSlice';
import subscriptionSlice from '../features/subscriptionSlice';
import notificationsSlice from '../features/notificationsSlice';
import authorProfileSlice from '../features/authorProfileSlice';

export const store = configureStore({
  reducer: {
    author: authorProfileSlice,
    myProfile: myProfileSlice,
    postDetails: postDetailsSlice,
    posts: postsSlice,
    auth: authSlice,
    subscription: subscriptionSlice,
    notifications: notificationsSlice,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
/* eslint-disable @typescript-eslint/indent */
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
/* eslint-enable @typescript-eslint/indent */

// // Infer the `RootState` and `AppDispatch` types from the store itself
// export type RootState = ReturnType<typeof store.getState>
// // Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
// export type AppDispatch = typeof store.dispatch
