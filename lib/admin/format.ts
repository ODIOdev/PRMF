export function daysOnLot(createdAt: string | null | undefined) {
  if (!createdAt) return 0;
  const start = new Date(createdAt).getTime();
  if (Number.isNaN(start)) return 0;
  return Math.max(0, Math.floor((Date.now() - start) / 86_400_000));
}

export function firstPhoto(images?: { url: string; sort_order: number }[] | null) {
  if (!images?.length) return null;
  return [...images].sort((a, b) => a.sort_order - b.sort_order)[0]?.url ?? null;
}
