import { useCallback, useEffect, useRef, useState } from "react";
import { REFRESH_INTERVAL_MS } from "@/lib/constants";
import { formatClock, friendlyError } from "@/lib/utils";

type LoadFn = (signal: AbortSignal) => Promise<void>;

/**
 * Charge des données puis les rafraîchit automatiquement (20 s).
 * Premier chargement : spinner plein. Changements suivants (phase, etc.) : soft refresh.
 */
export function useAutoRefresh(
  load: LoadFn,
  enabled = true,
  resetKey?: string | number
) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const loadRef = useRef(load);
  loadRef.current = load;
  const generation = useRef(0);
  const hasLoadedOnce = useRef(false);

  useEffect(() => {
    hasLoadedOnce.current = false;
    setLoading(true);
    setUpdatedAt(null);
    setError(null);
  }, [resetKey]);

  const execute = useCallback(async (silent: boolean) => {
    const gen = ++generation.current;
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      await loadRef.current(new AbortController().signal);
      if (gen === generation.current) {
        setUpdatedAt(formatClock(new Date()));
        hasLoadedOnce.current = true;
      }
    } catch (e: unknown) {
      if (gen !== generation.current) return;
      const code = (e as { code?: string; name?: string }).code;
      const name = (e as { name?: string }).name;
      if (code === "ERR_CANCELED" || name === "CanceledError") return;
      setError(friendlyError(e));
    } finally {
      if (gen === generation.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  const reload = useCallback(() => {
    void execute(false);
  }, [execute]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    const soft = hasLoadedOnce.current;
    void execute(soft);
    const timer = setInterval(() => void execute(true), REFRESH_INTERVAL_MS);

    return () => {
      generation.current += 1;
      clearInterval(timer);
    };
  }, [enabled, execute]);

  return { loading, refreshing, updatedAt, error, reload, setError };
}
