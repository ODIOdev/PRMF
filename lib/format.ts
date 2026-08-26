export function formatUsd(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "Call for price";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
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
