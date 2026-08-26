import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VehicleForm } from "../vehicle-form";

export default async function EditVehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("vehicles").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit vehicle</h1>
      <VehicleForm vehicle={data} />
    </div>
  );
}
