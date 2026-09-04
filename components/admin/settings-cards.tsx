"use client";

import { useEffect, useState, useTransition, type ComponentType, type ReactNode } from "react";
import { toast } from "sonner";
import { Download, Plug, Share2, TriangleAlert, Upload } from "lucide-react";
import { AdminPanel } from "@/components/admin/admin-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  addConnector,
  addSocial,
  deleteConnector,
  deleteSocial,
  importCsvBackup,
  probeConnector,
  resetPlatform,
} from "@/app/admin/(staff)/settings/actions";
import type { ApiConnector, SiteSocial } from "@/lib/admin/settings";
import { titleCase } from "@/lib/format";
import { cn } from "@/lib/utils";

type ProbeStatus = "ok" | "warn" | "down";
type Probe = { ok: boolean; message: string; status: ProbeStatus };
type Light = "unknown" | "checking" | ProbeStatus;

const KIND_TONE: Record<ApiConnector["kind"], string> = {
  inventory: "bg-[#dbe7f5] text-ford",
  webhook: "bg-[#d7eef8] text-[#0f5f8a]",
  maps: "bg-[#f7edd4] text-[#8a6a22]",
  custom: "bg-[#eef1f4] text-muted-foreground",
};

function lightCopy(status: Light) {
  if (status === "checking") return "Checking";
  if (status === "ok") return "Live";
  if (status === "warn") return "Check";
  if (status === "down") return "Down";
  return "Idle";
}

function TrafficLight({ status, label }: { status: Light; label: string }) {
  const lit = status === "ok" || status === "down" ? status : "warn";
  return (
    <span
      className="inline-flex shrink-0 flex-col items-center gap-[3px] bg-[#14181d] px-[5px] py-1.5"
      role="img"
      aria-label={label}
      title={label}
    >
      <Lamp color="down" on={lit === "down"} />
      <Lamp color="warn" on={lit === "warn"} pulse={status === "checking"} />
      <Lamp color="ok" on={lit === "ok"} />
    </span>
  );
}

function Lamp({ color, on, pulse }: { color: ProbeStatus; on: boolean; pulse?: boolean }) {
  return (
    <span
      className={cn(
        "size-2.5 rounded-full transition-all",
        color === "down" && (on ? "bg-[#ff4d4d] shadow-[0_0_8px_#ff4d4d]" : "bg-[#3a1518]"),
        color === "warn" && (on ? "bg-[#f5c400] shadow-[0_0_8px_#f5c400]" : "bg-[#3a3210]"),
        color === "ok" && (on ? "bg-[#22c55e] shadow-[0_0_8px_#22c55e]" : "bg-[#14301c]"),
        pulse && on && "animate-pulse",
      )}
    />
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={cn("grid gap-1", className)}>
      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function SectionHead({
  icon: Icon,
  eyebrow,
  title,
  description,
  action,
}: {
  icon: ComponentType<{ className?: string }>;
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-chrome px-5 py-4">
      <span className="flex size-9 shrink-0 items-center justify-center bg-ford text-white">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        {eyebrow ? <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{eyebrow}</p> : null}
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}

const fieldClass = "h-10 rounded-none border-input bg-white";

export function ApiConnectorsCard({ connectors }: { connectors: ApiConnector[] }) {
  const [pending, startTransition] = useTransition();
  const [checking, setChecking] = useState<Record<string, boolean>>({});
  const [probes, setProbes] = useState<Record<string, Probe>>({});
  const connectorKey = connectors.map((connector) => connector.id).join(",");

  function lightFor(id: string, hasEndpoint: boolean): Light {
    if (checking[id]) return "checking";
    if (probes[id]) return probes[id]!.status;
    if (!hasEndpoint) return "warn";
    return "unknown";
  }

  function runProbe(id: string) {
    const data = new FormData();
    data.set("id", id);
    setChecking((current) => ({ ...current, [id]: true }));
    startTransition(async () => {
      const result = await probeConnector(data);
      setProbes((current) => ({ ...current, [id]: result }));
      setChecking((current) => ({ ...current, [id]: false }));
    });
  }

  useEffect(() => {
    let cancelled = false;
    setChecking(Object.fromEntries(connectors.map((connector) => [connector.id, true])));
    void Promise.all(
      connectors.map(async (connector) => {
        const data = new FormData();
        data.set("id", connector.id);
        const result = await probeConnector(data);
        if (cancelled) return;
        setProbes((current) => ({ ...current, [connector.id]: result }));
        setChecking((current) => ({ ...current, [connector.id]: false }));
      }),
    );
    return () => {
      cancelled = true;
    };
  }, [connectorKey]);

  const summary = connectors.reduce(
    (counts, connector) => {
      const light = lightFor(connector.id, Boolean(connector.endpoint));
      if (light === "ok") counts.ok += 1;
      else if (light === "down") counts.down += 1;
      else counts.warn += 1;
      return counts;
    },
    { ok: 0, warn: 0, down: 0 },
  );

  return (
    <AdminPanel>
      <SectionHead
        icon={Plug}
        eyebrow="Integrations"
        title="API connectors"
        description="Inventory feeds, webhooks, and other endpoints the desk can call."
      />
      <div className="grid grid-cols-3 gap-px border-b border-chrome bg-chrome">
        <StatusStat label="Live" value={summary.ok} tone="ok" />
        <StatusStat label="Check" value={summary.warn} tone="warn" />
        <StatusStat label="Down" value={summary.down} tone="down" />
      </div>
      <ul>
        {connectors.map((connector, index) => {
          const status = lightFor(connector.id, Boolean(connector.endpoint));
          const probe = probes[connector.id];
          return (
            <li key={connector.id} className={cn("flex items-start gap-3 px-5 py-4", index > 0 && "border-t border-chrome/80")}>
              <TrafficLight status={status} label={`${connector.name}: ${lightCopy(status)}`} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold">{connector.name}</p>
                  <span className={cn("px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide", KIND_TONE[connector.kind])}>
                    {titleCase(connector.kind)}
                  </span>
                  {connector.apiKey ? (
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Key saved</span>
                  ) : null}
                </div>
                {connector.endpoint ? (
                  <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">{connector.endpoint}</p>
                ) : (
                  <p className="mt-1 text-[11px] text-amber-700">No endpoint yet</p>
                )}
                <p
                  className={cn(
                    "mt-1.5 text-[11px] font-medium",
                    status === "ok" && "text-emerald-700",
                    (status === "warn" || status === "checking" || status === "unknown") && "text-amber-800",
                    status === "down" && "text-red-700",
                  )}
                >
                  {probe?.message ?? lightCopy(status)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button type="button" variant="outline" size="sm" disabled={pending || status === "checking"} onClick={() => runProbe(connector.id)}>
                  {status === "checking" ? "Checking…" : "Test"}
                </Button>
                <form action={deleteConnector}>
                  <input type="hidden" name="id" value={connector.id} />
                  <Button type="submit" variant="ghost" size="sm">
                    Delete
                  </Button>
                </form>
              </div>
            </li>
          );
        })}
        {connectors.length === 0 ? <li className="px-5 py-8 text-center text-sm text-muted-foreground">No connectors yet.</li> : null}
      </ul>
      <form action={addConnector} className="grid gap-3 border-t border-chrome bg-[#f7f8fa] px-5 py-4 sm:grid-cols-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:col-span-2">Add connector</p>
        <Field label="Name">
          <Input name="name" placeholder="Ford inventory feed" required className={fieldClass} />
        </Field>
        <Field label="Type">
          <select name="kind" className={cn(fieldClass, "w-full px-2.5 text-sm")}>
            <option value="inventory">Inventory</option>
            <option value="webhook">Webhook</option>
            <option value="maps">Maps</option>
            <option value="custom">Custom</option>
          </select>
        </Field>
        <Field label="Endpoint" className="sm:col-span-2">
          <Input name="endpoint" placeholder="https://" className={fieldClass} />
        </Field>
        <Field label="API key" className="sm:col-span-2">
          <Input name="apiKey" type="password" placeholder="Optional" autoComplete="off" className={fieldClass} />
        </Field>
        <div className="sm:col-span-2">
          <Button type="submit">Add connector</Button>
        </div>
      </form>
    </AdminPanel>
  );
}

function StatusStat({ label, value, tone }: { label: string; value: number; tone: ProbeStatus }) {
  return (
    <div className="bg-white px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 text-2xl font-semibold tabular-nums leading-none",
          tone === "ok" && "text-emerald-700",
          tone === "warn" && "text-amber-700",
          tone === "down" && "text-red-700",
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function SocialsSettingsCard({ socials }: { socials: SiteSocial[] }) {
  return (
    <AdminPanel className="flex h-full flex-col">
      <SectionHead icon={Share2} eyebrow="Website" title="Social links" description="Footer, contact, and the schedule overlay." />
      <ul className="flex-1">
        {socials.map((social, index) => (
          <li key={social.id} className={cn("flex items-center gap-3 px-5 py-3", index > 0 && "border-t border-chrome/80")}>
            <span className="flex size-9 shrink-0 items-center justify-center bg-[#eef1f4] text-[11px] font-semibold uppercase text-ford">
              {social.name.slice(0, 1)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">{social.name}</span>
              <a href={social.href} target="_blank" rel="noreferrer" className="block truncate text-[11px] text-ford hover:underline">
                {social.href.replace(/^https?:\/\//, "")}
              </a>
            </span>
            <form action={deleteSocial}>
              <input type="hidden" name="id" value={social.id} />
              <Button type="submit" variant="ghost" size="sm">
                Remove
              </Button>
            </form>
          </li>
        ))}
        {socials.length === 0 ? <li className="px-5 py-8 text-center text-sm text-muted-foreground">No social links.</li> : null}
      </ul>
      <form action={addSocial} className="grid gap-3 border-t border-chrome bg-[#f7f8fa] px-5 py-4 sm:grid-cols-[7.5rem_1fr_auto]">
        <Field label="Name">
          <Input name="name" placeholder="Instagram" required className={fieldClass} />
        </Field>
        <Field label="URL">
          <Input name="href" type="url" placeholder="https://" required className={fieldClass} />
        </Field>
        <div className="flex items-end">
          <Button type="submit" className="w-full sm:w-auto">
            Add
          </Button>
        </div>
      </form>
    </AdminPanel>
  );
}

export function CsvBackupCard() {
  const [pending, startTransition] = useTransition();
  const tables = [
    ["all", "Full backup", "Every desk table in one file"],
    ["vehicles", "Vehicles", "Stock, prices, and status"],
    ["leads", "Leads", "Pipeline and sources"],
    ["customers", "Customers", "People and consent"],
    ["appointments", "Appointments", "Test drives and service"],
    ["tasks", "Tasks", "Follow-ups on the book"],
  ] as const;

  return (
    <AdminPanel>
      <SectionHead
        icon={Download}
        eyebrow="Backup"
        title="CSV backup"
        description="Download before a reset, or restore a Premier CSV. Import upserts by id and does not delete extra rows."
      />
      <div className="grid gap-px bg-chrome sm:grid-cols-2">
        {tables.map(([table, label, hint]) => (
          <a
            key={table}
            href={`/admin/settings/backup?table=${table}`}
            className="flex items-start gap-3 bg-white px-4 py-3.5 transition-colors hover:bg-[#eef4fb]"
          >
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center border border-chrome bg-[#f7f8fa] text-ford">
              <Download className="size-3.5" />
            </span>
            <span>
              <span className="block text-sm font-medium">{label}</span>
              <span className="mt-0.5 block text-[11px] text-muted-foreground">{hint}</span>
            </span>
          </a>
        ))}
      </div>
      <form
        className="grid gap-3 border-t border-chrome bg-[#f7f8fa] px-5 py-4"
        onSubmit={(event) => {
          event.preventDefault();
          const form = event.currentTarget;
          const data = new FormData(form);
          startTransition(async () => {
            const result = await importCsvBackup(data);
            if (!result.ok) {
              toast.error(result.message);
              return;
            }
            toast.success(result.message);
            form.reset();
          });
        }}
      >
        <div className="flex items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center border border-chrome bg-white text-ford">
            <Upload className="size-3.5" />
          </span>
          <div>
            <p className="text-sm font-medium">Import CSV</p>
            <p className="text-[11px] text-muted-foreground">Full backup or a single-table download.</p>
          </div>
        </div>
        <Field label="File">
          <Input name="file" type="file" accept=".csv,text/csv,text/plain" required className={cn(fieldClass, "pt-1.5")} />
        </Field>
        <Field label="Table">
          <select name="table" defaultValue="auto" className={cn(fieldClass, "w-full px-2.5 text-sm")}>
            <option value="auto">Auto — full backup file</option>
            <option value="vehicles">Vehicles</option>
            <option value="leads">Leads</option>
            <option value="customers">Customers</option>
            <option value="appointments">Appointments</option>
            <option value="tasks">Tasks</option>
          </select>
        </Field>
        <div>
          <Button type="submit" disabled={pending}>
            {pending ? "Importing…" : "Import CSV"}
          </Button>
        </div>
      </form>
    </AdminPanel>
  );
}

export function MasterResetCard() {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <>
      <AdminPanel className="overflow-hidden border-red-200">
        <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center bg-red-50 text-red-700">
              <TriangleAlert className="size-4" />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-red-700">Danger zone</p>
              <h2 className="text-sm font-semibold tracking-tight">Master reset</h2>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                Permanently delete vehicles, photos, leads, customers, appointments, and tasks. Staff accounts, social
                links, and API connectors stay. Download a CSV first.
              </p>
            </div>
          </div>
          <Button type="button" variant="destructive" className="shrink-0" onClick={() => setOpen(true)}>
            Reset desk
          </Button>
        </div>
      </AdminPanel>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setConfirmation("");
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset the entire desk?</DialogTitle>
            <DialogDescription>
              This cannot be undone. Download a CSV backup first. Type <span className="font-semibold text-foreground">RESET</span> to
              continue.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            placeholder="Type RESET"
            autoComplete="off"
            spellCheck={false}
            aria-label="Type RESET to confirm"
            className={fieldClass}
          />
          <DialogFooter>
            <Button type="button" variant="outline" disabled={pending} onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={pending || confirmation.trim() !== "RESET"}
              onClick={() => {
                const data = new FormData();
                data.set("confirmation", confirmation);
                startTransition(async () => {
                  const result = await resetPlatform(data);
                  if (!result.ok) {
                    toast.error(result.message);
                    return;
                  }
                  toast.success(result.message);
                  setOpen(false);
                  setConfirmation("");
                });
              }}
            >
              {pending ? "Resetting…" : "Reset desk"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
