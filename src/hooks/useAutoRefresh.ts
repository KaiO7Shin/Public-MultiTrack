import { useCallback, useEffect, useRef, useState } from "react";
import { REFRESH_INTERVAL_MS } from "@/lib/constants";
import { formatClock, friendlyError } from "@/lib/utils";

type LoadFn = (signal: AbortSignal) => Promise<void>;

/**
 * Charge des données puis les rafraîchit automatiquement (20 s).
 * Premier chargement : spinner. Suivants : silencieux.
 */
export function useAutoRefresh(load: LoadFn, enabled = true) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const loadRef = useRef(load);
  loadRef.current = load;
  const generation = useRef(0);

  const execute = useCallback(async (silent: boolean) => {
    const gen = ++generation.current;
    const controller = new AbortController();
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      await loadRef.current(controller.signal);
      if (gen === generation.current) {
        setUpdatedAt(formatClock(new Date()));
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

    void execute(false);
    const timer = setInterval(() => void execute(true), REFRESH_INTERVAL_MS);

    return () => {
      generation.current += 1;
      clearInterval(timer);
    };
  }, [enabled, execute]);

  return { loading, refreshing, updatedAt, error, reload, setError };
}
