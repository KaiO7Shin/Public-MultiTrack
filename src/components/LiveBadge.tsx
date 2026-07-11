import { cn } from "@/lib/cn";

type LiveBadgeProps = {
  live?: boolean;
  className?: string;
};

export function LiveBadge({ live = true, className }: LiveBadgeProps) {
  if (!live) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full bg-live/15 px-3 py-1.5 text-sm font-bold text-live",
        className
      )}
      aria-label="Mise à jour en direct"
    >
      <span className="relative flex h-2.5 w-2.5" aria-hidden>
        <span className="absolute inset-0 animate-pulse-live rounded-full bg-live" />
        <span className="relative h-2.5 w-2.5 rounded-full bg-live" />
      </span>
      En direct
    </span>
  );
}
