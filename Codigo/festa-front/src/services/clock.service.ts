import api from "@/src/lib/api";

export const clockService = {
  now: () => api.get("/clock") as unknown as Promise<{ now: string }>,
};
