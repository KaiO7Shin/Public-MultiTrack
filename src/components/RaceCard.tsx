import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import type { Course } from "@/lib/types";
import { isRaceLive } from "@/lib/utils";
import { StatusBadge, TypeBadge } from "./StatusBadge";
import { cn } from "@/lib/cn";

type RaceCardProps = {
  race: Course;
  index?: number;
};

export function RaceCard({ race, index = 0 }: RaceCardProps) {
  const live = isRaceLive(race.status);
  const finished = race.status === "Terminee";

  return (
    <Link
      to={`/course/${race.id}`}
      className={cn(
        "group animate-rise-in surface-card flex min-h-[72px] items-center gap-4 p-4 transition",
        "hover:border-cta/30 hover:shadow-md active:scale-[0.99]",
        live && "border-live/35 ring-1 ring-live/20",
        finished && "border-sage/40 ring-1 ring-sage/20"
      )}
      style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
      aria-label={`${race.name}, ${race.type}, ${race.status}`}
    >
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <StatusBadge status={race.status} />
          <TypeBadge type={race.type} />
          {live && (
            <span className="rounded-full bg-live/15 px-2.5 py-1 text-xs font-semibold text-live">
              En direct
            </span>
          )}
          {finished && (
            <span className="rounded-full bg-cta/10 px-2.5 py-1 text-xs font-semibold text-cta">
              Officiel
            </span>
          )}
        </div>
        <h2 className="font-sans text-xl font-semibold leading-tight text-navy sm:text-2xl">
          {race.name}
        </h2>
        {(race.distanceKm != null || race.elevation != null) && (
          <p className="mt-1 text-base text-muted">
            {race.distanceKm != null && `${race.distanceKm} km`}
            {race.distanceKm != null && race.elevation != null && " · "}
            {race.elevation != null && `D+ ${race.elevation} m`}
          </p>
        )}
        {race.status === "A venir" && (
          <p className="mt-1 text-base text-muted">
            Classement disponible dès le début de la course.
          </p>
        )}
        {live && (
          <p className="mt-1 text-base text-muted">
            Résultats provisoires — non définitifs.
          </p>
        )}
      </div>
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] bg-cta text-white transition group-hover:bg-cta-dark"
        aria-hidden
      >
        <ChevronRight className="h-6 w-6" strokeWidth={2.5} />
      </span>
    </Link>
  );
}
