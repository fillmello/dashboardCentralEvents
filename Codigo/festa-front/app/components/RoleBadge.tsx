import type { Role } from "@/src/lib/auth-client";
import { ROLE_LABELS } from "@/src/lib/domain";

/**
 * RF-21: unmistakable visual badge of the active profile. The Gestão (admin)
 * mode is rendered solid/inverted so it is impossible to miss on screen.
 */
export function RoleBadge({ role }: { role: Role }) {
  if (role === "gestao") {
    return (
      <span className="micro inline-flex items-center gap-1.5 bg-black px-2 py-1 text-white">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-white" />
        MODO GESTÃO
      </span>
    );
  }
  return (
    <span className="micro inline-flex items-center gap-1.5 border border-black px-2 py-1 text-black">
      MODO {ROLE_LABELS[role].toUpperCase()}
    </span>
  );
}
