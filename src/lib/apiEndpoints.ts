export const API = {
  races: "/races",
  raceRanking: (raceId: number) => `/races/${raceId}/ranking`,
  raceRankingDh: (raceId: number) => `/races/${raceId}/ranking/dh`,
  raceRankingXc: (raceId: number) => `/races/${raceId}/ranking/xc`,
  categories: "/categories",
  phases: "/phases",
} as const;
