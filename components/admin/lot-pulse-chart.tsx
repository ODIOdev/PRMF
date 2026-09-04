"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PulsePoint } from "@/lib/admin/overview";

const WIDTH = 640;
const HEIGHT = 200;
const PAD = { top: 22, right: 36, bottom: 26, left: 34 };

export type LotPulseLive = {
  ford: number;
  lincoln: number;
  value: number;
};

function niceMax(value: number) {
  if (value <= 1) return 1;
  const exp = 10 ** Math.floor(Math.log10(value));
  const n = value / exp;
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return nice * exp;
}

function rollingAverage(points: PulsePoint[], window = 7) {
  return points.map((_, index) => {
    const slice = points.slice(Math.max(0, index - window + 1), index + 1);
    const total = slice.reduce((sum, point) => sum + point.ford + point.lincoln, 0);
    return total / slice.length;
  });
}

function weekday(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year!, month! - 1, day)).getUTCDay();
}

function daysSinceLabel(days: number) {
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

export function LotPulseChart({ points, live }: { points: PulsePoint[]; live: LotPulseLive }) {
  const [active, setActive] = useState<number | null>(null);

  const stats = useMemo(() => {
    const totals = points.map((point) => point.ford + point.lincoln);
    const ford = points.reduce((sum, point) => sum + point.ford, 0);
    const lincoln = points.reduce((sum, point) => sum + point.lincoln, 0);
    const value = points.reduce((sum, point) => sum + point.fordValue + point.lincolnValue, 0);
    const leads = points.reduce((sum, point) => sum + point.leads, 0);
    const peakIndex = totals.reduce((best, count, index) => (count > totals[best]! ? index : best), 0);
    const thisWeek = totals.slice(-7).reduce((sum, count) => sum + count, 0);
    const lastWeek = totals.slice(-14, -7).reduce((sum, count) => sum + count, 0);
    const lastIndex = [...totals].reverse().findIndex((count) => count > 0);
    const lastArrivalIndex = lastIndex >= 0 ? totals.length - 1 - lastIndex : -1;
    const quietStreak = lastArrivalIndex < 0 ? points.length : totals.length - 1 - lastArrivalIndex;
    const sorted = [...totals].sort((a, b) => a - b);
    const typical = sorted[Math.max(0, sorted.length - 2)] ?? 0;
    const peakCount = totals[peakIndex] ?? 0;
    const bulk = peakCount >= 12 && peakCount > typical * 3 && peakCount >= Math.max(...totals, 1) * 0.4;
    return {
      ford,
      lincoln,
      value,
      leads,
      total: ford + lincoln,
      avg: (ford + lincoln) / Math.max(points.length, 1),
      peak: points[peakIndex] ?? null,
      peakIndex,
      peakCount,
      thisWeek,
      lastWeek,
      activeDays: totals.filter((count) => count > 0).length,
      lastArrival: lastArrivalIndex >= 0 ? points[lastArrivalIndex]! : null,
      quietStreak,
      bulk,
      typicalMax: Math.max(typical, 1),
    };
  }, [points]);

  const averages = useMemo(() => rollingAverage(points), [points]);
  const cumulative = useMemo(() => {
    let running = 0;
    return points.map((point) => {
      running += point.ford + point.lincoln;
      return running;
    });
  }, [points]);

  const dailyScale = niceMax(stats.bulk ? Math.max(stats.typicalMax, 4) : Math.max(stats.peakCount, ...averages, 1));
  const cumScale = niceMax(Math.max(stats.total, 1));
  const innerW = WIDTH - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const slot = points.length ? innerW / points.length : innerW;
  const barW = Math.max(3, slot * 0.7);
  const xBar = (index: number) => PAD.left + index * slot + (slot - barW) / 2;
  const xMid = (index: number) => PAD.left + index * slot + slot / 2;
  const yDaily = (value: number) => PAD.top + innerH - (Math.min(value, dailyScale) / dailyScale) * innerH;
  const yCum = (value: number) => PAD.top + innerH - (value / cumScale) * innerH;
  const ticks = [0, Math.round(dailyScale / 2), dailyScale].filter((tick, index, all) => all.indexOf(tick) === index);
  const hover = active != null ? points[active] : null;
  const hoverTotal = hover ? hover.ford + hover.lincoln : 0;
  const avgPath = averages
    .map((value, index) => `${index === 0 ? "M" : "L"} ${xMid(index).toFixed(1)} ${yDaily(value).toFixed(1)}`)
    .join(" ");
  const cumPath = cumulative
    .map((value, index) => `${index === 0 ? "M" : "L"} ${xMid(index).toFixed(1)} ${yCum(value).toFixed(1)}`)
    .join(" ");
  const cumArea = `${cumPath} L ${xMid(points.length - 1).toFixed(1)} ${yCum(0).toFixed(1)} L ${xMid(0).toFixed(1)} ${yCum(0).toFixed(1)} Z`;

  return (
    <div className="px-3 py-3">
      <div className="mb-3 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        <StatChip label="Posted · 30d" value={String(stats.total)} hint={`${stats.activeDays} active days`} />
        <StatChip
          label="Last arrival"
          value={stats.lastArrival ? stats.lastArrival.label : "—"}
          hint={stats.lastArrival ? daysSinceLabel(stats.quietStreak) : "No posts in window"}
        />
        <StatChip label="Quiet streak" value={stats.quietStreak === 0 ? "0d" : `${stats.quietStreak}d`} hint={stats.thisWeek > 0 ? `${stats.thisWeek} this week` : "No adds this week"} />
        <StatChip label="Value posted" value={stats.value > 0 ? formatUsd(stats.value) : "—"} hint={`${live.ford + live.lincoln} live now`} />
      </div>

      <div className="grid gap-3 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-8">
          <div className="mb-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 bg-ford" /> Ford
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 bg-lincoln-gold" /> Lincoln
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-px w-3 bg-ford-bright" /> 7-day avg
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-px w-3 border-t border-dashed border-ford/50" /> Running total
            </span>
          </div>
          {stats.total === 0 ? (
            <p className="flex h-[200px] items-center justify-center border border-dashed border-chrome text-sm text-muted-foreground">
              No units added in the last 30 days.
            </p>
          ) : (
            <div className="relative">
              <svg
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                className="h-[200px] w-full"
                role="img"
                aria-label="Units added by day over the last 30 days, Ford stacked with Lincoln, seven-day average, and running total."
                onPointerLeave={() => setActive(null)}
                onPointerMove={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect();
                  const svgX = ((event.clientX - rect.left) / rect.width) * WIDTH;
                  const index = Math.min(points.length - 1, Math.max(0, Math.floor((svgX - PAD.left) / slot)));
                  setActive(index);
                }}
              >
                {points.map((point, index) =>
                  weekday(point.date) === 0 || weekday(point.date) === 6 ? (
                    <rect
                      key={`${point.date}-wk`}
                      x={PAD.left + index * slot}
                      y={PAD.top}
                      width={slot}
                      height={innerH}
                      fill="#f4f6f8"
                    />
                  ) : null,
                )}
                {ticks.map((tick) => (
                  <g key={tick}>
                    <line x1={PAD.left} x2={WIDTH - PAD.right} y1={yDaily(tick)} y2={yDaily(tick)} stroke="#eef1f4" />
                    <text x={PAD.left - 6} y={yDaily(tick) + 3} textAnchor="end" fill="#5b6570" fontSize="10">
                      {tick}
                    </text>
                  </g>
                ))}
                <path d={cumArea} fill="#003478" fillOpacity="0.06" />
                <path d={cumPath} fill="none" stroke="#003478" strokeOpacity="0.35" strokeWidth="1.25" strokeDasharray="3 3" />
                {points.map((point, index) => {
                  const daily = point.ford + point.lincoln;
                  const capped = daily > dailyScale;
                  const fordShow = capped ? (point.ford / daily) * dailyScale : point.ford;
                  const lincolnShow = capped ? (point.lincoln / daily) * dailyScale : point.lincoln;
                  const fordH = fordShow > 0 ? Math.max(3, (fordShow / dailyScale) * innerH) : 0;
                  const lincolnH = lincolnShow > 0 ? Math.max(3, (lincolnShow / dailyScale) * innerH) : 0;
                  const lincolnY = yDaily(fordShow + lincolnShow);
                  const fordY = yDaily(fordShow);
                  const dimmed = active != null && active !== index;
                  return (
                    <g key={point.date} opacity={dimmed ? 0.35 : 1}>
                      {point.ford > 0 ? <rect x={xBar(index)} y={fordY} width={barW} height={fordH} fill="#003478" /> : null}
                      {point.lincoln > 0 ? (
                        <rect x={xBar(index)} y={lincolnY} width={barW} height={lincolnH} fill="var(--lincoln-gold)" />
                      ) : null}
                      {capped ? (
                        <text x={xMid(index)} y={PAD.top - 6} textAnchor="middle" fill="#003478" fontSize="9" fontWeight="600">
                          {daily}
                        </text>
                      ) : null}
                      {point.leads > 0 && daily === 0 ? (
                        <circle cx={xMid(index)} cy={PAD.top + innerH - 4} r="2" fill="#1b86c8" />
                      ) : null}
                    </g>
                  );
                })}
                <path d={avgPath} fill="none" stroke="#1b86c8" strokeWidth="1.75" />
                {active != null ? (
                  <line
                    x1={xMid(active)}
                    x2={xMid(active)}
                    y1={PAD.top}
                    y2={PAD.top + innerH}
                    stroke="#003478"
                    strokeOpacity="0.25"
                  />
                ) : null}
                <text x={WIDTH - PAD.right + 6} y={yCum(cumScale) + 3} fill="#8a93a0" fontSize="9">
                  {cumScale}
                </text>
                <text x={WIDTH - PAD.right + 6} y={yCum(0) + 3} fill="#8a93a0" fontSize="9">
                  0
                </text>
                {[0, Math.floor((points.length - 1) / 2), points.length - 1].map((index) => {
                  const point = points[index];
                  if (!point) return null;
                  return (
                    <text key={`${point.date}-label`} x={xMid(index)} y={HEIGHT - 6} textAnchor="middle" fill="#5b6570" fontSize="10">
                      {point.label}
                    </text>
                  );
                })}
              </svg>
              {hover ? (
                <div
                  className={cn(
                    "pointer-events-none absolute top-1 min-w-[11.5rem] border border-chrome bg-white px-2.5 py-2 shadow-sm",
                    active != null && active > points.length * 0.55 ? "left-1" : "right-8",
                  )}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{hover.label}</p>
                  <p className="mt-0.5 text-sm font-semibold tabular-nums">{hoverTotal} units posted</p>
                  <p className="text-[11px] text-muted-foreground">
                    {hover.ford} Ford · {hover.lincoln} Lincoln
                  </p>
                  {hover.fordValue + hover.lincolnValue > 0 ? (
                    <p className="text-[11px] tabular-nums text-muted-foreground">{formatUsd(hover.fordValue + hover.lincolnValue)} added</p>
                  ) : null}
                  {hover.leads > 0 ? <p className="text-[11px] text-muted-foreground">{hover.leads} leads that day</p> : null}
                  {active != null ? (
                    <p className="text-[11px] tabular-nums text-muted-foreground">{cumulative[active]} running total</p>
                  ) : null}
                </div>
              ) : null}
            </div>
          )}
          {stats.bulk && stats.peak ? (
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              {stats.peakCount} units posted {stats.peak.label} — daily scale is typical days so smaller arrivals stay visible.
            </p>
          ) : null}
        </div>

        <aside className="grid grid-cols-2 gap-2 lg:col-span-4 lg:grid-cols-1">
          <Fact
            label="Live lot"
            value={`${live.ford + live.lincoln}`}
            detail={`${live.ford} Ford · ${live.lincoln} Lincoln · ${formatUsd(live.value)}`}
            href="/admin/inventory"
          />
          <Fact
            label="Busiest day"
            value={stats.peak && stats.peakCount > 0 ? stats.peak.label : "—"}
            detail={stats.peakCount > 0 ? `${stats.peakCount} units · ${formatUsd((stats.peak?.fordValue ?? 0) + (stats.peak?.lincolnValue ?? 0))}` : "No arrivals"}
          />
          <div className="border border-chrome bg-[#f7f8fa] px-2.5 py-2">
            <p className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Arrival mix</p>
            <div className="mt-2 flex h-2 overflow-hidden bg-white">
              <div className="h-full bg-ford" style={{ width: `${stats.total ? (stats.ford / stats.total) * 100 : 0}%` }} />
              <div className="h-full bg-lincoln-gold" style={{ width: `${stats.total ? (stats.lincoln / stats.total) * 100 : 0}%` }} />
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              {stats.ford} Ford · {stats.lincoln} Lincoln
            </p>
          </div>
          <Fact
            label="Leads · 30d"
            value={String(stats.leads)}
            detail={stats.leads > 0 ? "Web inquiries in this window" : "No web leads in this window"}
            href="/admin/inbox"
          />
        </aside>
      </div>
    </div>
  );
}

function StatChip({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="border border-chrome bg-[#f7f8fa] px-2 py-1.5">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold tabular-nums leading-none">{value}</p>
      {hint ? <p className="mt-0.5 text-[10px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function Fact({
  label,
  value,
  detail,
  href,
}: {
  label: string;
  value: string;
  detail: string;
  href?: string;
}) {
  const body = (
    <>
      <p className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums leading-none">{value}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{detail}</p>
    </>
  );
  if (!href) return <div className="border border-chrome bg-[#f7f8fa] px-2.5 py-2">{body}</div>;
  return (
    <Link href={href} className="block border border-chrome bg-[#f7f8fa] px-2.5 py-2 hover:border-ford/40 hover:bg-white">
      {body}
    </Link>
  );
}
