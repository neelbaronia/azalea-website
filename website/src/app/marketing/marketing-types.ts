export type Clip = {
  id: string;
  title: string;
  format: string;
  video: string;
  poster: string;
  caption: string;
  note?: string;
  photoCredit?: string;
  photoUrl?: string;
  licenseName?: string;
  licenseUrl?: string;
};

export type Campaign = {
  id: string;
  title: string;
  author: string;
  cover: string;
  spotify: string;
  summary: string;
  accent: string;
  clips: Clip[];
};
