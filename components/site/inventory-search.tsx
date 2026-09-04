"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/site/locale-provider";
import { InventoryHitsList, useInventoryHits } from "@/components/site/inventory-typeahead";

export function InventorySearch({
  brand = "",
  condition = "",
  q = "",
  submitLabel,
  className,
}: {
  brand?: string;
  condition?: string;
  q?: string;
  submitLabel?: string;
  className?: string;
}) {
  const { t } = useLocale();
  const router = useRouter();
  const root = useRef<HTMLFormElement>(null);
  const listId = useId();
  const [query, setQuery] = useState(q);
  const [brandValue, setBrandValue] = useState(brand);
  const [conditionValue, setConditionValue] = useState(condition);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const interactive = useRef(false);
  const { hits, ready } = useInventoryHits(query, brandValue, conditionValue);

  useEffect(() => {
    setQuery(q);
    setBrandValue(brand);
    setConditionValue(condition);
  }, [q, brand, condition]);

  useEffect(() => {
    if (ready && query.trim() && interactive.current) {
      setActive(0);
      setOpen(true);
    }
  }, [ready, hits, query]);

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

  const showList = open && ready && Boolean(query.trim());

  return (
    <form
      ref={root}
      action="/inventory"
      className={cn(
        "relative border border-chrome/80 bg-white p-3 text-foreground md:p-4",
        className,
      )}
    >
      <div className="grid gap-3 md:grid-cols-4">
        <select
          name="brand"
          value={brandValue}
          onChange={(event) => setBrandValue(event.target.value)}
          className="h-11 border border-input bg-white px-3 text-sm text-foreground"
        >
          <option value="">{t.anyBrand}</option>
          <option value="ford">Ford</option>
          <option value="lincoln">Lincoln</option>
        </select>
        <select
          name="condition"
          value={conditionValue}
          onChange={(event) => setConditionValue(event.target.value)}
          className="h-11 border border-input bg-white px-3 text-sm text-foreground"
        >
          <option value="">{t.newAndUsed}</option>
          <option value="new">{t.new}</option>
          <option value="used">{t.used}</option>
          <option value="cpo">{t.certified}</option>
        </select>
        <input
          name="q"
          type="search"
          autoComplete="off"
          value={query}
          onChange={(event) => {
            interactive.current = true;
            setQuery(event.target.value);
          }}
          onFocus={() => {
            interactive.current = true;
            if (ready && query.trim()) setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
            if (event.key === "Enter" && showList && hits[active]) {
              event.preventDefault();
              go(hits[active].href);
              return;
            }
            if (!showList || !hits.length) return;
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActive((index) => (index + 1) % hits.length);
            }
            if (event.key === "ArrowUp") {
              event.preventDefault();
              setActive((index) => (index - 1 + hits.length) % hits.length);
            }
          }}
          placeholder={t.modelStockVin}
          className="h-11 border border-input bg-white px-3 text-sm text-foreground placeholder:text-muted-foreground"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-label={t.modelStockVin}
        />
        <button type="submit" className="h-11 bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-[#002654]">
          {submitLabel ?? t.searchInventoryCta}
        </button>
      </div>
      {showList ? (
        <InventoryHitsList
          id={listId}
          hits={hits}
          active={active}
          emptyLabel={t.searchNoResults}
          onActive={setActive}
          onNavigate={() => setOpen(false)}
          className="absolute top-full right-3 left-3 z-30 mt-1 max-h-72 overflow-y-auto md:right-4 md:left-4"
        />
      ) : null}
    </form>
  );
}
