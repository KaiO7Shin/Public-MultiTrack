import { useCallback, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { LoadingState, ErrorState, EmptyState } from "@/components/EmptyState";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { fetchRaceById } from "@/services/races";
import { fetchPhases, fetchRankingForCourse } from "@/services/ranking";
import type { Course, RankingEntry } from "@/lib/types";
import { formatParticipantName, statusLabel, typeLabel } from "@/lib/utils";
import { BIKE_TYPE_LABELS } from "@/lib/types";

export function AthletePage() {
  const { raceId: raceIdParam, participantId: pidParam } = useParams();
  const raceId = Number(raceIdParam);
  const participantId = Number(pidParam);

  const [race, setRace] = useState<Course | null>(null);
  const [entry, setEntry] = useState<RankingEntry | null>(null);
  const [phaseLabel, setPhaseLabel] = useState<string | undefined>();

  const load = useCallback(
    async (signal: AbortSignal) => {
      const r = await fetchRaceById(raceId, signal);
      setRace(r);
      if (!r) {
        setEntry(null);
        throw Object.assign(new Error("Course introuvable"), {
          response: { status: 404 },
        });
      }

      let phaseId: number | null = null;
      if (r.type === "DH" || r.type === "XC") {
        const phases = await fetchPhases(raceId, signal);
        phaseId = phases[0]?.id ?? null;
      }

      const result = await fetchRankingForCourse(
        raceId,
        r.type,
        phaseId,
        signal
      );
      setPhaseLabel(result.phaseLabel);
      setEntry(
        result.entries.find((e) => e.participantId === participantId) ?? null
      );
    },
    [raceId, participantId]
  );

  const ready =
    Number.isFinite(raceId) &&
    raceId > 0 &&
    Number.isFinite(participantId) &&
    participantId > 0;

  const { loading, error, reload, updatedAt, refreshing } = useAutoRefresh(
    load,
    ready
  );

  const name = useMemo(
    () =>
      entry
        ? formatParticipantName(entry.firstName, entry.lastName)
        : "Coureur",
    [entry]
  );

  if (!ready) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <ErrorState message="Coureur introuvable." />
      </div>
    );
  }

  return (
    <div className="texture-grain mx-auto min-h-dvh max-w-lg px-4 pb-16 pt-4 sm:max-w-xl">
      <AppHeader
        backTo={`/course/${raceId}`}
        backLabel="Retour au classement"
        title={loading ? "Coureur" : name}
        subtitle={
          race
            ? [race.name, typeLabel(race.type), phaseLabel]
                .filter(Boolean)
                .join(" · ")
            : undefined
        }
        live={race?.status === "En cours"}
        updatedAt={updatedAt}
        refreshing={refreshing}
      />

      {loading && <LoadingState label="Chargement…" />}
      {!loading && error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && !entry && (
        <EmptyState
          title="Coureur introuvable"
          description="Ce coureur n’apparaît pas encore dans le classement."
          icon="search"
        />
      )}

      {!loading && !error && entry && (
        <article className="animate-rise-in overflow-hidden rounded-3xl border-2 border-navy/10 bg-cream-bright shadow-md">
          <div className="bg-navy px-6 py-8 text-cream-bright">
            <p className="text-sm font-bold tracking-wide text-cream-bright/70 uppercase">
              Dossard
            </p>
            <p className="font-display text-5xl font-extrabold">
              n°{entry.bib || "—"}
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold">{name}</h2>
            <p className="mt-1 text-base text-cream-bright/80">
              {entry.category || "—"}
              {entry.gender ? ` · ${entry.gender}` : ""}
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-px bg-line">
            <Stat label="Rang général" value={entry.rank ?? "—"} />
            <Stat
              label="Rang catégorie"
              value={entry.categoryRank ?? "—"}
            />
            <Stat
              label="Rang genre"
              value={entry.genderRank ?? "—"}
            />
            <Stat label="Temps" value={entry.time ?? "—"} highlight />
            <Stat
              label="Statut"
              value={entry.status ?? "—"}
              className={entry.bikeType ? undefined : "col-span-2"}
            />
            {entry.bikeType && (
              <Stat
                label="Type de vélo"
                value={BIKE_TYPE_LABELS[entry.bikeType]}
              />
            )}
            {race && (
              <Stat
                label="Course"
                value={`${race.name} (${statusLabel(race.status)})`}
                className="col-span-2"
              />
            )}
          </dl>
        </article>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
  className,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <div className={`bg-cream-bright px-5 py-5 ${className ?? ""}`}>
      <dt className="text-sm font-bold tracking-wide text-muted uppercase">
        {label}
      </dt>
      <dd
        className={
          highlight
            ? "font-display mt-1 text-3xl font-extrabold text-cta"
            : "font-display mt-1 text-2xl font-bold text-navy"
        }
      >
        {value}
      </dd>
    </div>
  );
}
