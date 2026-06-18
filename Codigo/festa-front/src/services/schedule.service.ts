import api from "@/src/lib/api";

export type ScheduleItem = {
  id: number;
  name: string;
  plannedTime: string;
  actualStartTime: string | null;
  actualEndTime: string | null;
  done: boolean;
};

export type CreateScheduleItemDto = {
  name: string;
  plannedTime: string;
};

// The "current" moment, derived from the clock: the latest item whose planned
// time has already been reached and that hasn't been concluded. Drives the
// indicator that lights up automatically at each scheduled time, regardless of
// whether a Gestor pressed "Iniciar". `items` must be sorted by plannedTime.
export function activeScheduleItemId(
  items: ScheduleItem[],
  nowMs: number,
): number | null {
  let activeId: number | null = null;
  for (const item of items) {
    if (!item.done && new Date(item.plannedTime).getTime() <= nowMs) {
      activeId = item.id;
    }
  }
  return activeId;
}

export const scheduleService = {
  list: () => api.get("/schedule") as unknown as Promise<ScheduleItem[]>,
  create: (dto: CreateScheduleItemDto) =>
    api.post("/schedule", dto) as unknown as Promise<ScheduleItem>,
  update: (id: number, dto: Partial<CreateScheduleItemDto>) =>
    api.put(`/schedule/${id}`, dto) as unknown as Promise<ScheduleItem>,
  start: (id: number) =>
    api.patch(`/schedule/${id}/start`) as unknown as Promise<ScheduleItem>,
  conclude: (id: number) =>
    api.patch(`/schedule/${id}/conclude`) as unknown as Promise<ScheduleItem>,
  // Reopen a concluded moment, returning it to the "não concluído" state.
  restart: (id: number) =>
    api.patch(`/schedule/${id}/restart`) as unknown as Promise<ScheduleItem>,
  remove: (id: number) => api.delete(`/schedule/${id}`),
};
