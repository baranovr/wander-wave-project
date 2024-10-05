import {store} from '../app/store';
import {logout, refreshToken} from '../features/authSlice';

function getAccessToken() {
  const state = store.getState();
  return state.auth.accessToken;
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });

  if (response.status === 401) {
    try {
      const result = await store.dispatch(refreshToken());
      if (refreshToken.rejected.match(result)) {
        throw new Error('Token refresh failed');
      }
      response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${getAccessToken()}`,
        },
      });
    } catch (error) {
      store.dispatch(logout());
      window.location.href = '/login';
    }
  }
  return response;
}

export default fetchWithAuth;
