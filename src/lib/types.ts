export const COURSE_TYPES = ["TRAIL", "DH", "XC"] as const;
export type CourseType = (typeof COURSE_TYPES)[number];

export type CourseStatus = "A venir" | "En cours" | "Terminee";

export type CategoryGenre = "Homme" | "Femme";

export const BIKE_TYPES = ["TOUT SUSPENDU", "SEMI-RIGIDE"] as const;
export type BikeType = (typeof BIKE_TYPES)[number];

export const BIKE_TYPE_LABELS: Record<BikeType, string> = {
  "TOUT SUSPENDU": "Tout suspendu",
  "SEMI-RIGIDE": "Semi-rigide",
};

export type Course = {
  id: number;
  name: string;
  type: CourseType;
  status: CourseStatus;
  distanceKm?: number;
  elevation?: number;
  startAt?: string;
};

export type Category = {
  id: number;
  alias: string;
  genre: CategoryGenre;
};

export type Phase = {
  id: number;
  courseId: number;
  label: string;
};

export type MancheTimeDetail = {
  mancheId: number;
  mancheLabel: string;
  timeMs?: number | null;
  timeFormatted: string | null;
  finished?: boolean;
};

/** Ligne unifiée affichée dans l'app publique */
export type RankingEntry = {
  participantId: number;
  rank: number | null;
  bib: string;
  firstName: string;
  lastName: string;
  category: string;
  gender: CategoryGenre | null;
  time: string | null;
  status: string | null;
  categoryRank: number | null;
  genderRank: number | null;
  disqualified: boolean;
  bikeType?: BikeType;
  /** Temps détaillés par manche (DH / XC) */
  mancheTimes?: MancheTimeDetail[];
};

export type FilterTab = "all" | "Homme" | "Femme" | "categories";

export type DHRankingRow = {
  participantId: number;
  dossard: string;
  prenom: string;
  nom: string;
  categorie: string;
  genre: CategoryGenre;
  typeVelo?: BikeType;
  bestTimeFormatted: string | null;
  rankScratch: number | null;
  rankCategory: number | null;
  disqualified: boolean;
  mancheTimes?: MancheTimeDetail[];
};

export type XCRankingRow = {
  participantId: number;
  dossard: string;
  prenom: string;
  nom: string;
  categorie: string;
  genre: CategoryGenre;
  timeFormatted: string | null;
  rankScratch: number | null;
  rankCategory: number | null;
  disqualified: boolean;
};

export type DHPhaseRanking = {
  phaseId: number;
  phaseLabel: string;
  scratch: DHRankingRow[];
  byCategory: { categorie: string; rows: DHRankingRow[] }[];
};

export type XCPhaseRanking = {
  phaseId: number;
  phaseLabel: string;
  scratchGeneral: XCRankingRow[];
  byCategory: { categorie: string; rows: XCRankingRow[] }[];
  mancheGroups?: {
    mancheId: number;
    mancheLabel: string;
    rows: XCRankingRow[];
  }[];
};
