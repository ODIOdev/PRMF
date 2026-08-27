import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const RATIO = 705 / 278;

export function PremierLogo({
  height = 52,
  className,
  priority = false,
}: {
  height?: number;
  className?: string;
  priority?: boolean;
}) {
  const width = Math.round(height * RATIO);
  return (
    <Image
      src="/logos/premier-ford.png"
      alt="Premier Ford"
      width={width}
      height={height}
      priority={priority}
      unoptimized
      className={cn("object-contain", className)}
      style={{ height, width }}
    />
  );
}

export function PremierLogoLink({
  height = 52,
  className,
}: {
  height?: number;
  className?: string;
}) {
  return (
    <Link href="/" className={cn("inline-flex items-center", className)} aria-label="Premier Brooklyn home">
      <PremierLogo height={height} priority />
    </Link>
  );
}

export function BrandLockup({ className }: { className?: string }) {
  return (
    <div className={cn("flex shrink-0 items-center gap-4", className)}>
      <Link href="/ford" className="inline-flex items-center" aria-label="Shop Ford">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logos/ford-oval.svg" alt="Ford" className="h-[30px] w-auto" />
      </Link>
      <span className="h-8 w-px bg-chrome" aria-hidden />
      <Link href="/lincoln" className="inline-flex items-center" aria-label="Shop Lincoln">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logos/lincoln.svg" alt="Lincoln" className="h-[36px] w-auto" />
      </Link>
    </div>
  );
}
