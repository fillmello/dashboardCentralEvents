"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAuthState } from "@/src/lib/auth-client";

type Rule = "user-only" | "admin-only";

export function useRouteGuard(rule: Rule) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const auth = getAuthState();
    if (!auth.isLoggedIn) {
      router.replace("/");
      return;
    }
    if (rule === "user-only" && auth.isAdmin) {
      router.replace("/admin");
      return;
    }
    if (rule === "admin-only" && !auth.isAdmin) {
      router.replace("/");
      return;
    }
    setIsChecking(false);
  }, [router, rule]);

  return { isChecking };
}
