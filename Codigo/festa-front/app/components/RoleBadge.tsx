import type { Role } from "@/src/lib/auth-client";
import { managesBoard, ROLE_LABELS } from "@/src/lib/domain";

/**
 * RF-21: unmistakable visual badge of the active profile. The board-managing
 * modes (Coordenação, Head) are rendered solid/inverted so they're impossible
 * to miss; the read-only/own-task modes (Painel, Operativo) are outlined.
 */
export function RoleBadge({ role }: { role: Role }) {
  const label = `MODO ${ROLE_LABELS[role].toUpperCase()}`;

  if (managesBoard(role)) {
    return (
      <span className="micro inline-flex items-center gap-1.5 bg-black px-2 py-1 text-white">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-white" />
        {label}
      </span>
    );
  }
  return (
    <span className="micro inline-flex items-center gap-1.5 border border-black px-2 py-1 text-black">
      {label}
    </span>
  );
}
