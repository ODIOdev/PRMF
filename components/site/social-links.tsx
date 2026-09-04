import { dealership } from "@/lib/dealership";
import { cn } from "@/lib/utils";

type SocialName = (typeof dealership.socials)[number]["name"];

function SocialIcon({ name }: { name: SocialName }) {
  const className = "size-[18px]";
  if (name === "Facebook") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
        <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
      </svg>
    );
  }
  if (name === "X") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
        <path d="M13.68 10.47 20.4 3h-1.6l-5.83 6.5L8.32 3H3.5l7.05 9.9L3.5 21h1.6l6.16-6.87L15.68 21H20.5l-6.82-10.53ZM11.9 13.23l-.71-.99L5.68 4.16h2.45l4.58 6.37.71.98 5.95 8.28h-2.45L11.9 13.23Z" />
      </svg>
    );
  }
  if (name === "YouTube") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
        <path d="M23.5 6.2a3.02 3.02 0 0 0-2.13-2.14C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.37.46A3.02 3.02 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3.02 3.02 0 0 0 2.13 2.14c1.87.46 9.37.46 9.37.46s7.5 0 9.37-.46a3.02 3.02 0 0 0 2.13-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8ZM9.75 15.57V8.43L15.84 12l-6.09 3.57Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.23 0H1.77A1.75 1.75 0 0 0 0 1.73v20.54A1.75 1.75 0 0 0 1.77 24h20.46A1.76 1.76 0 0 0 24 22.27V1.73A1.76 1.76 0 0 0 22.23 0Z" />
    </svg>
  );
}

export function SocialLinks({
  variant = "light",
  className,
}: {
  variant?: "light" | "dark";
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {dealership.socials.map((social) => (
        <a
          key={social.name}
          href={social.href}
          target="_blank"
          rel="noreferrer"
          aria-label={social.name}
          className={cn(
            "flex size-9 items-center justify-center rounded-full border transition",
            variant === "dark"
              ? "border-white/20 text-white/80 hover:border-white hover:text-white"
              : "border-chrome text-ford hover:border-ford hover:text-ford",
          )}
        >
          <SocialIcon name={social.name} />
        </a>
      ))}
    </div>
  );
}
