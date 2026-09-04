"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useLocale } from "@/components/site/locale-provider";
import { InventoryHitsList, useInventoryHits } from "@/components/site/inventory-typeahead";

export function HeaderSearch() {
  const { t } = useLocale();
  const router = useRouter();
  const root = useRef<HTMLFormElement>(null);
  const listId = useId();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const { hits, ready } = useInventoryHits(q);

  useEffect(() => {
    if (ready && q.trim()) {
      setActive(0);
      setOpen(true);
    }
  }, [ready, hits, q]);

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

  const showList = open && ready && Boolean(q.trim());

  return (
    <form
      ref={root}
      action="/inventory"
      className="relative hidden min-w-0 flex-1 md:block"
      onSubmit={(event) => {
        if (showList && hits[active]) {
          event.preventDefault();
          go(hits[active].href);
        }
      }}
    >
      <label htmlFor="header-inventory-search" className="sr-only">
        {t.searchInventory}
      </label>
      <div className="mx-auto flex h-8 max-w-xl items-center border border-chrome bg-[#f7f8fa] focus-within:border-ford">
        <Search className="ml-2.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden />
        <input
          id="header-inventory-search"
          name="q"
          type="search"
          autoComplete="off"
          value={q}
          onChange={(event) => setQ(event.target.value)}
          onFocus={() => {
            if (ready && q.trim()) setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
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
          placeholder={t.searchPlaceholder}
          className="h-full min-w-0 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
        />
        <button
          type="submit"
          className="h-full bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-[#002654]"
        >
          {t.search}
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
          className="absolute top-[calc(100%+4px)] left-1/2 z-[60] w-full max-w-xl -translate-x-1/2"
        />
      ) : null}
    </form>
  );
}
