/** Paid social / search ads board. Stored in site_settings.ad_campaigns. */

export const AD_CAMPAIGNS_KEY = "ad_campaigns";
export const MAX_AD_CAMPAIGNS = 50;
export const MAX_CUSTOM_AD_WIDGETS = 8;

export const AD_CAMPAIGN_STATUSES = ["active", "paused", "ended"] as const;
export type AdCampaignStatus = (typeof AD_CAMPAIGN_STATUSES)[number];

export const AD_WIDGET_CATALOG = [
  {
    id: "google_ads",
    label: "Google Ads",
    hint: "Search and Performance Max",
    placeholder: "https://ads.google.com/aw/overview",
    docsUrl: "https://ads.google.com",
    internal: false,
  },
  {
    id: "meta_ads",
    label: "Meta Ads",
    hint: "Facebook and Instagram",
    placeholder: "https://adsmanager.facebook.com",
    docsUrl: "https://adsmanager.facebook.com",
    internal: false,
  },
  {
    id: "youtube_ads",
    label: "YouTube Ads",
    hint: "Video campaigns in Google Ads",
    placeholder: "https://ads.google.com/aw/overview",
    docsUrl: "https://ads.google.com",
    internal: false,
  },
  {
    id: "tiktok_ads",
    label: "TikTok Ads",
    hint: "TikTok Ads Manager",
    placeholder: "https://ads.tiktok.com",
    docsUrl: "https://ads.tiktok.com",
    internal: false,
  },
  {
    id: "linkedin_ads",
    label: "LinkedIn Ads",
    hint: "Campaign Manager",
    placeholder: "https://www.linkedin.com/campaignmanager",
    docsUrl: "https://www.linkedin.com/campaignmanager",
    internal: false,
  },
  {
    id: "x_ads",
    label: "X Ads",
    hint: "X (Twitter) Ads",
    placeholder: "https://ads.x.com",
    docsUrl: "https://ads.x.com",
    internal: false,
  },
  {
    id: "ga4",
    label: "Google Analytics",
    hint: "Acquisition and conversions",
    placeholder: "https://analytics.google.com",
    docsUrl: "https://analytics.google.com",
    internal: false,
  },
  {
    id: "pipeline",
    label: "Dealer pipeline",
    hint: "CRM inquiry-to-sold board",
    placeholder: "/admin/leads",
    docsUrl: "/admin/leads",
    internal: true,
  },
] as const;

export type AdCampaign = {
  id: string;
  name: string;
  channel: string;
  status: AdCampaignStatus;
  spend: number;
  revenue: number;
  impressions: number;
  clicks: number;
  conversions: number;
  utm: string;
  dashboardUrl: string;
  notes: string;
};

export type AdWidgetLink = {
  id: string;
  label: string;
  dashboardUrl: string;
  connected: boolean;
  notes: string;
  custom: boolean;
};

export type AdCampaignBoard = {
  campaigns: AdCampaign[];
  widgets: AdWidgetLink[];
};

export function emptyAdCampaignBoard(): AdCampaignBoard {
  return {
    campaigns: [],
    widgets: AD_WIDGET_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      dashboardUrl: item.internal ? item.docsUrl : "",
      connected: Boolean(item.internal),
      notes: "",
      custom: false,
    })),
  };
}

export function newAdCampaignId() {
  return `cmp_${crypto.randomUUID().slice(0, 10)}`;
}

export function newAdWidgetId() {
  return `adw_${crypto.randomUUID().slice(0, 8)}`;
}

export function emptyAdCampaign(channel = "google_ads"): AdCampaign {
  return {
    id: newAdCampaignId(),
    name: "",
    channel,
    status: "active",
    spend: 0,
    revenue: 0,
    impressions: 0,
    clicks: 0,
    conversions: 0,
    utm: "",
    dashboardUrl: "",
    notes: "",
  };
}

export function widgetLabel(channel: string, board?: AdCampaignBoard) {
  const fromBoard = board?.widgets.find((widget) => widget.id === channel);
  if (fromBoard?.label) return fromBoard.label;
  const catalog = AD_WIDGET_CATALOG.find((item) => item.id === channel);
  return catalog?.label ?? channel.replaceAll("_", " ") ?? "Other";
}

export function campaignRoas(campaign: Pick<AdCampaign, "spend" | "revenue">) {
  if (campaign.spend <= 0) return null;
  return campaign.revenue / campaign.spend;
}

export function campaignCtr(campaign: Pick<AdCampaign, "impressions" | "clicks">) {
  if (campaign.impressions <= 0) return null;
  return campaign.clicks / campaign.impressions;
}

export function campaignCpc(campaign: Pick<AdCampaign, "spend" | "clicks">) {
  if (campaign.clicks <= 0) return null;
  return campaign.spend / campaign.clicks;
}

export function campaignCpa(campaign: Pick<AdCampaign, "spend" | "conversions">) {
  if (campaign.conversions <= 0) return null;
  return campaign.spend / campaign.conversions;
}

export function summarizeAdPerformance(board: AdCampaignBoard, soldCount: number) {
  const spend = roundMoney(board.campaigns.reduce((sum, row) => sum + row.spend, 0));
  const attributed = roundMoney(board.campaigns.reduce((sum, row) => sum + row.revenue, 0));
  const clicks = board.campaigns.reduce((sum, row) => sum + row.clicks, 0);
  const impressions = board.campaigns.reduce((sum, row) => sum + row.impressions, 0);
  const conversions = board.campaigns.reduce((sum, row) => sum + row.conversions, 0);
  const cpaBasis = conversions > 0 ? conversions : soldCount;
  return {
    spend,
    attributed,
    soldCount,
    campaignRoas: spend > 0 ? attributed / spend : null,
    blendedCpa: spend > 0 && cpaBasis > 0 ? spend / cpaBasis : null,
    cpc: spend > 0 && clicks > 0 ? spend / clicks : null,
    ctr: impressions > 0 ? clicks / impressions : null,
    clicks,
    impressions,
    conversions,
    activeCampaigns: board.campaigns.filter((row) => row.status === "active").length,
    connectedWidgets: board.widgets.filter((widget) => widget.connected).length,
  };
}

export function formatRoas(value: number | null) {
  if (value == null || !Number.isFinite(value)) return "—";
  return `${value.toFixed(2)}x`;
}

export function formatPct(value: number | null) {
  if (value == null || !Number.isFinite(value)) return "—";
  return `${(value * 100).toFixed(1)}%`;
}

export function formatAdMoney(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export function normalizeDashboardUrl(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("/")) return trimmed.slice(0, 500);
  if (/^https?:\/\//i.test(trimmed)) return trimmed.slice(0, 500);
  return `https://${trimmed.replace(/^\/+/, "")}`.slice(0, 500);
}

export function parseAdCampaignBoard(input: unknown): AdCampaignBoard {
  const fallback = emptyAdCampaignBoard();
  if (!input || typeof input !== "object") return fallback;
  const record = input as Record<string, unknown>;
  const campaigns: AdCampaign[] = [];
  const seen = new Set<string>();
  if (Array.isArray(record.campaigns)) {
    for (const item of record.campaigns.slice(0, MAX_AD_CAMPAIGNS)) {
      const campaign = readCampaign(item);
      if (!campaign) continue;
      if (seen.has(campaign.id)) campaign.id = newAdCampaignId();
      seen.add(campaign.id);
      campaigns.push(campaign);
    }
  }
  const stored = new Map<string, AdWidgetLink>();
  if (Array.isArray(record.widgets)) {
    for (const item of record.widgets) {
      const widget = readWidget(item);
      if (widget) stored.set(widget.id, widget);
    }
  }
  const widgets: AdWidgetLink[] = AD_WIDGET_CATALOG.map((item) => {
    const saved = stored.get(item.id);
    stored.delete(item.id);
    if (!saved) {
      return {
        id: item.id,
        label: item.label,
        dashboardUrl: item.internal ? item.docsUrl : "",
        connected: Boolean(item.internal),
        notes: "",
        custom: false,
      };
    }
    return {
      ...saved,
      id: item.id,
      label: item.label,
      custom: false,
      dashboardUrl: item.internal ? item.docsUrl : saved.dashboardUrl,
      connected: item.internal ? true : saved.connected,
    };
  });
  let customCount = 0;
  for (const widget of stored.values()) {
    if (!widget.custom || customCount >= MAX_CUSTOM_AD_WIDGETS) continue;
    widgets.push(widget);
    customCount += 1;
  }
  return { campaigns, widgets };
}

function readCampaign(value: unknown): AdCampaign | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const id = typeof record.id === "string" && /^[a-zA-Z0-9_-]{1,40}$/.test(record.id) ? record.id : newAdCampaignId();
  const status = AD_CAMPAIGN_STATUSES.includes(record.status as AdCampaignStatus) ? (record.status as AdCampaignStatus) : "active";
  const name = typeof record.name === "string" ? record.name.trim().slice(0, 80) : "";
  if (!name) return null;
  return {
    id,
    name,
    channel: readId(record.channel, "google_ads"),
    status,
    spend: readMoney(record.spend),
    revenue: readMoney(record.revenue),
    impressions: readCount(record.impressions),
    clicks: readCount(record.clicks),
    conversions: readCount(record.conversions),
    utm: typeof record.utm === "string" ? record.utm.trim().slice(0, 80) : "",
    dashboardUrl: typeof record.dashboardUrl === "string" ? normalizeDashboardUrl(record.dashboardUrl) : "",
    notes: typeof record.notes === "string" ? record.notes.trim().slice(0, 280) : "",
  };
}

function readWidget(value: unknown): AdWidgetLink | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const custom = record.custom === true;
  const id = readId(record.id, custom ? newAdWidgetId() : "");
  if (!id) return null;
  const catalog = AD_WIDGET_CATALOG.find((item) => item.id === id);
  const label =
    typeof record.label === "string" && record.label.trim() ? record.label.trim().slice(0, 40) : (catalog?.label ?? "");
  if (!label) return null;
  return {
    id,
    label,
    dashboardUrl: typeof record.dashboardUrl === "string" ? normalizeDashboardUrl(record.dashboardUrl) : "",
    connected: record.connected === true,
    notes: typeof record.notes === "string" ? record.notes.trim().slice(0, 160) : "",
    custom,
  };
}

function readId(value: unknown, fallback: string) {
  if (typeof value === "string" && /^[a-zA-Z0-9_-]{1,40}$/.test(value)) return value;
  return fallback;
}

function readMoney(value: unknown) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return roundMoney(Math.min(n, 1_000_000_000));
}

function readCount(value: unknown) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(Math.round(n), 1_000_000_000_000);
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}
