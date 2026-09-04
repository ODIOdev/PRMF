"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { LeadType, VehicleBrand } from "@/lib/types";

export type LeadState = { ok: boolean; error?: string };

export async function submitPublicLead(_prev: LeadState, formData: FormData): Promise<LeadState> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const type = (String(formData.get("type") ?? "sales") as LeadType) || "sales";
  const brand = (formData.get("brand") as VehicleBrand | null) || null;
  const vehicleId = (formData.get("vehicleId") as string | null) || null;
  const emailConsent = formData.get("emailConsent") === "on";

  if (!firstName || !lastName || !email || !phone) {
    return { ok: false, error: "incomplete" };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.rpc("submit_lead", {
    p_first_name: firstName,
    p_last_name: lastName,
    p_email: email,
    p_phone: phone,
    p_message: message,
    p_type: type,
    p_brand: brand,
    p_vehicle_id: vehicleId,
    p_email_consent: emailConsent,
    p_sms_consent: false,
  });

  if (error) return { ok: false, error: "send_failed" };
  return { ok: true };
}

export async function submitServiceSchedule(_prev: LeadState, formData: FormData): Promise<LeadState> {
  const department = String(formData.get("department") ?? "service") === "sales" ? "sales" : "service";
  const reason =
    department === "sales"
      ? String(formData.get("salesVisit") ?? "").trim()
      : String(formData.get("service") ?? "").trim();
  if (!reason) return { ok: false, error: department === "sales" ? "no_visit" : "no_service" };

  const preferredDate = String(formData.get("preferredDate") ?? "").trim();
  const preferredTime = String(formData.get("preferredTime") ?? "").trim();
  const vehicle = String(formData.get("vehicle") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const when = [preferredDate, preferredTime].filter(Boolean).join(", ");

  formData.set("type", department);
  formData.set(
    "message",
    [
      department === "sales" ? `Visit: ${reason}` : `Service: ${reason}`,
      when && `Preferred: ${when}`,
      vehicle && `Vehicle: ${vehicle}`,
      notes,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return submitPublicLead(_prev, formData);
}
