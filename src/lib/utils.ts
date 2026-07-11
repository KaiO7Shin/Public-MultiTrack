import type {
  BikeType,
  Category,
  CategoryGenre,
  Course,
  CourseStatus,
  CourseType,
  DHPhaseRanking,
  DHRankingRow,
  RankingEntry,
  XCPhaseRanking,
  XCRankingRow,
} from "./types";
import { BIKE_TYPES } from "./types";

export function coerceArray(x: unknown): unknown[] {
  if (Array.isArray(x)) return x;
  if (x && typeof x === "object" && Array.isArray((x as { data?: unknown }).data)) {
    return (x as { data: unknown[] }).data;
  }
  return [];
}

export function normalizeCourseType(raw: unknown): CourseType {
  const upper = String(raw ?? "TRAIL").trim().toUpperCase();
  if (upper === "TRAIL" || upper === "DH" || upper === "XC") return upper;
  return "TRAIL";
}

export function normalizeCourseStatus(raw: unknown): CourseStatus {
  const lower = String(raw ?? "").trim().toLowerCase().replace(/\s+/g, " ");
  if (lower === "a venir" || lower === "à venir") return "A venir";
  if (lower === "en cours") return "En cours";
  if (lower === "terminee" || lower === "terminée") return "Terminee";
  return "A venir";
}

export function normalizeCourse(raw: Record<string, unknown>): Course {
  const id = Number(raw.id ?? raw.course_id ?? raw.raceId ?? 0);
  return {
    id,
    name: String(raw.name ?? raw.label ?? raw.title ?? `Course #${id}`),
    type: normalizeCourseType(raw.type ?? raw.raceType ?? raw.courseType),
    status: normalizeCourseStatus(
      raw.status ?? raw.status_label ?? raw.code ?? raw.state
    ),
    distanceKm: numOrUndef(raw.distanceKm ?? raw.distance_km ?? raw.distance),
    elevation: numOrUndef(raw.elevation ?? raw.elevation_gain ?? raw.ascent),
    startAt: (raw.startAt ??
      raw.start_at ??
      raw.start_time ??
      raw.start_date_time) as string | undefined,
  };
}

export function normalizeCategory(raw: Record<string, unknown>): Category {
  const alias = String(raw.alias ?? "");
  const genreFromApi = raw.genre;
  return {
    id: Number(raw.id ?? 0),
    alias,
    genre:
      genreFromApi === "Femme" || genreFromApi === "Homme"
        ? genreFromApi
        : alias.trim().toUpperCase().endsWith("F")
          ? "Femme"
          : "Homme",
  };
}

function numOrUndef(v: unknown): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export function parseParticipantName(full: string): {
  firstName: string;
  lastName: string;
} {
  const trimmed = full.trim();
  if (!trimmed) return { firstName: "", lastName: "" };
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return { firstName: "", lastName: parts[0] };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export function formatParticipantName(
  firstName: string,
  lastName: string
): string {
  const p = firstName.trim();
  const n = lastName.trim();
  if (p && n) return `${p} ${n}`;
  return p || n || "—";
}

export function statusLabel(status: CourseStatus): string {
  if (status === "A venir") return "À venir";
  if (status === "Terminee") return "Terminée";
  return "En cours";
}

export function typeLabel(type: CourseType): string {
  if (type === "DH") return "Descente";
  if (type === "XC") return "Cross-country";
  return "Trail";
}

export function normalizeBikeType(raw: unknown): BikeType | undefined {
  const upper = String(raw ?? "").trim().toUpperCase();
  if ((BIKE_TYPES as readonly string[]).includes(upper)) {
    return upper as BikeType;
  }
  return undefined;
}

export function formatClock(date: Date): string {
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/** Déduit le genre depuis la catégorie (alias …H / …F) si besoin */
export function inferGender(
  category: string,
  explicit?: CategoryGenre | null
): CategoryGenre | null {
  if (explicit === "Homme" || explicit === "Femme") return explicit;
  const upper = category.trim().toUpperCase();
  if (upper.endsWith("F")) return "Femme";
  if (upper.endsWith("H")) return "Homme";
  return null;
}

export function trailRowToEntry(raw: Record<string, unknown>): RankingEntry {
  const fromFields = {
    firstName: String(
      raw.prenom ?? raw.athleteFirstName ?? raw.firstName ?? ""
    ).trim(),
    lastName: String(
      raw.nom ?? raw.athleteLastName ?? raw.lastName ?? ""
    ).trim(),
  };
  const fallback =
    !fromFields.firstName && !fromFields.lastName
      ? parseParticipantName(String(raw.athleteName ?? ""))
      : fromFields;

  const category = String(raw.categoryName ?? raw.categorie ?? "").trim();
  const status = raw.status != null ? String(raw.status) : null;

  return {
    participantId: Number(raw.participantId ?? raw.id ?? 0),
    rank: raw.rank != null ? Number(raw.rank) : null,
    bib: String(raw.bibNumber ?? raw.dossard ?? raw.numDossard ?? ""),
    firstName: fallback.firstName,
    lastName: fallback.lastName,
    category,
    gender: inferGender(
      category,
      raw.genre === "Homme" || raw.genre === "Femme" ? raw.genre : null
    ),
    time: raw.raceTime != null ? String(raw.raceTime) : null,
    status,
    categoryRank:
      raw.categoryRank != null ? Number(raw.categoryRank) : null,
    genderRank: raw.genderRank != null ? Number(raw.genderRank) : null,
    disqualified: String(status ?? "").toUpperCase() === "DSQ",
  };
}

function dhRowToEntry(row: DHRankingRow): RankingEntry {
  return {
    participantId: row.participantId,
    rank: row.rankScratch,
    bib: row.dossard,
    firstName: row.prenom,
    lastName: row.nom,
    category: row.categorie,
    gender: row.genre,
    time: row.bestTimeFormatted,
    status: row.disqualified ? "DSQ" : row.bestTimeFormatted ? "Finisher" : null,
    categoryRank: row.rankCategory,
    genderRank: null,
    disqualified: row.disqualified,
    bikeType: normalizeBikeType(row.typeVelo),
  };
}

function xcRowToEntry(row: XCRankingRow): RankingEntry {
  return {
    participantId: row.participantId,
    rank: row.rankScratch,
    bib: row.dossard,
    firstName: row.prenom,
    lastName: row.nom,
    category: row.categorie,
    gender: row.genre,
    time: row.timeFormatted,
    status: row.disqualified ? "DSQ" : row.timeFormatted ? "Finisher" : null,
    categoryRank: row.rankCategory,
    genderRank: null,
    disqualified: row.disqualified,
  };
}

export function dhRankingToEntries(data: DHPhaseRanking): RankingEntry[] {
  return data.scratch.map(dhRowToEntry);
}

export function xcRankingToEntries(data: XCPhaseRanking): RankingEntry[] {
  return data.scratchGeneral.map(xcRowToEntry);
}

/** Ordre d'affichage des courses : En cours → À venir → Terminée */
export function sortCourses(courses: Course[]): Course[] {
  const weight: Record<CourseStatus, number> = {
    "En cours": 0,
    "A venir": 1,
    Terminee: 2,
  };
  return [...courses].sort((a, b) => {
    const d = weight[a.status] - weight[b.status];
    if (d !== 0) return d;
    return a.name.localeCompare(b.name, "fr");
  });
}

export function matchesSearch(entry: RankingEntry, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const bib = entry.bib.toLowerCase();
  if (bib.includes(q) || bib.replace(/^0+/, "").includes(q.replace(/^0+/, ""))) {
    return true;
  }
  const full = `${entry.firstName} ${entry.lastName}`.toLowerCase();
  const reverse = `${entry.lastName} ${entry.firstName}`.toLowerCase();
  return full.includes(q) || reverse.includes(q);
}

export function filterEntries(
  entries: RankingEntry[],
  opts: {
    gender?: "Homme" | "Femme" | null;
    category?: string | null;
    bikeType?: BikeType | null;
    search?: string;
  }
): RankingEntry[] {
  return entries.filter((e) => {
    if (opts.gender && e.gender !== opts.gender) return false;
    if (opts.category && e.category !== opts.category) return false;
    if (opts.bikeType && e.bikeType !== opts.bikeType) return false;
    if (opts.search && !matchesSearch(e, opts.search)) return false;
    return true;
  });
}

export function uniqueCategories(entries: RankingEntry[]): string[] {
  const set = new Set<string>();
  entries.forEach((e) => {
    if (e.category) set.add(e.category);
  });
  return Array.from(set).sort((a, b) => a.localeCompare(b, "fr", { numeric: true }));
}

export function friendlyError(err: unknown): string {
  if (!err) return "Une erreur est survenue.";
  const ax = err as {
    code?: string;
    message?: string;
    response?: { status?: number; data?: { message?: string } };
  };
  if (ax.code === "ERR_NETWORK" || ax.message === "Network Error") {
    return "Pas de connexion. Vérifiez le réseau et réessayez.";
  }
  if (ax.response?.status === 404) {
    return "Cette course est introuvable.";
  }
  if (ax.response?.data?.message) return String(ax.response.data.message);
  return "Impossible de charger les données. Réessayez.";
}
