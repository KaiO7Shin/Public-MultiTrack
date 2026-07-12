import { Loader2, AlertCircle, RefreshCw, SearchX, Timer } from "lucide-react";
import { cn } from "@/lib/cn";

export function LoadingState({ label = "Chargement…" }: { label?: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 py-16 text-navy"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-10 w-10 animate-spin text-cta" aria-hidden />
      <p className="text-lg font-semibold">{label}</p>
    </div>
  );
}

type ErrorStateProps = {
  message: string;
  onRetry?: () => void;
};

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      className="surface-card flex flex-col items-center gap-4 border-cta/25 px-6 py-10 text-center"
      role="alert"
    >
      <AlertCircle className="h-10 w-10 text-cta" aria-hidden />
      <p className="max-w-sm text-lg font-semibold text-navy">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="btn-primary gap-2 text-base"
        >
          <RefreshCw className="h-5 w-5" aria-hidden />
          Réessayer
        </button>
      )}
    </div>
  );
}

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: "search" | "timer" | "none";
  className?: string;
};

export function EmptyState({
  title,
  description,
  icon = "timer",
  className,
}: EmptyStateProps) {
  const Icon = icon === "search" ? SearchX : Timer;
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line bg-cream-soft/60 px-6 py-12 text-center",
        className
      )}
    >
      {icon !== "none" && (
        <Icon className="h-10 w-10 text-muted" aria-hidden />
      )}
      <p className="font-display text-2xl text-navy">{title}</p>
      {description && (
        <p className="max-w-sm text-base text-muted">{description}</p>
      )}
    </div>
  );
}
