import type { ChartConfig } from "@/components/ui/chart";

// Shared chart palette built on the themed --chart-* CSS variables (see app/globals.css).
// Charts are composed with recharts inline per page; this only centralises colours so every
// chart stays consistent and light/dark-safe. No generic chart component — keep it simple.
export const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const;

export const chartColor = (i: number) => CHART_COLORS[i % CHART_COLORS.length];

// Build a ChartConfig for a categorical series keyed by the value in `nameKey`, assigning
// palette colours in order. Used for pie/donut legends + tooltips.
export function paletteConfig(entries: { key: string; label: string }[]): ChartConfig {
  return Object.fromEntries(
    entries.map((e, i) => [e.key, { label: e.label, color: chartColor(i) }]),
  );
}
