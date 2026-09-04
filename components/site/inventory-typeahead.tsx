"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type InventoryHit = {
  id: string;
  vin: string | null;
  href: string;
  year: number | null;
  make: string | null;
  model: string | null;
  trim: string | null;
  brand: string;
  condition: string;
  stock: string | null;
  price: string;
};

export function useInventoryHits(q: string, brand = "", condition = "") {
  const [hits, setHits] = useState<InventoryHit[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const query = q.trim();
    if (query.length < 1) {
      setHits([]);
      setReady(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: query });
        if (brand) params.set("brand", brand);
        if (condition) params.set("condition", condition);
        const res = await fetch(`/api/inventory/search?${params}`, { signal: controller.signal });
        if (!res.ok) {
          setHits([]);
          setReady(true);
          return;
        }
        const data = (await res.json()) as { vehicles?: InventoryHit[] };
        setHits(data.vehicles ?? []);
        setReady(true);
      } catch (error) {
        if ((error as { name?: string }).name !== "AbortError") {
          setHits([]);
          setReady(true);
        }
      }
    }, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [q, brand, condition]);

  return { hits, ready };
}

export function InventoryHitsList({
  id,
  hits,
  active,
  emptyLabel,
  onActive,
  onNavigate,
  className,
}: {
  id: string;
  hits: InventoryHit[];
  active: number;
  emptyLabel: string;
  onActive: (index: number) => void;
  onNavigate: () => void;
  className?: string;
}) {
  return (
    <ul
      id={id}
      role="listbox"
      className={cn(
        "border border-chrome bg-white shadow-[0_12px_32px_rgb(11_31_58_/_12%)]",
        className,
      )}
    >
      {hits.length === 0 ? (
        <li className="px-3 py-2.5 text-sm text-muted-foreground">{emptyLabel}</li>
      ) : (
        hits.map((hit, index) => (
          <li key={hit.id} role="option" aria-selected={index === active}>
            <Link
              href={hit.href}
              className={cn(
                "flex items-baseline justify-between gap-3 px-3 py-2 text-sm",
                index === active ? "bg-[#f4f6f8]" : "hover:bg-[#f4f6f8]",
              )}
              onMouseEnter={() => onActive(index)}
              onClick={onNavigate}
            >
              <span className="min-w-0">
                <span className="font-medium">{[hit.year, hit.make, hit.model].filter(Boolean).join(" ")}</span>
                {hit.trim ? <span className="text-muted-foreground"> {hit.trim}</span> : null}
                <span className="mt-0.5 block text-[11px] text-muted-foreground">
                  {hit.vin ? `VIN ${hit.vin}` : hit.stock ? `Stock ${hit.stock}` : hit.brand}
                </span>
              </span>
              <span className="shrink-0 tabular-nums text-ford">{hit.price}</span>
            </Link>
          </li>
        ))
      )}
    </ul>
  );
}
