export interface Comment {
  id: number;
  text: string;
  user: number;
  commentator_username: string;
  created_date: string;
  updated_date: string;
}

export type CommentData = Pick<Comment, 'user' | 'text'>;