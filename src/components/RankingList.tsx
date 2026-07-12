import { Link } from "react-router-dom";
import type { RankingEntry } from "@/lib/types";
import { BIKE_TYPE_LABELS } from "@/lib/types";
import { athletePath } from "@/lib/links";
import { formatParticipantName } from "@/lib/utils";
import { cn } from "@/lib/cn";

type RankingListProps = {
  entries: RankingEntry[];
  raceId: number;
  phaseId?: number | null;
  /** false pour XC (classement sans temps) */
  showTime?: boolean;
};

export function RankingList({
  entries,
  raceId,
  phaseId,
  showTime = true,
}: RankingListProps) {
  if (entries.length === 0) return null;

  return (
    <ol className="space-y-2" aria-label="Classement">
      {entries.map((entry, i) => (
        <li key={entry.participantId}>
          <Link
            to={athletePath(raceId, entry.participantId, phaseId)}
            className={cn(
              "flex min-h-[64px] items-center gap-3 rounded-[12px] border border-line bg-cream-bright px-3 py-3 shadow-sm transition",
              "hover:border-navy/20 active:scale-[0.995]",
              entry.disqualified && "opacity-60"
            )}
            style={
              i < 12 ? { animationDelay: `${i * 30}ms` } : undefined
            }
          >
            <span
              className={cn(
                "font-sans flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] text-xl font-bold",
                entry.rank === 1 && "bg-gold text-cream-bright",
                entry.rank === 2 && "bg-silver text-cream-bright",
                entry.rank === 3 && "bg-bronze text-cream-bright",
                (entry.rank == null || entry.rank > 3) && "bg-navy/8 text-navy"
              )}
              aria-label={
                entry.rank != null ? `Rang ${entry.rank}` : "Sans rang"
              }
            >
              {entry.rank ?? "—"}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="shrink-0 rounded-md bg-navy px-2 py-0.5 text-sm font-bold text-cream-bright">
                  n°{entry.bib || "—"}
                </span>
                <span className="truncate text-lg font-bold text-navy">
                  {formatParticipantName(entry.firstName, entry.lastName)}
                </span>
              </div>
              <p className="mt-0.5 truncate text-base text-muted">
                {entry.category || "—"}
                {entry.bikeType
                  ? ` · ${BIKE_TYPE_LABELS[entry.bikeType]}`
                  : ""}
                {entry.status ? ` · ${entry.status}` : ""}
                {entry.categoryRank != null
                  ? ` · Cat. ${entry.categoryRank}`
                  : ""}
              </p>
            </div>

            {showTime && (
              <span className="font-sans shrink-0 text-right text-xl font-bold text-navy sm:text-2xl">
                {entry.time ?? "—"}
              </span>
            )}
          </Link>
        </li>
      ))}
    </ol>
  );
}
