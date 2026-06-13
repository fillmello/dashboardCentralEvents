import api from "@/src/lib/api";
import type { Role } from "@/src/lib/auth-client";

export type UserProfile = {
  id: number;
  fullName: string;
  email: string;
  role: Role;
};

export type UpdateUserDto = {
  fullName?: string;
  email?: string;
};

export type ManagedCreateUserDto = {
  fullName: string;
  email: string;
  password: string;
  role: Role;
};

export const userService = {
  getProfile: () => api.get("/user/profile") as unknown as Promise<UserProfile>,
  update: (dto: UpdateUserDto) => api.put("/user", dto),
  removeOwn: () => api.delete("/user"),

  // Gestor-only
  list: () => api.get("/user") as unknown as Promise<UserProfile[]>,
  createManaged: (dto: ManagedCreateUserDto) => api.post("/user/managed", dto),
  updateRole: (id: number, role: Role) =>
    api.patch(`/user/${id}/role`, { role }),
  remove: (id: number) => api.delete(`/user/${id}`),
};
