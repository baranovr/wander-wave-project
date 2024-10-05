export const getImageUrl = (photoUrl: string | null | undefined): string => {
  if (!photoUrl) return '/path/to/default/image.jpg';

  if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
    return photoUrl;
  }

  return `http://127.0.0.1:8008${photoUrl}`;
};

export const getMyMediaImageUrl = (photoUrl: string | null | undefined): string => {
  if (!photoUrl) return '/path/to/default/image.jpg';

  if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
    return photoUrl;
  }

  return `http://127.0.0.1:8008/media/${photoUrl}`;
};