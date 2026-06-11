"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { label: "Dados cadastrais", href: "/my-area/profile" },
  { label: "Endereços de entrega", href: "/my-area/address" },
  { label: "Meus pedidos", href: "/my-area/orders" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-48 shrink-0">
      <p className="mb-4 text-sm font-semibold text-white">Minha área</p>
      <nav className="flex flex-col gap-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-md px-3 py-2 text-sm transition-colors ${
              pathname === link.href
                ? "bg-zinc-800 font-medium text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
