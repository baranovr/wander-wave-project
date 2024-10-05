export const getImageUrl = (photoUrl: string | null | undefined): string => {
  if (!photoUrl) return '/path/to/default/image.jpg';

  if (photoUrl.startsWith('https://')) {
    return photoUrl;
  }

  return `https://wander-wave-backend.onrender.com${photoUrl}`;
};

export const getMyMediaImageUrl = (photoUrl: string | null | undefined): string => {
  if (!photoUrl) return '/path/to/default/image.jpg';

  if (photoUrl.startsWith('https://')) {
    return photoUrl;
  }

  return `https://wander-wave-backend.onrender.com/media/${photoUrl}`;
};