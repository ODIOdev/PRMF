"use client";

import { useActionState } from "react";
import { submitPublicLead, type LeadState } from "@/app/actions/leads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { LeadType, VehicleBrand } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/site/locale-provider";

const initial: LeadState = { ok: false };

export function LeadForm({
  type = "sales",
  brand,
  vehicleId,
  className,
  layout = "stack",
}: {
  type?: LeadType;
  brand?: VehicleBrand;
  vehicleId?: string;
  className?: string;
  layout?: "stack" | "landscape";
}) {
  const { locale, t } = useLocale();
  const [state, action, pending] = useActionState(submitPublicLead, initial);
  const landscape = layout === "landscape";

  return (
    <form
      action={action}
      className={cn(
        "flex flex-col space-y-4 rounded-2xl border border-chrome bg-white p-6 shadow-[0_8px_32px_rgb(11_31_58_/_6%)]",
        !landscape && "h-full",
        className,
      )}
    >
      <input type="hidden" name="type" value={type} />
      {brand ? <input type="hidden" name="brand" value={brand} /> : null}
      {vehicleId ? <input type="hidden" name="vehicleId" value={vehicleId} /> : null}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ford">{t.contact}</p>
        <h3 className="mt-1 text-lg font-semibold tracking-tight">{t.requestInfo}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{t.advisorFollowup}</p>
      </div>
      <div className="space-y-4">
        <div className={cn("grid gap-3 sm:grid-cols-2", landscape && "lg:grid-cols-4")}>
          <Field name="firstName" label={t.firstName} required />
          <Field name="lastName" label={t.lastName} required />
          <Field name="email" label={t.email} type="email" required />
          <Field name="phone" label={t.phone} type="tel" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="message">{t.howHelp}</Label>
          <Textarea
            id="message"
            name="message"
            rows={landscape ? 2 : 4}
            placeholder={t.howHelpPlaceholder}
            className={cn(!landscape && "min-h-24 flex-1 field-sizing-fixed")}
          />
        </div>
        <label className="flex items-start gap-2 text-sm text-muted-foreground">
          <input type="checkbox" name="emailConsent" className="mt-1" />
          {t.emailConsent}
        </label>
        <p className="text-xs text-muted-foreground">
          {t.submitAgree}{" "}
          <a href="/privacy" className="font-medium text-ford hover:underline">
            {t.privacy}
          </a>{" "}
          {locale === "es" ? "y" : "and"}{" "}
          <a href="/terms" className="font-medium text-ford hover:underline">
            {t.terms}
          </a>
          .
        </p>
        {state.error ? (
          <p className="text-sm text-destructive">
            {state.error === "incomplete" ? t.leadIncomplete : t.leadFailed}
          </p>
        ) : null}
        {state.ok ? <p className="text-sm text-green-700">{t.received}</p> : null}
        <Button type="submit" disabled={pending} className={cn("h-11 w-full", landscape && "lg:w-auto lg:px-8")}>
          {pending ? t.sending : t.requestInfo}
        </Button>
      </div>
    </form>
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
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} required={required} className="h-11 rounded-sm" />
    </div>
  );
}
