import api from "@/lib/api";
import { API } from "@/lib/apiEndpoints";
import type {
  BikeType,
  CourseType,
  DHPhaseRanking,
  Phase,
  RankingEntry,
  XCPhaseRanking,
} from "@/lib/types";
import {
  coerceArray,
  dhRankingToEntries,
  trailRowToEntry,
  xcRankingToEntries,
} from "@/lib/utils";

export async function fetchPhases(
  courseId: number,
  signal?: AbortSignal
): Promise<Phase[]> {
  const { data } = await api.get(API.phases, {
    params: { courseId },
    signal,
  });
  const list = coerceArray(data?.data ?? data);
  return list
    .map((raw) => {
      const r = raw as Record<string, unknown>;
      return {
        id: Number(r.id ?? 0),
        courseId: Number(r.courseId ?? r.course_id ?? courseId),
        label: String(r.label ?? r.libelle ?? `Phase ${r.id}`),
      };
    })
    .filter((p) => p.id > 0);
}

export async function fetchTrailRanking(
  raceId: number,
  signal?: AbortSignal
): Promise<RankingEntry[]> {
  const res = await api.get(API.raceRanking(raceId), { signal });
  const rows = coerceArray(res?.data?.data ?? res?.data);
  return rows.map((raw) => trailRowToEntry(raw as Record<string, unknown>));
}

export async function fetchDhRanking(
  raceId: number,
  phaseId: number,
  filters?: { bikeType?: BikeType },
  signal?: AbortSignal
): Promise<{ entries: RankingEntry[]; phaseLabel: string }> {
  const { data } = await api.get<{ data: DHPhaseRanking }>(
    API.raceRankingDh(raceId),
    {
      params: {
        phaseId,
        ...(filters?.bikeType ? { bikeType: filters.bikeType } : {}),
      },
      signal,
    }
  );
  const payload = data.data;
  return {
    entries: dhRankingToEntries(payload),
    phaseLabel: payload.phaseLabel,
  };
}

export async function fetchXcRanking(
  raceId: number,
  phaseId: number,
  signal?: AbortSignal
): Promise<{ entries: RankingEntry[]; phaseLabel: string }> {
  const { data } = await api.get<{ data: XCPhaseRanking }>(
    API.raceRankingXc(raceId),
    { params: { phaseId }, signal }
  );
  const payload = data.data;
  return {
    entries: xcRankingToEntries(payload),
    phaseLabel: payload.phaseLabel,
  };
}

export async function fetchRankingForCourse(
  raceId: number,
  type: CourseType,
  phaseId: number | null,
  signal?: AbortSignal,
  filters?: { bikeType?: BikeType }
): Promise<{ entries: RankingEntry[]; phaseLabel?: string }> {
  if (type === "DH") {
    if (!phaseId) return { entries: [] };
    return fetchDhRanking(raceId, phaseId, filters, signal);
  }
  if (type === "XC") {
    if (!phaseId) return { entries: [] };
    return fetchXcRanking(raceId, phaseId, signal);
  }
  const entries = await fetchTrailRanking(raceId, signal);
  return { entries };
}
