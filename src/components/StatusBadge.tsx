import type { CourseStatus, CourseType } from "@/lib/types";
import { statusLabel, typeLabel } from "@/lib/utils";
import { cn } from "@/lib/cn";

export function StatusBadge({ status }: { status: CourseStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-1 text-sm font-bold",
        status === "En cours" && "bg-live/15 text-live",
        status === "A venir" && "bg-navy/10 text-navy",
        status === "Terminee" && "bg-muted/20 text-muted"
      )}
    >
      {statusLabel(status)}
    </span>
  );
}

export function TypeBadge({ type }: { type: CourseType }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-1 text-sm font-bold text-cream-bright",
        type === "TRAIL" && "bg-trail",
        type === "DH" && "bg-dh",
        type === "XC" && "bg-xc"
      )}
    >
      {typeLabel(type)}
    </span>
  );
}
