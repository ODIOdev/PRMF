"use client";

import { useDeferredValue, useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { formatUsd, listingPrice, titleCase } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { InventoryLotRow, InventoryParams } from "@/components/admin/inventory-desk";

const HIT_LIMIT = 8;
const STATUS_TONE: Record<string, string> = {
  in_stock: "bg-emerald-100 text-emerald-900",
  in_transit: "bg-[#dbe7f5] text-ford",
  sold: "bg-[#eceff2] text-[#5b6570]",
  hidden: "bg-amber-100 text-amber-950",
};

function compact(value: string) {
  return value.toLowerCase().replace(/[\s-]/g, "");
}

function haystack(row: InventoryLotRow) {
  return [row.year, row.make, row.model, row.trim, row.vin, row.stock_number, row.brand, row.status, row.condition]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function scoreHit(row: InventoryLotRow, query: string) {
  const tokens = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) return -1;
  const text = haystack(row);
  const packed = compact(text);
  const title = [row.year, row.make, row.model, row.trim].filter(Boolean).join(" ").toLowerCase();
  const vin = (row.vin ?? "").toLowerCase();
  const stock = (row.stock_number ?? "").toLowerCase();

  for (const token of tokens) {
    if (!text.includes(token) && !packed.includes(compact(token))) return -1;
  }

  let score = 10;
  const joined = tokens.join(" ");
  if (stock.startsWith(joined) || compact(stock).startsWith(compact(joined))) score += 80;
  else if (stock.includes(joined) || compact(stock).includes(compact(joined))) score += 50;
  if (vin.includes(joined) || compact(vin).includes(compact(joined))) score += 60;
  if (title.startsWith(joined)) score += 40;
  else if (title.includes(joined)) score += 20;
  if ((row.model ?? "").toLowerCase().includes(tokens[0]!)) score += 15;
  return score;
}

function searchLot(catalog: InventoryLotRow[], query: string) {
  const q = query.trim();
  if (!q) return [];
  return catalog
    .map((row) => ({ row, score: scoreHit(row, q) }))
    .filter((item) => item.score >= 0)
    .sort((a, b) => b.score - a.score || (b.row.year ?? 0) - (a.row.year ?? 0))
    .map((item) => item.row);
}

export function InventoryDeskSearch({
  params,
  catalog,
}: {
  params: InventoryParams;
  catalog: InventoryLotRow[];
}) {
  const router = useRouter();
  const root = useRef<HTMLFormElement>(null);
  const listId = useId();
  const [query, setQuery] = useState(params.q ?? "");
  const deferredQuery = useDeferredValue(query);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const matches = useMemo(() => searchLot(catalog, deferredQuery), [catalog, deferredQuery]);
  const hits = matches.slice(0, HIT_LIMIT);
  const showList = open && Boolean(query.trim());

  useEffect(() => {
    setQuery(params.q ?? "");
  }, [params.q]);

  useEffect(() => {
    setActive(0);
  }, [deferredQuery]);

  useEffect(() => {
    function onPointer(event: MouseEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    window.addEventListener("mousedown", onPointer);
    return () => window.removeEventListener("mousedown", onPointer);
  }, []);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <form
      ref={root}
      action="/admin/inventory"
      className="relative flex min-w-0 flex-1 gap-2"
    >
      {params.brand ? <input type="hidden" name="brand" value={params.brand} /> : null}
      {params.condition ? <input type="hidden" name="condition" value={params.condition} /> : null}
      {params.status ? <input type="hidden" name="status" value={params.status} /> : null}
      {params.aged === "1" ? <input type="hidden" name="aged" value="1" /> : null}
      <label className="relative min-w-0 flex-1">
        <span className="sr-only">Search inventory</span>
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          name="q"
          type="search"
          autoComplete="off"
          spellCheck={false}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (query.trim()) setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
              return;
            }
            if (!showList) return;
            if (event.key === "ArrowDown") {
              event.preventDefault();
              const count = hits.length + (matches.length > HIT_LIMIT ? 1 : 0);
              if (!count) return;
              setActive((index) => (index + 1) % count);
            }
            if (event.key === "ArrowUp") {
              event.preventDefault();
              const count = hits.length + (matches.length > HIT_LIMIT ? 1 : 0);
              if (!count) return;
              setActive((index) => (index - 1 + count) % count);
            }
            if (event.key === "Enter" && showList && hits[active] && active < hits.length) {
              event.preventDefault();
              go(`/admin/inventory/${hits[active].id}`);
              return;
            }
            if (event.key === "Enter" && active >= hits.length) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
          placeholder="Model, stock, or VIN"
          className="h-9 w-full border border-input bg-[#f7f8fa] pr-3 pl-8 text-sm outline-none focus:border-ford focus:bg-white"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList && hits[active] ? `${listId}-opt-${active}` : undefined}
        />
        {showList ? (
          <div
            id={listId}
            role="listbox"
            className="absolute top-full right-0 left-0 z-30 mt-1 max-h-80 overflow-y-auto border border-chrome bg-white shadow-[0_12px_32px_rgb(11_31_58_/_12%)]"
          >
            {hits.length === 0 ? (
              <p className="px-3 py-2.5 text-sm text-muted-foreground">No matching vehicles.</p>
            ) : (
              <>
                {hits.map((row, index) => {
                  const title = [row.year, row.make, row.model].filter(Boolean).join(" ") || "Vehicle";
                  return (
                    <Link
                      key={row.id}
                      id={`${listId}-opt-${index}`}
                      role="option"
                      aria-selected={index === active}
                      href={`/admin/inventory/${row.id}`}
                      className={cn(
                        "flex items-start justify-between gap-3 px-3 py-2 text-sm",
                        index === active ? "bg-[#eef4fb]" : "hover:bg-[#f7f8fa]",
                      )}
                      onMouseEnter={() => setActive(index)}
                      onClick={() => setOpen(false)}
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{title}</span>
                        <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                          <span className="font-mono tabular-nums">{row.stock_number ?? row.vin ?? "No stock"}</span>
                          <span className={cn("px-1 py-px font-semibold uppercase tracking-wide", STATUS_TONE[row.status] ?? STATUS_TONE.hidden)}>
                            {titleCase(row.status)}
                          </span>
                        </span>
                      </span>
                      <span className="shrink-0 tabular-nums text-ford">{formatUsd(listingPrice(row))}</span>
                    </Link>
                  );
                })}
                {matches.length > HIT_LIMIT ? (
                  <button
                    type="submit"
                    className={cn(
                      "flex w-full items-center justify-between px-3 py-2 text-left text-xs font-medium text-ford hover:bg-[#f7f8fa]",
                      active >= hits.length && "bg-[#eef4fb]",
                    )}
                    onMouseEnter={() => setActive(hits.length)}
                  >
                    View all {matches.length} matches in the list
                  </button>
                ) : null}
              </>
            )}
          </div>
        ) : null}
      </label>
      <button type="submit" data-list="1" className="h-9 bg-ford px-3 text-sm font-medium text-white hover:bg-ford-bright">
        Search
      </button>
    </form>
  );
}
