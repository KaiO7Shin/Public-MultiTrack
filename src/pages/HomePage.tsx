import { useCallback, useState } from "react";
import { RaceCard } from "@/components/RaceCard";
import { LoadingState, ErrorState, EmptyState } from "@/components/EmptyState";
import { LiveBadge } from "@/components/LiveBadge";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { fetchRaces } from "@/services/races";
import type { Course } from "@/lib/types";
import { sortCourses } from "@/lib/utils";

export function HomePage() {
  const [races, setRaces] = useState<Course[]>([]);

  const load = useCallback(async (signal: AbortSignal) => {
    const list = await fetchRaces(signal);
    setRaces(sortCourses(list));
  }, []);

  const { loading, error, reload, updatedAt, refreshing } = useAutoRefresh(load);

  const hasLive = races.some((r) => r.status === "En cours");
  const scrollToRaces = () => {
    document.getElementById("courses")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="texture-grain mx-auto min-h-dvh max-w-lg px-4 pb-16 pt-6 sm:max-w-2xl">
      {/* Hero — brand first */}
      <section
        className="animate-rise-in relative mb-10 overflow-hidden rounded-3xl bg-navy px-6 py-10 text-cream-bright shadow-lg sm:px-10 sm:py-14"
        aria-labelledby="brand-title"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse at 80% 20%, rgba(255,77,48,0.45), transparent 50%), linear-gradient(135deg, transparent 40%, rgba(45,106,79,0.35))",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-8 -bottom-10 h-40 w-40 rounded-full border-[12px] border-cream-bright/10"
          aria-hidden
        />
        <div className="relative">
          <p className="mb-2 text-sm font-bold tracking-widest text-cream-bright/70 uppercase">
            Classements en direct
          </p>
          <h1
            id="brand-title"
            className="font-display text-5xl font-extrabold leading-none tracking-wide sm:text-6xl"
          >
            MultiTrack
          </h1>
          <p className="mt-4 max-w-md text-lg leading-snug text-cream-bright/90">
            Qui est premier&nbsp;? Choisissez une course et voyez le classement.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={scrollToRaces}
              className="touch-target rounded-2xl bg-cta px-6 py-3.5 text-lg font-bold text-cream-bright shadow-md transition hover:bg-cta-dark"
            >
              Voir les classements
            </button>
            {hasLive && <LiveBadge className="bg-live/25 text-cream-bright" />}
          </div>
        </div>
      </section>

      <section id="courses" aria-labelledby="courses-title">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <h2
            id="courses-title"
            className="font-display text-2xl font-bold text-navy sm:text-3xl"
          >
            Les courses
          </h2>
          {updatedAt && (
            <p className="text-sm text-muted" aria-live="polite">
              {refreshing ? "Mise à jour…" : `Mis à jour à ${updatedAt}`}
            </p>
          )}
        </div>

        {loading && <LoadingState label="Chargement des courses…" />}

        {!loading && error && (
          <ErrorState message={error} onRetry={reload} />
        )}

        {!loading && !error && races.length === 0 && (
          <EmptyState
            title="Aucune course pour le moment"
            description="Revenez un peu plus tard, ou demandez à l’organisation."
            icon="timer"
          />
        )}

        {!loading && !error && races.length > 0 && (
          <ul className="space-y-3">
            {races.map((race, i) => (
              <li key={race.id}>
                <RaceCard race={race} index={i} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
