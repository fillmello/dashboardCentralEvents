"use client";

import { io, type Socket } from "socket.io-client";
import { getAccessToken } from "@/src/lib/auth-client";

let socket: Socket | null = null;

/**
 * Singleton connection to the posts gateway. The access token is sent in the
 * handshake so the server can reject unauthenticated sockets (RNF-09). Real-time
 * board updates arrive on `post:created` / `post:updated` / `post:deleted`.
 */
export function getSocket(): Socket {
  if (socket) return socket;
  socket = io(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000", {
    transports: ["websocket"],
    auth: { token: getAccessToken() ?? "" },
    autoConnect: true,
  });
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}
