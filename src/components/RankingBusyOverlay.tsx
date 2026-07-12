import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

type RankingBusyOverlayProps = {
  active: boolean;
  label?: string;
  className?: string;
};

/** Overlay semi-transparent + spinner pendant filtre / soft refresh */
export function RankingBusyOverlay({
  active,
  label = "Mise à jour…",
  className,
}: RankingBusyOverlayProps) {
  if (!active) return null;

  return (
    <div
      className={cn(
        "absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-[12px] bg-cream/80 backdrop-blur-[2px]",
        "animate-fade-in",
        className
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2 className="h-9 w-9 animate-spin text-cta" aria-hidden />
      <p className="text-base font-bold text-navy">{label}</p>
    </div>
  );
}

/** Barre fine en haut pendant un refresh silencieux */
export function RefreshProgressBar({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div
      className="mb-3 h-1.5 overflow-hidden rounded-full bg-navy/10"
      role="progressbar"
      aria-label="Actualisation"
    >
      <div className="h-full w-1/3 animate-progress-slide rounded-full bg-cta" />
    </div>
  );
}
