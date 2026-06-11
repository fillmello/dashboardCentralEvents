import api from "@/src/lib/api";

export type UpdateUserDto = {
  fullName?: string;
  email?: string;
  telephone?: string;
};

export const userService = {
  getProfile: () => api.get("/user/profile"),
  update: (dto: UpdateUserDto) => api.put("/user", dto),
  remove: () => api.delete("/user"),
};
