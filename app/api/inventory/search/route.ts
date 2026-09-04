import { searchVehicles } from "@/lib/inventory";
import { formatUsd, listingPrice } from "@/lib/format";
import type { VehicleBrand, VehicleCondition } from "@/lib/types";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const q = params.get("q")?.trim() ?? "";
  if (q.length < 1) return Response.json({ vehicles: [] });

  const brandValue = params.get("brand");
  const conditionValue = params.get("condition");
  const brand = brandValue === "ford" || brandValue === "lincoln" ? (brandValue as VehicleBrand) : undefined;
  const condition =
    conditionValue === "new" || conditionValue === "used" || conditionValue === "cpo"
      ? (conditionValue as VehicleCondition)
      : undefined;

  try {
    const vehicles = await searchVehicles(q, { brand, condition }, 8);
    return Response.json({
      vehicles: vehicles.map((vehicle) => ({
        id: vehicle.id,
        vin: vehicle.vin,
        href: `/inventory/${vehicle.vin ?? vehicle.id}`,
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
        trim: vehicle.trim,
        brand: vehicle.brand,
        condition: vehicle.condition,
        stock: vehicle.stock_number,
        price: formatUsd(listingPrice(vehicle)),
      })),
    });
  } catch (error) {
    console.error("inventory search failed", error);
    return Response.json({ vehicles: [] }, { status: 500 });
  }
}
