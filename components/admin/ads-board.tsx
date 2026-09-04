"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { saveAdCampaignBoard } from "@/app/admin/(staff)/analytics/actions";
import { AdminPanel } from "@/components/admin/admin-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AD_CAMPAIGN_STATUSES,
  AD_WIDGET_CATALOG,
  MAX_AD_CAMPAIGNS,
  MAX_CUSTOM_AD_WIDGETS,
  campaignCpa,
  campaignCpc,
  campaignCtr,
  campaignRoas,
  emptyAdCampaign,
  formatAdMoney,
  formatPct,
  formatRoas,
  newAdWidgetId,
  summarizeAdPerformance,
  widgetLabel,
  type AdCampaign,
  type AdCampaignBoard,
  type AdCampaignStatus,
} from "@/lib/admin/ad-campaigns";
import { cn } from "@/lib/utils";

const fieldClass = "h-10 rounded-none";
const STATUS_LABEL: Record<AdCampaignStatus, string> = {
  active: "Active",
  paused: "Paused",
  ended: "Ended",
};

function snapshot(board: AdCampaignBoard) {
  return JSON.stringify(board);
}

export function AdsCampaignBoard({ board: initial, soldCount }: { board: AdCampaignBoard; soldCount: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [board, setBoard] = useState(initial);
  const saved = snapshot(initial);

  useEffect(() => {
    setBoard(JSON.parse(saved) as AdCampaignBoard);
  }, [saved]);

  const performance = useMemo(() => summarizeAdPerformance(board, soldCount), [board, soldCount]);
  const chartMax = Math.max(...board.campaigns.flatMap((row) => [row.spend, row.revenue]), 1);

  const [campaignOpen, setCampaignOpen] = useState(false);
  const [draft, setDraft] = useState<AdCampaign>(emptyAdCampaign());
  const [connectId, setConnectId] = useState<string | null>(null);
  const [connectUrl, setConnectUrl] = useState("");
  const [customOpen, setCustomOpen] = useState(false);
  const [customLabel, setCustomLabel] = useState("");
  const [customUrl, setCustomUrl] = useState("");

  function persist(next: AdCampaignBoard, message?: string) {
    setBoard(next);
    startTransition(async () => {
      const result = await saveAdCampaignBoard(next);
      if (!result.ok) {
        toast.error(result.message);
        setBoard(JSON.parse(saved) as AdCampaignBoard);
        return;
      }
      toast.success(message ?? result.message);
      router.refresh();
    });
  }

  function saveDraft() {
    const name = draft.name.trim();
    if (!name) {
      toast.error("Name the campaign.");
      return;
    }
    if (!board.campaigns.some((row) => row.id === draft.id) && board.campaigns.length >= MAX_AD_CAMPAIGNS) {
      toast.error(`Cap is ${MAX_AD_CAMPAIGNS} campaigns.`);
      return;
    }
    const nextCampaign = { ...draft, name };
    const campaigns = board.campaigns.some((row) => row.id === draft.id)
      ? board.campaigns.map((row) => (row.id === draft.id ? nextCampaign : row))
      : [nextCampaign, ...board.campaigns];
    setCampaignOpen(false);
    persist({ ...board, campaigns }, "Campaign saved.");
  }

  const connecting = board.widgets.find((widget) => widget.id === connectId);
  const customCount = board.widgets.filter((widget) => widget.custom).length;

  return (
    <AdminPanel>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-chrome px-4 py-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Paid media</p>
          <h2 className="text-sm font-semibold tracking-tight">Campaigns and social ads</h2>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Log spend against attributed deals. Connect Ads Manager and Analytics dashboards — URLs only, no API keys.
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setCustomOpen(true)} disabled={pending}>
            <Plus className="size-3.5" />
            Portal
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              setDraft(emptyAdCampaign(board.widgets.find((widget) => widget.connected)?.id ?? "google_ads"));
              setCampaignOpen(true);
            }}
            disabled={pending}
          >
            <Plus className="size-3.5" />
            Campaign
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px border-b border-chrome bg-chrome sm:grid-cols-3 lg:grid-cols-6">
        <RoasStat label="Ad spend" value={formatAdMoney(performance.spend)} hint={`${performance.activeCampaigns} active`} />
        <RoasStat label="Attributed" value={formatAdMoney(performance.attributed)} hint="Logged revenue" />
        <RoasStat label="ROAS" value={formatRoas(performance.campaignRoas)} hint="Attributed ÷ spend" accent />
        <RoasStat label="CPA" value={performance.blendedCpa != null ? formatAdMoney(performance.blendedCpa) : "—"} hint={performance.conversions > 0 ? "Spend ÷ conversions" : "Spend ÷ sold"} />
        <RoasStat label="CTR" value={formatPct(performance.ctr)} hint={performance.cpc != null ? `CPC ${formatAdMoney(performance.cpc)}` : "Clicks ÷ impressions"} />
        <RoasStat label="Portals" value={String(performance.connectedWidgets)} hint="Connected widgets" />
      </div>

      {board.campaigns.length > 0 ? (
        <div className="border-b border-chrome px-4 py-4">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Spend vs attributed</p>
          <ul className="space-y-2.5">
            {board.campaigns.map((campaign) => (
              <li key={campaign.id}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="truncate font-medium">{campaign.name}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {formatAdMoney(campaign.spend)} / {formatAdMoney(campaign.revenue)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <div className="h-2 bg-ford/15">
                    <div className="h-full bg-ford" style={{ width: `${Math.max(4, (campaign.spend / chartMax) * 100)}%` }} />
                  </div>
                  <div className="h-2 bg-lincoln-gold/25">
                    <div className="h-full bg-lincoln-gold" style={{ width: `${Math.max(4, (campaign.revenue / chartMax) * 100)}%` }} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[10px] text-muted-foreground">Navy spend · gold attributed</p>
        </div>
      ) : null}

      <div className="grid lg:grid-cols-5">
        <div className="border-b border-chrome lg:col-span-3 lg:border-r lg:border-b-0">
          <div className="flex items-center justify-between gap-2 px-4 py-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide">Campaigns</h3>
            <p className="text-[11px] tabular-nums text-muted-foreground">
              {board.campaigns.length} / {MAX_AD_CAMPAIGNS}
            </p>
          </div>
          {board.campaigns.length === 0 ? (
            <div className="px-4 pb-5 text-sm text-muted-foreground">
              <p>No campaigns yet. Log a Google or Meta flight to see ROAS against sold deals.</p>
              <Button
                type="button"
                size="sm"
                className="mt-3"
                onClick={() => {
                  setDraft(emptyAdCampaign());
                  setCampaignOpen(true);
                }}
              >
                Add campaign
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-chrome/70">
              {board.campaigns.map((campaign) => {
                const roas = campaignRoas(campaign);
                return (
                  <li key={campaign.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold">{campaign.name}</p>
                        <span
                          className={cn(
                            "px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                            campaign.status === "active"
                              ? "bg-emerald-100 text-emerald-900"
                              : campaign.status === "paused"
                                ? "bg-amber-100 text-amber-950"
                                : "bg-[#eef1f4] text-muted-foreground",
                          )}
                        >
                          {STATUS_LABEL[campaign.status]}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {widgetLabel(campaign.channel, board)}
                        {campaign.utm ? ` · utm ${campaign.utm}` : ""}
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-right sm:min-w-[15rem]">
                      <Metric label="Spend" value={formatAdMoney(campaign.spend)} />
                      <Metric label="Rev" value={formatAdMoney(campaign.revenue)} />
                      <Metric label="ROAS" value={formatRoas(roas)} />
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => {
                          setDraft({ ...campaign });
                          setCampaignOpen(true);
                        }}
                        aria-label={`Edit ${campaign.name}`}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-red-700"
                        onClick={() =>
                          persist(
                            { ...board, campaigns: board.campaigns.filter((row) => row.id !== campaign.id) },
                            "Campaign removed.",
                          )
                        }
                        aria-label={`Remove ${campaign.name}`}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="flex items-center justify-between gap-2 px-4 py-3">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide">Ad portals</h3>
              <p className="text-[11px] text-muted-foreground">{performance.connectedWidgets} connected</p>
            </div>
          </div>
          <ul className="grid gap-2 px-4 pb-4">
            {board.widgets.map((widget) => {
              const catalog = AD_WIDGET_CATALOG.find((item) => item.id === widget.id);
              const href = widget.dashboardUrl || catalog?.docsUrl || "";
              const internal = href.startsWith("/");
              return (
                <li key={widget.id} className="border border-chrome px-3 py-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium">{widget.label}</p>
                        <span className={cn("size-1.5 shrink-0 rounded-full", widget.connected ? "bg-emerald-500" : "bg-zinc-300")} title={widget.connected ? "Connected" : "Not connected"} />
                      </div>
                      <p className="text-[11px] text-muted-foreground">{catalog?.hint ?? "Custom dashboard"}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {href ? (
                      internal ? (
                        <Link href={href} className="inline-flex items-center gap-1 border border-chrome px-2 py-1 text-[10px] font-semibold uppercase tracking-wide hover:bg-[#f7f8fa]">
                          Open <ExternalLink className="size-3" />
                        </Link>
                      ) : (
                        <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 border border-chrome px-2 py-1 text-[10px] font-semibold uppercase tracking-wide hover:bg-[#f7f8fa]">
                          Open <ExternalLink className="size-3" />
                        </a>
                      )
                    ) : null}
                    {catalog?.internal ? null : (
                      <button
                        type="button"
                        onClick={() => {
                          setConnectId(widget.id);
                          setConnectUrl(widget.dashboardUrl);
                        }}
                        className="border border-chrome px-2 py-1 text-[10px] font-semibold uppercase tracking-wide hover:bg-[#f7f8fa]"
                      >
                        {widget.connected ? "Edit" : "Connect"}
                      </button>
                    )}
                    {widget.connected && !catalog?.internal ? (
                      <button
                        type="button"
                        onClick={() =>
                          persist(
                            {
                              ...board,
                              widgets: board.widgets.map((row) => (row.id === widget.id ? { ...row, connected: false } : row)),
                            },
                            "Widget disconnected.",
                          )
                        }
                        className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground"
                      >
                        Disconnect
                      </button>
                    ) : null}
                    {widget.custom ? (
                      <button
                        type="button"
                        onClick={() => persist({ ...board, widgets: board.widgets.filter((row) => row.id !== widget.id) }, "Portal removed.")}
                        className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-red-700"
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <Dialog open={campaignOpen} onOpenChange={setCampaignOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{board.campaigns.some((row) => row.id === draft.id) ? "Edit campaign" : "New campaign"}</DialogTitle>
            <DialogDescription>Log spend and attributed revenue. Link the ads manager if you have one.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <Field label="Campaign name">
              <Input className={fieldClass} value={draft.name} onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))} placeholder="Spring Ford search" />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Channel">
                <select
                  className={cn(fieldClass, "w-full border border-input bg-white px-2.5 text-sm")}
                  value={draft.channel}
                  onChange={(event) => setDraft((prev) => ({ ...prev, channel: event.target.value }))}
                >
                  {board.widgets.map((widget) => (
                    <option key={widget.id} value={widget.id}>
                      {widget.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Status">
                <select
                  className={cn(fieldClass, "w-full border border-input bg-white px-2.5 text-sm")}
                  value={draft.status}
                  onChange={(event) => setDraft((prev) => ({ ...prev, status: event.target.value as AdCampaignStatus }))}
                >
                  {AD_CAMPAIGN_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABEL[status]}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Spend">
                <Input className={fieldClass} type="number" min={0} value={String(draft.spend)} onChange={(event) => setDraft((prev) => ({ ...prev, spend: Number(event.target.value) || 0 }))} />
              </Field>
              <Field label="Attributed revenue">
                <Input className={fieldClass} type="number" min={0} value={String(draft.revenue)} onChange={(event) => setDraft((prev) => ({ ...prev, revenue: Number(event.target.value) || 0 }))} />
              </Field>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Impressions">
                <Input className={fieldClass} type="number" min={0} value={String(draft.impressions)} onChange={(event) => setDraft((prev) => ({ ...prev, impressions: Number(event.target.value) || 0 }))} />
              </Field>
              <Field label="Clicks">
                <Input className={fieldClass} type="number" min={0} value={String(draft.clicks)} onChange={(event) => setDraft((prev) => ({ ...prev, clicks: Number(event.target.value) || 0 }))} />
              </Field>
              <Field label="Conversions">
                <Input className={fieldClass} type="number" min={0} value={String(draft.conversions)} onChange={(event) => setDraft((prev) => ({ ...prev, conversions: Number(event.target.value) || 0 }))} />
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="UTM campaign">
                <Input className={fieldClass} value={draft.utm} onChange={(event) => setDraft((prev) => ({ ...prev, utm: event.target.value }))} placeholder="spring_ford_search" />
              </Field>
              <Field label="Ads manager URL">
                <Input className={fieldClass} value={draft.dashboardUrl} onChange={(event) => setDraft((prev) => ({ ...prev, dashboardUrl: event.target.value }))} placeholder="https://" />
              </Field>
            </div>
            <Field label="Notes">
              <Textarea rows={2} className="rounded-none" value={draft.notes} onChange={(event) => setDraft((prev) => ({ ...prev, notes: event.target.value }))} />
            </Field>
            <p className="text-xs text-muted-foreground">
              ROAS {formatRoas(campaignRoas(draft))}
              {campaignCtr(draft) != null ? ` · CTR ${formatPct(campaignCtr(draft))}` : ""}
              {campaignCpc(draft) != null ? ` · CPC ${formatAdMoney(campaignCpc(draft)!)}` : ""}
              {campaignCpa(draft) != null ? ` · CPA ${formatAdMoney(campaignCpa(draft)!)}` : ""}
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCampaignOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveDraft} disabled={pending}>
              {pending ? "Saving…" : "Save campaign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(connectId)}
        onOpenChange={(open) => {
          if (!open) setConnectId(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{connecting ? `Connect ${connecting.label}` : "Connect portal"}</DialogTitle>
            <DialogDescription>Paste the ads manager URL. Secrets stay in that platform.</DialogDescription>
          </DialogHeader>
          <Input
            className={fieldClass}
            value={connectUrl}
            onChange={(event) => setConnectUrl(event.target.value)}
            placeholder={AD_WIDGET_CATALOG.find((item) => item.id === connectId)?.placeholder ?? "https://"}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setConnectId(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={pending}
              onClick={() => {
                if (!connectId) return;
                const url = connectUrl.trim();
                persist(
                  {
                    ...board,
                    widgets: board.widgets.map((widget) =>
                      widget.id === connectId ? { ...widget, dashboardUrl: url, connected: Boolean(url) } : widget,
                    ),
                  },
                  url ? "Portal connected." : "Portal disconnected.",
                );
                setConnectId(null);
              }}
            >
              {connectUrl.trim() ? "Connect" : "Disconnect"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={customOpen} onOpenChange={setCustomOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add ad portal</DialogTitle>
            <DialogDescription>Name another ads manager or reporting dashboard. URL only — no API keys.</DialogDescription>
          </DialogHeader>
          <Field label="Name">
            <Input className={fieldClass} value={customLabel} onChange={(event) => setCustomLabel(event.target.value)} placeholder="Microsoft Ads" />
          </Field>
          <Field label="Dashboard URL">
            <Input className={fieldClass} value={customUrl} onChange={(event) => setCustomUrl(event.target.value)} placeholder="https://" />
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCustomOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={pending}
              onClick={() => {
                const label = customLabel.trim();
                if (!label) {
                  toast.error("Name the portal.");
                  return;
                }
                if (customCount >= MAX_CUSTOM_AD_WIDGETS) {
                  toast.error(`Cap is ${MAX_CUSTOM_AD_WIDGETS} custom portals.`);
                  return;
                }
                const url = customUrl.trim();
                persist(
                  {
                    ...board,
                    widgets: [
                      ...board.widgets,
                      { id: newAdWidgetId(), label, dashboardUrl: url, connected: Boolean(url), notes: "", custom: true },
                    ],
                  },
                  "Portal added.",
                );
                setCustomOpen(false);
                setCustomLabel("");
                setCustomUrl("");
              }}
            >
              Add portal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPanel>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function RoasStat({ label, value, hint, accent }: { label: string; value: string; hint: string; accent?: boolean }) {
  return (
    <div className={cn("bg-white px-3 py-3", accent && "bg-[#fbf6e8]")}>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums leading-none">{value}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
    </div>
  );
}
