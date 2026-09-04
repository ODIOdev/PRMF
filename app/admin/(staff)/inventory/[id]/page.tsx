import { notFound } from "next/navigation";
import { createDeskClient } from "@/lib/admin/session";
import { VehicleForm } from "../vehicle-form";

export default async function EditVehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createDeskClient();
  const { data } = await supabase
    .from("vehicles")
    .select("*, vehicle_images(id, url, alt, sort_order)")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();

  return <VehicleForm vehicle={data} />;
}
