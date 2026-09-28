import type { SVGProps } from "react";

const paths = {
  menu: "M4 6h16M4 12h16M4 18h16",
  close: "m6 6 12 12M6 18 18 6",
  chevron: "m9 5 7 7-7 7",
  bed: "M3 18V8m18 10V8M3 14h18M6 14V5h12v9M3 18h18M3 18v3m18-3v3",
  headboard: "M5 20V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v15M5 15h14M9 6v5m6-5v5",
  mattress: "M3 8h18v9H3zM3 12h18M7 15h1m3 0h2m3 0h1",
  cabinet: "M5 4h14v15H5zM5 11h14M10 8h4m-4 7h4M7 19v3m10-3v3",
  pouf: "M4 9c0-5 16-5 16 0v7c0 5-16 5-16 0ZM4 9c0 5 16 5 16 0",
  table: "M3 8h18v4H3zM6 12v8m12-8v8",
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  layers: "m12 3 9 5-9 5-9-5ZM3 12l9 5 9-5M3 16l9 5 9-5",
  ruler: "m3 16 13-13 5 5L8 21ZM7 12l2 2m2-6 2 2m2-6 2 2",
  fabric: "M5 3h14v18H5zM5 9h14M5 15h14M10 3v18m4-18v18",
  sparkle: "m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z",
  tag: "M3 3h8l10 10-8 8L3 11ZM7 7h.01",
  factory: "M3 21V10l6 3V7l6 4V3h5l1 18ZM7 17h1m4 0h1m4 0h1",
  truck: "M3 5h11v12H3ZM14 9h4l3 4v4h-7M5 17a2 2 0 1 0 4 0m7 0a2 2 0 1 0 4 0",
} as const;

export type IconName = keyof typeof paths;
export function SiteIcon({ name, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}><path d={paths[name]} /></svg>;
}

export const categoryIcons: Record<string, IconName> = { bazalar: "bed", "yatak-basliklari": "headboard", yataklar: "mattress", komodin: "cabinet", puf: "pouf", sehpa: "table", "diger-urunler": "grid" };
