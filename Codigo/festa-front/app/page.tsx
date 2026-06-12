"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getAuthState, homePathForRole } from "@/src/lib/auth-client";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const auth = getAuthState();
    router.replace(auth.isLoggedIn ? homePathForRole(auth.role) : "/login");
  }, [router]);

  return null;
}
