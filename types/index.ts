export type Course = {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  image_url: string | null;
  level: string;
  price: number;
};

export type Place = {
  id: number;
  region: string;
  name: string;
  description: string | null;
  meta: string | null;
  image_url: string | null;
  sort: number;
};