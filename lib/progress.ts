import { safeHttps } from "@/lib/lessons";

export type ModuleLite = { id: string; title: string; position: number };

const NO_MODULE = -1000000000;

// Clases sin modulo primero, luego por orden de modulo y por orden de clase.
export function orderLessons<T extends { module_id: string | null; sort: number }>(
  lessons: T[],
  modules: { id: string; position: number }[],
): T[] {
  const pos = new Map(modules.map((m) => [m.id, m.position]));
  const rank = (l: T) =>
    l.module_id && pos.has(l.module_id) ? (pos.get(l.module_id) as number) : NO_MODULE;
  return [...lessons].sort((a, b) => rank(a) - rank(b) || a.sort - b.sort);
}

export function percent(done: number, total: number): number {
  return total <= 0 ? 0 : Math.round((done / total) * 100);
}

export function formatPrice(price: number | string): string {
  const n = Number(price);
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })} USD`;
}

export function bgImage(url: string | null | undefined): string | undefined {
  const safe = safeHttps(url);
  return safe ? `url("${safe}")` : undefined;
}