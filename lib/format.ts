export function formatUsd(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "Call for price";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

const CALL_FOR_PRICE = "call_for_price";

export function vehicleCallForPrice(vehicle: { call_for_price?: boolean | null; features?: unknown } | null | undefined) {
  if (!vehicle) return false;
  if (vehicle.call_for_price === true) return true;
  return Array.isArray(vehicle.features) && vehicle.features.includes(CALL_FOR_PRICE);
}

export function withCallForPrice(features: unknown, on: boolean) {
  const list = Array.isArray(features) ? features.filter((item) => item !== CALL_FOR_PRICE) : [];
  if (on) list.push(CALL_FOR_PRICE);
  return list;
}

export function listingPrice(vehicle: {
  call_for_price?: boolean | null;
  features?: unknown;
  internet_price?: number | null;
  msrp?: number | null;
}) {
  if (vehicleCallForPrice(vehicle)) return null;
  const value = vehicle.internet_price ?? vehicle.msrp;
  if (value == null || Number.isNaN(Number(value))) return null;
  return Number(value);
}

export function formatPhoneHref(phone: string) {
  return `tel:+1${phone.replace(/\D/g, "")}`;
}

export function titleCase(value: string | null | undefined) {
  if (!value) return "";
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function monthlyEstimate(price: number | null | undefined, term = 72, apr = 0.069) {
  if (!price || price <= 0) return null;
  const r = apr / 12;
  const payment = (price * r) / (1 - Math.pow(1 + r, -term));
  return Math.round(payment);
}
