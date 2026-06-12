import { PIPELINE, STATUS_COLOR, STATUS_LABELS } from "@/src/lib/domain";

// RNF: status legend always visible.
export function StatusLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border border-black bg-white px-4 py-2.5">
      <span className="micro text-[#6a6a6a]">ESTEIRA</span>
      {PIPELINE.map((status, i) => (
        <span key={status} className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: STATUS_COLOR[status] }}
          />
          <span className="mono text-[#333]">{STATUS_LABELS[status]}</span>
          {i < PIPELINE.length - 1 && (
            <span className="mono text-[#cfcfcf]">→</span>
          )}
        </span>
      ))}
    </div>
  );
}
