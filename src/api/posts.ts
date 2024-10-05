import {client} from '../helpers/fetchClient';
import {Post} from '../types/Post';

export const getUserPosts = (userId: number) => {
  return client.get<Post[]>(`/posts?userId=${userId}`);
};
