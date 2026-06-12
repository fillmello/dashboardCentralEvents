"use client";

import { useEffect, useState } from "react";
import { clockService } from "@/src/services/clock.service";

// RF-18: official synchronized clock. We measure the offset between the server
// time and the local clock once, then tick locally applying that offset so all
// screens display the same time.
export function EventClock() {
  const [offset, setOffset] = useState(0);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let active = true;
    clockService
      .now()
      .then(({ now: serverNow }) => {
        if (active) setOffset(new Date(serverNow).getTime() - Date.now());
      })
      .catch(() => {
        // fall back to the local clock if the server is unreachable
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date(Date.now() + offset)), 1000);
    return () => clearInterval(id);
  }, [offset]);

  return (
    <div className="flex flex-col">
      <span className="micro text-[#6a6a6a]">RELÓGIO OFICIAL</span>
      <span className="display text-2xl tabular-nums">
        {now.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}
      </span>
    </div>
  );
}
