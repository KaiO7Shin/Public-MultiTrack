import { Link } from "react-router-dom";
import type { RankingEntry } from "@/lib/types";
import { athletePath } from "@/lib/links";
import { formatParticipantName } from "@/lib/utils";
import { cn } from "@/lib/cn";

type PodiumProps = {
  entries: RankingEntry[];
  raceId: number;
  phaseId?: number | null;
};

const ORDER = [1, 0, 2] as const;

export function Podium({ entries, raceId, phaseId }: PodiumProps) {
  const top = entries
    .filter(
      (e) => e.rank != null && e.rank >= 1 && e.rank <= 3 && !e.disqualified
    )
    .sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99))
    .slice(0, 3);

  if (top.length === 0) return null;

  const byRank = (rank: number) => top.find((e) => e.rank === rank);

  return (
    <section aria-label="Podium — Qui est premier ?" className="mb-6">
      <h2 className="font-display mb-4 text-center text-3xl text-navy sm:text-4xl">
        Qui est premier&nbsp;?
      </h2>
      <div className="flex items-end justify-center gap-2 sm:gap-4">
        {ORDER.map((idx, visualPos) => {
          const rank = idx + 1;
          const entry = byRank(rank);
          const heights = ["h-28", "h-36", "h-24"];
          const medals = ["bg-silver", "bg-gold", "bg-bronze"];
          const delay = ["120ms", "0ms", "200ms"];

          return (
            <div
              key={rank}
              className={cn(
                "animate-podium flex w-[30%] max-w-[140px] flex-col items-center",
                !entry && "opacity-40"
              )}
              style={{ animationDelay: delay[visualPos] }}
            >
              {entry ? (
                <Link
                  to={athletePath(raceId, entry.participantId, phaseId)}
                  className="mb-2 w-full text-center"
                >
                  <p className="truncate text-sm font-bold text-navy sm:text-base">
                    {formatParticipantName(entry.firstName, entry.lastName)}
                  </p>
                  <p className="text-sm text-muted">n°{entry.bib}</p>
                  <p className="mt-0.5 font-sans text-lg font-bold text-cta sm:text-xl">
                    {entry.time ?? "—"}
                  </p>
                </Link>
              ) : (
                <div className="mb-2 h-[4.5rem]" />
              )}
              <div
                className={cn(
                  "flex w-full flex-col items-center justify-start rounded-t-[12px] pt-3 text-white shadow-md",
                  heights[visualPos],
                  medals[visualPos]
                )}
                aria-hidden={!entry}
              >
                <span className="font-sans text-3xl font-bold sm:text-4xl">
                  {rank}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
