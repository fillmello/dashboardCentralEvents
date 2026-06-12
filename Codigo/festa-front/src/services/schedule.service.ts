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
  remove: (id: number) => api.delete(`/schedule/${id}`),
};
