import { DEFAULT_CURRENCY, type CurrencyConfig } from "@/services/currency";

let activeCurrency: CurrencyConfig = DEFAULT_CURRENCY;

/** Set once by AppProvider after IP-based detection; all money formatting follows. */
export function setActiveCurrency(config: CurrencyConfig): void {
  activeCurrency = config;
}

export function getActiveCurrency(): CurrencyConfig {
  return activeCurrency;
}

/** Formats a USD amount in the collector's detected local currency. */
export function formatMoney(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  const local = value * activeCurrency.rate;
  const abs = Math.abs(local);
  const formatted = abs.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${local < 0 ? "-" : ""}${activeCurrency.symbol}${formatted}`;
}

export function formatDelta(value: number): string {
  const sign = value >= 0 ? "+" : "-";
  const local = Math.abs(value * activeCurrency.rate);
  return `${sign}${activeCurrency.symbol}${local.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export function shortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function makeId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}${rand}`;
}
