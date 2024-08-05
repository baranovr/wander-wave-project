export interface PostDetails {
  id: number;
  author_profile: string;
  username: string;
  user_status: string;
  full_name: string;
  user_email: string;
  photos: {
    id: number;
    image: string;
    post?: number;
  }[];
  location: {
    id: number;
    country: string;
    city: string;
  };
  title: string;
  likes_count: number;
  content: string;
  comments: [
    {
      id: number;
      text: string;
      user: number;
      created_date: string;
      updated_date: string;
    },
  ];
  hashtags: {
    id: number;
    name: string;
  }[];
  created_at: string;
  updated_at: string;
  set_like: string;
}

export type PostData = {
  title: string;
  content: string;
  hashtags: {
    id: number;
    name: string;
  }[];
  uploaded_photos: string[];
  location: {
    id: number;
    country: string;
    city: string;
  };
};
