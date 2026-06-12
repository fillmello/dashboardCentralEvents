"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAuthState, homePathForRole } from "@/src/lib/auth-client";

type Rule =
  | "auth-only" // any logged-in user
  | "gestao-only" // only Gestão (edit everything)
  | "view-all" // Gestão or Painel (full screens: board, cronograma, KPIs)
  | "individual-only"; // only the Individual task list

export function useRouteGuard(rule: Rule) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const auth = getAuthState();
    if (!auth.isLoggedIn) {
      router.replace("/login");
      return;
    }

    const allowed =
      rule === "auth-only" ||
      (rule === "gestao-only" && auth.isGestao) ||
      (rule === "view-all" && (auth.isGestao || auth.isPainel)) ||
      (rule === "individual-only" && auth.isIndividual);

    if (!allowed) {
      router.replace(homePathForRole(auth.role));
      return;
    }
    setIsChecking(false);
  }, [router, rule]);

  return { isChecking };
}
