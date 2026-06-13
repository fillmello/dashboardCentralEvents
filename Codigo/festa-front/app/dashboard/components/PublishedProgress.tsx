"use client";

// Painel-only: published-progress bar shown on top of the board. Reuses the same
// "publicados" figure the Gestão KPIs panel computes (RF-14), rendered as a bar.
type Props = {
  published: number;
  total: number;
  pct: number;
};

export function PublishedProgress({ published, total, pct }: Props) {
  return (
    <div className="border border-black p-3">
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="micro text-black">PUBLICADOS</span>
        <span className="mono text-[#555]">
          {published}/{total} · {pct}%
        </span>
      </div>
      <div className="h-3 w-full bg-[#eee]">
        <div
          className="h-3 bg-black transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
