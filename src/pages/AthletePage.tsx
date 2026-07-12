import { useCallback, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { LoadingState, ErrorState, EmptyState } from "@/components/EmptyState";
import { ProvisionalNotice } from "@/components/ProvisionalNotice";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { fetchRaceById } from "@/services/races";
import { fetchPhases, fetchRankingForCourse } from "@/services/ranking";
import type { Course, MancheTimeDetail, Phase, RankingEntry } from "@/lib/types";
import {
  formatParticipantName,
  isRaceLive,
  statusLabel,
  typeLabel,
} from "@/lib/utils";
import { BIKE_TYPE_LABELS } from "@/lib/types";
import { cn } from "@/lib/cn";

export function AthletePage() {
  const { raceId: raceIdParam, participantId: pidParam } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const raceId = Number(raceIdParam);
  const participantId = Number(pidParam);
  const phaseFromUrl = Number(searchParams.get("phase"));

  const [race, setRace] = useState<Course | null>(null);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [entry, setEntry] = useState<RankingEntry | null>(null);
  const [phaseLabel, setPhaseLabel] = useState<string | undefined>();
  const [activePhaseId, setActivePhaseId] = useState<number | null>(null);

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
        const list = await fetchPhases(raceId, signal);
        setPhases(list);
        phaseId =
          Number.isFinite(phaseFromUrl) &&
          phaseFromUrl > 0 &&
          list.some((p) => p.id === phaseFromUrl)
            ? phaseFromUrl
            : (list[0]?.id ?? null);
        setActivePhaseId(phaseId);
      } else {
        setPhases([]);
        setActivePhaseId(null);
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
    [raceId, participantId, phaseFromUrl]
  );

  const ready =
    Number.isFinite(raceId) &&
    raceId > 0 &&
    Number.isFinite(participantId) &&
    participantId > 0;

  const { loading, error, reload, updatedAt, refreshing } = useAutoRefresh(
    load,
    ready,
    `${raceId}-${participantId}`,
    phaseFromUrl || "auto"
  );

  const name = useMemo(
    () =>
      entry
        ? formatParticipantName(entry.firstName, entry.lastName)
        : "Coureur",
    [entry]
  );

  const live = isRaceLive(race?.status);
  const isXc = race?.type === "XC";
  const mancheTimes = entry?.mancheTimes ?? [];
  const showManches = mancheTimes.length > 0;
  const needsPhaseTabs =
    (race?.type === "DH" || race?.type === "XC") && phases.length > 1;

  if (!ready) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <ErrorState message="Coureur introuvable." />
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-dvh max-w-lg px-4 pb-16 pt-4 sm:max-w-xl">
      <AppHeader
        backTo={`/course/${raceId}`}
        backLabel="Retour au classement"
        title={loading && !entry ? "Coureur" : name}
        subtitle={
          race
            ? [race.name, typeLabel(race.type), phaseLabel]
                .filter(Boolean)
                .join(" · ")
            : undefined
        }
        live={live}
        updatedAt={updatedAt}
        refreshing={refreshing}
      />

      {live && <ProvisionalNotice />}

      {needsPhaseTabs && (
        <div
          className="mb-4 flex gap-2 overflow-x-auto pb-1"
          role="tablist"
          aria-label="Phases"
        >
          {phases.map((p) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={activePhaseId === p.id}
              onClick={() => setSearchParams({ phase: String(p.id) })}
              className={cn(
                "touch-target shrink-0 rounded-[10px] border px-4 py-2.5 text-base font-semibold",
                activePhaseId === p.id
                  ? "border-navy bg-navy text-white"
                  : "border-line bg-cream-bright text-navy"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {loading && !entry && !error && <LoadingState label="Chargement…" />}
      {!loading && error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && !entry && (
        <EmptyState
          title="Coureur introuvable"
          description="Ce coureur n’apparaît pas encore dans le classement."
          icon="search"
        />
      )}

      {!error && entry && (
        <article className="animate-rise-in surface-card overflow-hidden">
          <div className="bg-navy px-6 py-8 text-white">
            <p className="text-sm font-semibold tracking-wide text-white/70 uppercase">
              Dossard
            </p>
            <p className="font-display text-5xl text-white">
              n°{entry.bib || "—"}
            </p>
            <h2 className="mt-2 font-sans text-3xl font-semibold">{name}</h2>
            <p className="mt-1 text-base text-white/80">
              {entry.category || "—"}
              {entry.gender ? ` · ${entry.gender}` : ""}
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-px bg-line">
            <Stat label="Rang général" value={entry.rank ?? "—"} highlight={isXc} />
            <Stat label="Rang catégorie" value={entry.categoryRank ?? "—"} />
            <Stat label="Rang genre" value={entry.genderRank ?? "—"} />
            {!isXc && (
              <Stat
                label={showManches ? "Meilleur temps" : "Temps"}
                value={entry.time ?? "—"}
                highlight
              />
            )}
            <Stat
              label="Statut"
              value={entry.status ?? "—"}
              className={entry.bikeType || isXc ? undefined : "col-span-2"}
            />
            {entry.bikeType && (
              <Stat
                label="Type de vélo"
                value={BIKE_TYPE_LABELS[entry.bikeType]}
              />
            )}
            {isXc && !entry.bikeType && (
              <Stat label="Type" value="Cross-country" />
            )}
            {race && (
              <Stat
                label="Course"
                value={`${race.name} (${statusLabel(race.status)})`}
                className="col-span-2"
              />
            )}
          </dl>

          {showManches && (
            <MancheTimesSection times={mancheTimes} hideTime={isXc} />
          )}
        </article>
      )}
    </div>
  );
}

function MancheTimesSection({
  times,
  hideTime = false,
}: {
  times: MancheTimeDetail[];
  hideTime?: boolean;
}) {
  return (
    <section
      className="border-t border-line px-5 py-6"
      aria-labelledby="manches-title"
    >
      <h3 id="manches-title" className="font-display mb-4 text-2xl text-navy">
        {hideTime ? "Poules / manches" : "Temps par manche"}
      </h3>
      <ul className="space-y-2">
        {times.map((mt) => {
          const done = mt.finished ?? mt.timeFormatted != null;
          return (
            <li
              key={mt.mancheId}
              className={cn(
                "flex min-h-[56px] items-center justify-between gap-3 rounded-[12px] border px-4 py-3",
                done
                  ? "border-line bg-cream-soft"
                  : "border-dashed border-line bg-cream-bright"
              )}
            >
              <span className="text-base font-semibold text-navy">
                {mt.mancheLabel}
              </span>
              <span
                className={cn(
                  "font-sans text-xl font-bold",
                  done ? "text-cta" : "text-muted"
                )}
              >
                {hideTime
                  ? done
                    ? "Classé"
                    : "En attente"
                  : (mt.timeFormatted ?? "—")}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
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
      <dt className="text-sm font-semibold tracking-wide text-muted uppercase">
        {label}
      </dt>
      <dd
        className={
          highlight
            ? "font-sans mt-1 text-3xl font-bold text-cta"
            : "font-sans mt-1 text-2xl font-semibold text-navy"
        }
      >
        {value}
      </dd>
    </div>
  );
}
