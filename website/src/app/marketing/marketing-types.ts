export type Clip = {
  id: string;
  title: string;
  format: string;
  video: string;
  poster: string;
  caption: string;
  /** Editorial ordering for featured films; other clips retain catalogue order. */
  featuredOrder?: number;
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

export function getMarketingSlides(campaigns: Campaign[]) {
  return campaigns
    .flatMap((campaign) => campaign.clips.map((clip) => ({ campaign, clip })))
    .map((slide, originalIndex) => ({ ...slide, originalIndex }))
    .sort((a, b) => {
      const first = a.clip.featuredOrder ?? Number.MAX_SAFE_INTEGER;
      const second = b.clip.featuredOrder ?? Number.MAX_SAFE_INTEGER;
      return first - second || a.originalIndex - b.originalIndex;
    })
    .map(({ campaign, clip }, index) => ({ campaign, clip, number: index + 1 }));
}
