import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useParams } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { SearchBar } from "@/components/SearchBar";
import { FilterTabs } from "@/components/FilterTabs";
import { Podium } from "@/components/Podium";
import { RankingList } from "@/components/RankingList";
import { LoadingState, ErrorState, EmptyState } from "@/components/EmptyState";
import {
  RankingBusyOverlay,
  RefreshProgressBar,
} from "@/components/RankingBusyOverlay";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { fetchRaceById } from "@/services/races";
import { fetchPhases, fetchRankingForCourse } from "@/services/ranking";
import type { BikeType, Course, FilterTab, Phase, RankingEntry } from "@/lib/types";
import {
  filterEntries,
  statusLabel,
  typeLabel,
  uniqueCategories,
} from "@/lib/utils";
import { cn } from "@/lib/cn";

export function RankingPage() {
  const { raceId: raceIdParam } = useParams();
  const raceId = Number(raceIdParam);

  const [race, setRace] = useState<Course | null>(null);
  const [phases, setPhases] = useState<Phase[]>([]);
  /** Phase choisie par l'utilisateur ; null = première phase auto */
  const [selectedPhaseId, setSelectedPhaseId] = useState<number | null>(null);
  const [activePhaseId, setActivePhaseId] = useState<number | null>(null);
  const [entries, setEntries] = useState<RankingEntry[]>([]);
  const [phaseLabel, setPhaseLabel] = useState<string | undefined>();

  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<FilterTab>("all");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [bikeType, setBikeType] = useState<BikeType | null>(null);
  const [isFilterPending, startFilterTransition] = useTransition();
  const [resultsKey, setResultsKey] = useState(0);

  useEffect(() => {
    setRace(null);
    setPhases([]);
    setSelectedPhaseId(null);
    setActivePhaseId(null);
    setEntries([]);
    setPhaseLabel(undefined);
    setSearch("");
    setTab("all");
    setSelectedCategory(null);
    setBikeType(null);
  }, [raceId]);

  const load = useCallback(
    async (signal: AbortSignal) => {
      if (!Number.isFinite(raceId) || raceId <= 0) return;

      const current = await fetchRaceById(raceId, signal);
      setRace(current);
      if (!current) {
        setEntries([]);
        throw Object.assign(new Error("Course introuvable"), {
          response: { status: 404 },
        });
      }

      let pid: number | null = null;
      if (current.type === "DH" || current.type === "XC") {
        const list = await fetchPhases(raceId, signal);
        setPhases(list);
        pid =
          selectedPhaseId != null && list.some((p) => p.id === selectedPhaseId)
            ? selectedPhaseId
            : (list[0]?.id ?? null);
        setActivePhaseId(pid);
      } else {
        setPhases([]);
        setActivePhaseId(null);
      }

      // Classement complet : filtres genre / cat / vélo appliqués côté client (instantané)
      const result = await fetchRankingForCourse(
        raceId,
        current.type,
        pid,
        signal
      );
      setEntries(result.entries);
      setPhaseLabel(result.phaseLabel);
    },
    [raceId, selectedPhaseId]
  );

  const ready = Number.isFinite(raceId) && raceId > 0;

  const { loading, error, reload, updatedAt, refreshing } = useAutoRefresh(
    load,
    ready,
    raceId
  );

  const categories = useMemo(() => uniqueCategories(entries), [entries]);

  const filtered = useMemo(() => {
    const gender = tab === "Homme" || tab === "Femme" ? tab : null;
    const category = tab === "categories" ? selectedCategory : null;
    return filterEntries(entries, {
      gender,
      category,
      bikeType: race?.type === "DH" ? bikeType : null,
      search,
    });
  }, [entries, tab, selectedCategory, search, bikeType, race?.type]);

  const podiumSource = useMemo(() => {
    const gender = tab === "Homme" || tab === "Femme" ? tab : null;
    const category = tab === "categories" ? selectedCategory : null;
    return filterEntries(entries, {
      gender,
      category,
      bikeType: race?.type === "DH" ? bikeType : null,
    });
  }, [entries, tab, selectedCategory, bikeType, race?.type]);

  const bumpResults = () => setResultsKey((k) => k + 1);

  const applyFilter = useCallback((action: () => void) => {
    startFilterTransition(() => {
      action();
      bumpResults();
    });
  }, []);

  const hasRows = entries.length > 0;
  const initialLoading = loading && !hasRows;
  const softBusy = (loading && hasRows) || refreshing || isFilterPending;

  const notStarted = race?.status === "A venir";
  const noResults = !initialLoading && !error && entries.length === 0;
  const searchMiss =
    !initialLoading &&
    !error &&
    !softBusy &&
    entries.length > 0 &&
    filtered.length === 0 &&
    search.trim().length > 0;
  const filterMiss =
    !initialLoading &&
    !error &&
    !softBusy &&
    entries.length > 0 &&
    filtered.length === 0 &&
    !search.trim();

  if (!ready) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <ErrorState message="Cette course est introuvable." />
      </div>
    );
  }

  const needsPhaseTabs =
    (race?.type === "DH" || race?.type === "XC") && phases.length > 1;

  return (
    <div className="texture-grain mx-auto min-h-dvh max-w-lg px-4 pb-20 pt-4 sm:max-w-2xl">
      <AppHeader
        backTo="/"
        backLabel="Toutes les courses"
        title={race?.name ?? "Classement"}
        subtitle={
          race
            ? [typeLabel(race.type), statusLabel(race.status), phaseLabel]
                .filter(Boolean)
                .join(" · ")
            : undefined
        }
        live={race?.status === "En cours"}
        updatedAt={updatedAt}
        refreshing={refreshing || softBusy}
      />

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
              disabled={softBusy && activePhaseId !== p.id && loading}
              onClick={() => setSelectedPhaseId(p.id)}
              className={cn(
                "touch-target shrink-0 rounded-xl border-2 px-4 py-2.5 text-base font-bold",
                activePhaseId === p.id
                  ? "border-navy bg-navy text-cream-bright"
                  : "border-navy/15 bg-cream-bright text-navy"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      <div className="mb-4 space-y-3">
        <SearchBar value={search} onChange={setSearch} />
        <FilterTabs
          value={tab}
          onChange={(t) =>
            applyFilter(() => {
              setTab(t);
              if (t !== "categories") setSelectedCategory(null);
            })
          }
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(c) => applyFilter(() => setSelectedCategory(c))}
          showBikeFilter={race?.type === "DH"}
          bikeType={bikeType}
          onBikeTypeChange={(b) => applyFilter(() => setBikeType(b))}
        />
      </div>

      <RefreshProgressBar active={softBusy} />

      {initialLoading && <LoadingState label="Chargement du classement…" />}

      {!initialLoading && error && (
        <ErrorState message={error} onRetry={reload} />
      )}

      {!initialLoading && !error && notStarted && noResults && (
        <EmptyState
          title="La course n’a pas encore commencé"
          description="Le classement apparaîtra dès les premiers temps."
          icon="timer"
        />
      )}

      {!initialLoading && !error && !notStarted && noResults && (
        <EmptyState
          title="Aucun résultat pour l’instant"
          description="Les temps s’affichent ici dès qu’ils sont enregistrés."
          icon="timer"
        />
      )}

      {!initialLoading && !error && searchMiss && (
        <EmptyState
          title="Coureur introuvable"
          description="Vérifiez le numéro de dossard ou le nom, puis réessayez."
          icon="search"
        />
      )}

      {!initialLoading && !error && filterMiss && (
        <EmptyState
          title="Personne dans ce filtre"
          description="Essayez « Tous », un autre type de vélo, ou une autre catégorie."
          icon="search"
        />
      )}

      {!initialLoading && !error && (filtered.length > 0 || softBusy) && (
        <div className="relative min-h-[200px]">
          <RankingBusyOverlay
            active={softBusy}
            label={
              isFilterPending
                ? "Filtrage…"
                : loading
                  ? "Chargement…"
                  : "Mise à jour…"
            }
          />
          {filtered.length > 0 && (
            <div key={resultsKey} className="animate-results-swap">
              {!search.trim() && (
                <Podium entries={podiumSource} raceId={raceId} />
              )}
              <RankingList entries={filtered} raceId={raceId} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
