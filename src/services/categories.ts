import api from "@/lib/api";
import { API } from "@/lib/apiEndpoints";
import type { Category } from "@/lib/types";
import { coerceArray, normalizeCategory } from "@/lib/utils";

export async function fetchCategories(
  signal?: AbortSignal
): Promise<Category[]> {
  const res = await api.get(API.categories, { signal });
  return coerceArray(res?.data)
    .map((raw) => normalizeCategory(raw as Record<string, unknown>))
    .filter((c) => c.id > 0);
}
