import api from '@/src/lib/api';

export type LoginDto = {
  email: string;
  password: string;
};

export type RegisterDto = {
  cpf: string;
  fullName: string;
  telephone: string;
  email: string;
  password: string;
};

export const authService = {
  login: async (dto: LoginDto): Promise<void> => {
    const data = await api.post('/auth/login', dto) as { access_token: string };
    localStorage.setItem('access_token', data.access_token);
    window.dispatchEvent(new Event('auth-change'));
  },
  register: (dto: RegisterDto) => api.post('/user', dto),
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    localStorage.removeItem('access_token');
    window.dispatchEvent(new Event('auth-change'));
    window.location.href = '/login';
  },
};