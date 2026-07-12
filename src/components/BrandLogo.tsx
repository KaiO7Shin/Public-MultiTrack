import { cn } from "@/lib/cn";

type BrandLogoProps = {
  /** light = logo pour fond clair ; dark = logo pour fond sombre */
  variant?: "light" | "dark";
  className?: string;
  heightClass?: string;
};

export function BrandLogo({
  variant = "light",
  className,
  heightClass = "h-10 sm:h-12",
}: BrandLogoProps) {
  const src =
    variant === "dark"
      ? "/images/logo-dark.png"
      : "/images/logo-light.png";

  return (
    <img
      src={src}
      alt="MultiTrack"
      width={360}
      height={172}
      decoding="async"
      className={cn("w-auto", heightClass, className)}
    />
  );
}
