"use client";

import { useActionState } from "react";
import { submitPublicLead, type LeadState } from "@/app/actions/leads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { LeadType, VehicleBrand } from "@/lib/types";

const initial: LeadState = { ok: false };

export function LeadForm({
  type = "sales",
  brand,
  vehicleId,
}: {
  type?: LeadType;
  brand?: VehicleBrand;
  vehicleId?: string;
}) {
  const [state, action, pending] = useActionState(submitPublicLead, initial);

  return (
    <form action={action} className="space-y-4 border border-chrome bg-white p-5">
      <input type="hidden" name="type" value={type} />
      {brand ? <input type="hidden" name="brand" value={brand} /> : null}
      {vehicleId ? <input type="hidden" name="vehicleId" value={vehicleId} /> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field name="firstName" label="First name" required />
        <Field name="lastName" label="Last name" required />
        <Field name="email" label="Email" type="email" required />
        <Field name="phone" label="Phone" type="tel" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">How can we help?</Label>
        <Textarea id="message" name="message" rows={4} placeholder="Tell us the vehicle or service you need." />
      </div>
      <label className="flex items-start gap-2 text-sm text-muted-foreground">
        <input type="checkbox" name="emailConsent" className="mt-1" />
        You may email me about this request. SMS sending is not enabled yet.
      </label>
      <p className="text-xs text-muted-foreground">
        By submitting, you agree to our{" "}
        <a href="/privacy" className="font-medium text-ford hover:underline">
          Privacy Policy
        </a>{" "}
        and{" "}
        <a href="/terms" className="font-medium text-ford hover:underline">
          Terms of Use
        </a>
        .
      </p>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-green-700">Received. A Premier advisor will follow up shortly.</p> : null}
      <Button type="submit" disabled={pending} className="h-11 w-full">
        {pending ? "Sending…" : "Request information"}
      </Button>
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
