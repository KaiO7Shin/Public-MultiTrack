import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import type { Course } from "@/lib/types";
import { StatusBadge, TypeBadge } from "./StatusBadge";
import { cn } from "@/lib/cn";

type RaceCardProps = {
  race: Course;
  index?: number;
};

export function RaceCard({ race, index = 0 }: RaceCardProps) {
  const live = race.status === "En cours";

  return (
    <Link
      to={`/course/${race.id}`}
      className={cn(
        "group animate-rise-in flex min-h-[72px] items-center gap-4 rounded-2xl border-2 border-navy/10 bg-cream-bright/90 p-4 shadow-sm transition",
        "hover:border-cta/40 hover:shadow-md active:scale-[0.99]",
        live && "border-live/30 ring-2 ring-live/15"
      )}
      style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
      aria-label={`${race.name}, ${race.type}, ${race.status}`}
    >
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <StatusBadge status={race.status} />
          <TypeBadge type={race.type} />
        </div>
        <h2 className="font-display text-2xl font-bold leading-tight text-navy sm:text-3xl">
          {race.name}
        </h2>
        {(race.distanceKm != null || race.elevation != null) && (
          <p className="mt-1 text-base text-muted">
            {race.distanceKm != null && `${race.distanceKm} km`}
            {race.distanceKm != null && race.elevation != null && " · "}
            {race.elevation != null && `D+ ${race.elevation} m`}
          </p>
        )}
      </div>
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cta text-cream-bright transition group-hover:bg-cta-dark"
        aria-hidden
      >
        <ChevronRight className="h-6 w-6" strokeWidth={2.5} />
      </span>
    </Link>
  );
}
