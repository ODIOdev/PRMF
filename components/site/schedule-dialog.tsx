"use client";

import { useActionState, useMemo, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { submitServiceSchedule, type LeadState } from "@/app/actions/leads";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { dealership } from "@/lib/dealership";
import { formatPhoneHref } from "@/lib/format";
import type { VehicleBrand } from "@/lib/types";
import { compactHourDays, formatHourTime } from "@/lib/i18n";
import { SocialLinks } from "@/components/site/social-links";
import { useLocale } from "@/components/site/locale-provider";
import { cn } from "@/lib/utils";

const services = ["Oil change", "Brakes", "Tires", "Alignment", "Battery", "Inspection", "Something else"] as const;

const times = ["Morning", "Afternoon", "Evening"] as const;

const initial: LeadState = { ok: false };

const fieldClass = "h-10 rounded-sm bg-white";

const hideScroll =
  "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";

export function ScheduleDialog() {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setFormKey((key) => key + 1);
      }}
    >
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex h-8 items-center border border-chrome px-3 text-xs font-medium text-foreground hover:border-ford hover:text-ford"
        >
          {t.schedule}
        </button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        overlayClassName="z-[60] bg-black/40 backdrop-blur-[2px]"
        className="z-[60] w-[calc(100%-1.5rem)] gap-0 overflow-hidden rounded-xl p-0 sm:max-w-2xl"
      >
        <ScheduleForm key={formKey} onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function ScheduleForm({ onClose }: { onClose: () => void }) {
  const { locale, t } = useLocale();
  const [brand, setBrand] = useState<Extract<VehicleBrand, "ford" | "lincoln">>("ford");
  const [service, setService] = useState<(typeof services)[number] | "">("");
  const [state, action, pending] = useActionState(submitServiceSchedule, initial);
  const minDate = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }, []);
  const phone = brand === "lincoln" ? dealership.phones.lincolnService : dealership.phones.fordService;
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${dealership.serviceCenter.address}, ${dealership.serviceCenter.city}, ${dealership.serviceCenter.state} ${dealership.serviceCenter.zip}`,
  )}`;

  return (
    <div className="flex max-h-[min(90vh,40rem)] flex-col">
      <header className="relative shrink-0 border-b border-chrome px-6 py-4 pr-12">
        <DialogTitle className="text-lg font-semibold tracking-tight">{t.scheduleTitle}</DialogTitle>
        <DialogDescription className="mt-1 text-sm text-muted-foreground">
          {t.scheduleSub}
        </DialogDescription>
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 inline-flex size-8 items-center justify-center text-muted-foreground hover:text-foreground"
          aria-label={t.close}
        >
          <X className="size-4" />
        </button>
      </header>

      <div className="grid min-h-0 flex-1 md:grid-cols-[15.25rem_minmax(0,1fr)]">
        <aside className="flex flex-col border-b border-chrome px-6 py-5 md:border-r md:border-b-0">
          <p className="text-xs font-medium text-muted-foreground">{t.serviceCenter}</p>
          <a href={maps} target="_blank" rel="noreferrer" className="mt-2 text-sm font-medium leading-5 hover:text-ford">
            {dealership.serviceCenter.address}
            <span className="mt-0.5 block font-normal text-muted-foreground">
              {dealership.serviceCenter.city}, {dealership.serviceCenter.state} {dealership.serviceCenter.zip}
            </span>
          </a>

          <ul className="mt-5 space-y-2 text-sm">
            {dealership.hours.map((row) => (
              <li key={row.days} className="flex items-baseline justify-between gap-3">
                <span className="text-muted-foreground">{compactHourDays(row.days, locale)}</span>
                <span className="tabular-nums">{formatHourTime(row.time)}</span>
              </li>
            ))}
          </ul>

          <a href={formatPhoneHref(phone)} className="mt-5 text-sm font-medium text-ford hover:underline">
            {brand === "lincoln" ? "Lincoln" : "Ford"} {phone}
          </a>
          <SocialLinks className="mt-5" />
        </aside>

        <div className={cn("min-h-0 overflow-y-auto overscroll-contain", hideScroll)}>
          {state.ok ? (
            <div className="flex flex-col items-start gap-2 p-6">
              <CheckCircle2 className="size-6 text-ford" />
              <p className="text-base font-semibold tracking-tight">{t.requestSent}</p>
              <p className="text-sm leading-6 text-muted-foreground">
                {t.requestSentBody(phone)}
              </p>
              <Button type="button" onClick={onClose} className="mt-3 h-10 px-4">
                {t.done}
              </Button>
            </div>
          ) : (
            <form action={action} className="space-y-4 p-6">
              <input type="hidden" name="brand" value={brand} />

              <div className="grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-chrome bg-chrome">
                {(["ford", "lincoln"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setBrand(value)}
                    className={cn(
                      "h-9 bg-white text-sm font-medium capitalize transition",
                      brand === value ? "bg-ford text-white" : "text-foreground hover:bg-[#f4f6f8]",
                    )}
                  >
                    {value}
                  </button>
                ))}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="schedule-service">{t.service}</Label>
                <select
                  id="schedule-service"
                  name="service"
                  required
                  value={service}
                  onChange={(event) => setService(event.target.value as (typeof services)[number] | "")}
                  className={cn(
                    fieldClass,
                    "w-full border border-input px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                    !service && "text-muted-foreground",
                  )}
                >
                  <option value="" disabled>
                    {t.selectService}
                  </option>
                  {services.map((item) => (
                    <option key={item} value={item}>
                      {t.services[item]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="schedule-date">{t.preferredDate}</Label>
                  <Input id="schedule-date" name="preferredDate" type="date" min={minDate} className={fieldClass} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="schedule-time">{t.time}</Label>
                  <select
                    id="schedule-time"
                    name="preferredTime"
                    defaultValue="Morning"
                    className={cn(
                      fieldClass,
                      "w-full border border-input px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                    )}
                  >
                    {times.map((time) => (
                      <option key={time} value={time}>
                        {time === "Morning" ? t.morning : time === "Afternoon" ? t.afternoon : t.evening}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="schedule-vehicle">{t.vehicle}</Label>
                <Input id="schedule-vehicle" name="vehicle" placeholder={t.vehiclePlaceholder} className={fieldClass} />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field name="firstName" label={t.firstName} required />
                <Field name="lastName" label={t.lastName} required />
                <Field name="email" label={t.email} type="email" required />
                <Field name="phone" label={t.phone} type="tel" required />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="schedule-notes">{t.notes}</Label>
                <Textarea
                  id="schedule-notes"
                  name="notes"
                  rows={2}
                  placeholder={t.optional}
                  className="min-h-16 rounded-sm"
                />
              </div>

              {state.error ? (
                <p className="text-sm text-destructive">
                  {state.error === "no_service"
                    ? t.chooseService
                    : state.error === "incomplete"
                      ? t.leadIncomplete
                      : t.leadFailed}
                </p>
              ) : null}

              <Button type="submit" disabled={pending} className="h-10 w-full">
                {pending ? t.sending : t.requestAppointment}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  const id = `schedule-${name}`;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={name} type={type} required={required} className={fieldClass} />
    </div>
  );
}
