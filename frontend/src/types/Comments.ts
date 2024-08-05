export interface Comment {
  id: number;
  text: string;
  user: number;
  created_date: string;
  updated_date: string;
}

export type CommentData = Pick<Comment, 'user' | 'text'>;
