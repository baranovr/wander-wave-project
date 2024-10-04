import { Post } from './Post';

export interface User {
  id: number;
  avatar: string | null;
  status: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  is_staff: boolean;
  about_me: string;
  date_joined: string;
  subscribers: number;
  subscriptions: number;
  posts: Post[];
}
