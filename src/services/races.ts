import api from "@/lib/api";
import { API } from "@/lib/apiEndpoints";
import type { Course } from "@/lib/types";
import { coerceArray, normalizeCourse } from "@/lib/utils";

export async function fetchRaces(signal?: AbortSignal): Promise<Course[]> {
  const res = await api.get(API.races, { signal });
  return coerceArray(res?.data)
    .map((raw) => normalizeCourse(raw as Record<string, unknown>))
    .filter((c) => c.id > 0);
}

export async function fetchRaceById(
  id: number,
  signal?: AbortSignal
): Promise<Course | null> {
  const races = await fetchRaces(signal);
  return races.find((r) => r.id === id) ?? null;
}
