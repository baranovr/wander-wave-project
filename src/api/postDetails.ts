import {client} from '../helpers/fetchClient';
import {Post} from '../types/Post';

// export const getPosts = (postId: number, data: Comment) => {
//   return client.patch(`/postsDetails?id=${postId}`, data);
// };

export const addCommentToPost = (
  postId: number,
  updatedFields: Partial<Post>,
) => {
  return client.patch(`/postsDetails/${postId}`, updatedFields);
};
