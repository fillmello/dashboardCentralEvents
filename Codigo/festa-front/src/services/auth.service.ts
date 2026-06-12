import api from "@/src/lib/api";
import { emitAuthChange } from "@/src/lib/auth-client";
import { disconnectSocket } from "@/src/lib/socket";

export type LoginDto = {
  email: string;
  password: string;
};

export type RegisterDto = {
  fullName: string;
  email: string;
  password: string;
};

export const authService = {
  login: async (dto: LoginDto): Promise<void> => {
    const data = (await api.post("/auth/login", dto)) as {
      access_token: string;
    };
    localStorage.setItem("access_token", data.access_token);
    emitAuthChange();
  },
  register: (dto: RegisterDto) => api.post("/user", dto),
  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
    localStorage.removeItem("access_token");
    disconnectSocket();
    emitAuthChange();
    window.location.href = "/login";
  },
};
