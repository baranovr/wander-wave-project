export type Notification = {
  id: number;
  text: string;
  is_read: boolean;
  created_at: string;
  commentator_username?: string;
  commented_post_title?: string;
  comment_text?: string;
  liker_username?: string;
  liked_post_title?: string;
  sender_username?: string;
  post_title?: string;
  subscriber_username?: string;
  subscribed_username?: string;
};
