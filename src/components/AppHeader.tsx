import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import { LiveBadge } from "./LiveBadge";
import { cn } from "@/lib/cn";

type AppHeaderProps = {
  title?: string;
  subtitle?: string;
  backTo?: string;
  backLabel?: string;
  live?: boolean;
  updatedAt?: string | null;
  refreshing?: boolean;
  className?: string;
  showLogo?: boolean;
};

export function AppHeader({
  title,
  subtitle,
  backTo,
  backLabel = "Retour",
  live,
  updatedAt,
  refreshing,
  className,
  showLogo = true,
}: AppHeaderProps) {
  return (
    <header className={cn("mb-5", className)}>
      {showLogo && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <Link to="/" aria-label="MultiTrack — Accueil">
            <BrandLogo variant="light" heightClass="h-9 sm:h-10" />
          </Link>
          <span className="brand-pill">Classements</span>
        </div>
      )}
      {backTo && (
        <Link
          to={backTo}
          className="touch-target mb-3 inline-flex items-center gap-2 rounded-[10px] px-1 py-2 text-base font-semibold text-navy hover:text-cta"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden />
          {backLabel}
        </Link>
      )}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {title && (
            <h1 className="font-display text-3xl leading-tight text-navy sm:text-4xl">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="mt-1 text-base text-muted">{subtitle}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          {live && <LiveBadge />}
          {updatedAt && (
            <p className="text-sm text-muted" aria-live="polite">
              {refreshing ? "Mise à jour…" : `Mis à jour à ${updatedAt}`}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
