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
  const [dismissed, setDismissed] = useState(false);
  const [active, setActive] = useState(0);
  const [interactive, setInteractive] = useState(false);
  const [prevQ, setPrevQ] = useState(q);
  const [prevBrand, setPrevBrand] = useState(brand);
  const [prevCondition, setPrevCondition] = useState(condition);
  if (q !== prevQ || brand !== prevBrand || condition !== prevCondition) {
    setPrevQ(q);
    setPrevBrand(brand);
    setPrevCondition(condition);
    setQuery(q);
    setBrandValue(brand);
    setConditionValue(condition);
  }
  const { hits, ready } = useInventoryHits(query, brandValue, conditionValue);
  const [prevQuery, setPrevQuery] = useState(query);
  if (query !== prevQuery) {
    setPrevQuery(query);
    setActive(0);
  }
  const showList = !dismissed && interactive && ready && Boolean(query.trim());

  useEffect(() => {
    function onPointer(event: MouseEvent) {
      if (!root.current?.contains(event.target as Node)) setDismissed(true);
    }
    window.addEventListener("mousedown", onPointer);
    return () => window.removeEventListener("mousedown", onPointer);
  }, []);

  function go(href: string) {
    setDismissed(true);
    router.push(href);
  }

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
            setInteractive(true);
            setDismissed(false);
            setQuery(event.target.value);
          }}
          onFocus={() => {
            setInteractive(true);
            if (ready && query.trim()) setDismissed(false);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") setDismissed(true);
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
          onNavigate={() => setDismissed(true)}
          className="absolute top-full right-3 left-3 z-30 mt-1 max-h-72 overflow-y-auto md:right-4 md:left-4"
        />
      ) : null}
    </form>
  );
}
