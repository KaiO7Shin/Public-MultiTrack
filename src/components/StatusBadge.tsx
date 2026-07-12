import type { CourseStatus, CourseType } from "@/lib/types";
import { statusLabel, typeLabel } from "@/lib/utils";
import { cn } from "@/lib/cn";

export function StatusBadge({ status }: { status: CourseStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        status === "En cours" && "bg-sage-soft text-sage-dark",
        status === "A venir" && "bg-cream-soft text-navy/70",
        status === "Terminee" && "bg-navy/8 text-navy"
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
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        type === "TRAIL" && "bg-sage/20 text-sage-dark",
        type === "DH" && "bg-dh/15 text-dh",
        type === "XC" && "bg-xc/15 text-xc"
      )}
    >
      {typeLabel(type)}
    </span>
  );
}
