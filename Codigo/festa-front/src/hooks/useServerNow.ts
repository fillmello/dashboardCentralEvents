"use client";

import { useEffect, useState } from "react";
import { clockService } from "@/src/services/clock.service";

// Ticks "now" corrected by the server clock offset (RF-18), so time-driven UI
// (e.g. the auto-lighting schedule indicator) fires at the real official time
// instead of a possibly-skewed device clock. Falls back to the local clock if
// the server is unreachable.
export function useServerNow(intervalMs = 1000): number {
  const [offset, setOffset] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let active = true;
    clockService
      .now()
      .then(({ now: serverNow }) => {
        if (active) setOffset(new Date(serverNow).getTime() - Date.now());
      })
      .catch(() => {
        // keep the local clock
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now() + offset), intervalMs);
    return () => clearInterval(id);
  }, [offset, intervalMs]);

  return now;
}
