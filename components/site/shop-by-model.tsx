"use client";

import { useState } from "react";
import Link from "next/link";
import { shopBodyTypes, shopModels, type BodyType } from "@/lib/shop-by-model";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/site/locale-provider";

export function ShopByModel() {
  const [body, setBody] = useState<BodyType | null>(null);
  const { t } = useLocale();

  return (
    <section className="border-b border-chrome bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight">{t.searchByModel}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {t.searchByModelSub}
          </p>
        </div>

        <div className="mt-6 flex w-full items-center justify-center gap-1">
          <button
            type="button"
            onClick={() => setBody(null)}
            className={cn(
              "rounded-full px-5 py-2.5 text-[15px] font-medium transition duration-200",
              body === null
                ? "bg-ford-bright text-white"
                : "bg-transparent text-neutral-700 hover:text-ford",
            )}
          >
            {t.all}
          </button>
          {shopBodyTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setBody(type)}
              className={cn(
                "rounded-full px-5 py-2.5 text-[15px] font-medium transition duration-200",
                body === type
                  ? "bg-ford-bright text-white"
                  : "bg-transparent text-neutral-700 hover:text-ford",
              )}
            >
              {t.bodyTypes[type]}
            </button>
          ))}
        </div>

        <div className="mt-6 flex justify-center gap-10 overflow-x-auto px-4 py-8">
          {shopModels.map((model) => {
            const selected = !body || model.body === body;
            return (
              <Link
                key={model.name}
                href={model.href}
                className={cn(
                  "relative w-[168px] shrink-0 text-center transition duration-300 ease-out",
                  "hover:z-10 hover:scale-[1.08]",
                  selected ? "opacity-100" : "opacity-35",
                )}
              >
                <div className="flex h-[112px] items-end justify-center overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={model.image}
                    alt={`${model.name} ${model.body}`}
                    className={cn(
                      "max-h-[96px] w-auto max-w-full object-contain object-bottom transition duration-300 ease-out",
                      selected && "max-h-[108px]",
                    )}
                  />
                </div>
                <p className="mt-3 text-sm font-semibold">{model.name}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{t.models[model.name]}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
