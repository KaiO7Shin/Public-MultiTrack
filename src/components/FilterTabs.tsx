import type { BikeType, FilterTab } from "@/lib/types";
import { BIKE_TYPE_LABELS, BIKE_TYPES } from "@/lib/types";
import { cn } from "@/lib/cn";

const TABS: { id: FilterTab; label: string }[] = [
  { id: "all", label: "Tous" },
  { id: "Homme", label: "Hommes" },
  { id: "Femme", label: "Femmes" },
  { id: "categories", label: "Catégories" },
];

type FilterTabsProps = {
  value: FilterTab;
  onChange: (tab: FilterTab) => void;
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
  /** Affiché pour les courses DH */
  showBikeFilter?: boolean;
  bikeType?: BikeType | null;
  onBikeTypeChange?: (bike: BikeType | null) => void;
};

export function FilterTabs({
  value,
  onChange,
  categories,
  selectedCategory,
  onSelectCategory,
  showBikeFilter = false,
  bikeType = null,
  onBikeTypeChange,
}: FilterTabsProps) {
  return (
    <div className="space-y-3">
      <div
        role="tablist"
        aria-label="Filtres du classement"
        className="grid grid-cols-2 gap-2 sm:grid-cols-4"
      >
        {TABS.map((tab) => {
          const active = value === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                onChange(tab.id);
                if (tab.id !== "categories") onSelectCategory(null);
              }}
              className={cn(
                "touch-target rounded-xl border-2 px-3 py-3 text-base font-bold transition",
                active
                  ? "border-navy bg-navy text-cream-bright"
                  : "border-navy/15 bg-cream-bright text-navy hover:border-navy/40"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {value === "categories" && (
        <div
          className="flex flex-wrap gap-2"
          role="listbox"
          aria-label="Choisir une catégorie"
        >
          {categories.length === 0 ? (
            <p className="text-base text-muted">Aucune catégorie pour l’instant.</p>
          ) : (
            categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => onSelectCategory(active ? null : cat)}
                  className={cn(
                    "touch-target rounded-xl border-2 px-4 py-2.5 text-base font-bold transition",
                    active
                      ? "border-cta bg-cta text-cream-bright"
                      : "border-navy/15 bg-cream-bright text-navy"
                  )}
                >
                  {cat}
                </button>
              );
            })
          )}
        </div>
      )}

      {showBikeFilter && onBikeTypeChange && (
        <div
          role="tablist"
          aria-label="Type de vélo"
          className="grid grid-cols-1 gap-2 sm:grid-cols-3"
        >
          <button
            type="button"
            role="tab"
            aria-selected={bikeType == null}
            onClick={() => onBikeTypeChange(null)}
            className={cn(
              "touch-target rounded-xl border-2 px-3 py-3 text-base font-bold transition",
              bikeType == null
                ? "border-navy bg-navy text-cream-bright"
                : "border-navy/15 bg-cream-bright text-navy hover:border-navy/40"
            )}
          >
            Tous les vélos
          </button>
          {BIKE_TYPES.map((t) => {
            const active = bikeType === t;
            return (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onBikeTypeChange(t)}
                className={cn(
                  "touch-target rounded-xl border-2 px-3 py-3 text-base font-bold transition",
                  active
                    ? "border-navy bg-navy text-cream-bright"
                    : "border-navy/15 bg-cream-bright text-navy hover:border-navy/40"
                )}
              >
                {BIKE_TYPE_LABELS[t]}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
