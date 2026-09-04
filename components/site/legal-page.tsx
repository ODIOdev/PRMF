import type { ReactNode } from "react";
import { getDictionary } from "@/lib/get-dictionary";

export async function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  const { t } = await getDictionary();
  return (
    <div>
      <section className="bg-ford text-white">
        <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/65">Premier Brooklyn</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>
          <p className="mt-3 text-sm text-white/75">{t.legal.lastUpdated(updated)}</p>
        </div>
      </section>
      <article className="mx-auto max-w-3xl space-y-8 px-4 py-12">{children}</article>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-7 text-muted-foreground">{children}</div>
    </section>
  );
}
