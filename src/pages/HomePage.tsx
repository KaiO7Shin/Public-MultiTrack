import { useCallback, useState } from "react";
import { RaceCard } from "@/components/RaceCard";
import { BrandLogo } from "@/components/BrandLogo";
import { LoadingState, ErrorState, EmptyState } from "@/components/EmptyState";
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

  const scrollToRaces = () => {
    document.getElementById("courses")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="mx-auto min-h-dvh max-w-lg px-4 pb-16 pt-5 sm:max-w-2xl">
      <header className="mb-6 flex items-center justify-between">
        <BrandLogo variant="light" heightClass="h-11 sm:h-12" />
        <span className="brand-pill">Classements</span>
      </header>

      <section
        className="animate-rise-in relative mb-10 overflow-hidden rounded-2xl bg-navy px-6 py-10 text-white shadow-sm sm:px-10 sm:py-12"
        aria-labelledby="brand-title"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse at 85% 15%, rgba(242,54,40,0.35), transparent 50%), radial-gradient(ellipse at 10% 90%, rgba(163,166,104,0.25), transparent 45%)",
          }}
          aria-hidden
        />
        <div className="relative">
          <BrandLogo
            variant="dark"
            heightClass="h-14 sm:h-16"
            className="mb-6"
          />
          <p className="brand-pill mb-4 bg-white/10 text-white/90">
            Classements en direct
          </p>
          <h1
            id="brand-title"
            className="font-display text-4xl leading-[1.15] tracking-tight text-white sm:text-5xl"
          >
            Qui est premier&nbsp;?
          </h1>
          <p className="mt-4 max-w-md text-lg leading-snug text-white/80">
            Choisissez une course et suivez le classement — simple, clair, sur
            mobile.
          </p>
          <div className="mt-8">
            <button
              type="button"
              onClick={scrollToRaces}
              className="btn-primary text-base sm:text-lg"
            >
              Voir les classements
            </button>
          </div>
        </div>
      </section>

      <section id="courses" aria-labelledby="courses-title">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="brand-pill mb-2">Courses</p>
            <h2
              id="courses-title"
              className="font-display text-3xl text-navy sm:text-4xl"
            >
              Les courses
            </h2>
          </div>
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
