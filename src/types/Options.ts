export type Option = {
  value: string;
  label: string;
};

export const sortOptions: Option[] = [
  { value: 'age', label: 'Newest' },
  { value: 'likes', label: 'Popular' },
  { value: 'comments', label: 'Most discussed' },
];

export const itemsPerPageOptions: Option[] = [
  { value: 'all', label: 'All' },
  { value: '12', label: '12' },
  { value: '6', label: '6' },
  { value: '3', label: '3' },
];
