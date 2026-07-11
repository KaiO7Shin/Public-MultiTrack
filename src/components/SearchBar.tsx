import { Search, X } from "lucide-react";
import { cn } from "@/lib/cn";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function SearchBar({ value, onChange, className }: SearchBarProps) {
  return (
    <div className={cn("relative", className)}>
      <label htmlFor="search-runner" className="sr-only">
        Chercher un coureur par dossard ou nom
      </label>
      <Search
        className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted"
        aria-hidden
      />
      <input
        id="search-runner"
        type="search"
        inputMode="search"
        enterKeyHint="search"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        placeholder="Chercher un coureur (n° ou nom)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="touch-target w-full rounded-2xl border-2 border-navy/15 bg-cream-bright py-3.5 pr-12 pl-12 text-lg text-navy placeholder:text-muted/80 shadow-sm"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="touch-target absolute top-1/2 right-2 flex -translate-y-1/2 items-center justify-center rounded-xl px-3 text-muted hover:text-navy"
          aria-label="Effacer la recherche"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
