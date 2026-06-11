import api from '@/src/lib/api';

export interface Evento {
  id: string;
  nome: string;
  descricao?: string;
  dataInicio: string;
  dataFim: string;
  status: 'planejamento' | 'ao_vivo' | 'encerrado';
  horaInicioReal?: string;
  horaPausaReal?: string;
  tempoDecorridoMs: number;
  criadoPorId: string;
  criadoPor: {
    id: string;
    fullName: string;
  };
  momentos?: EventoMomento[];
  createdAt: string;
  updatedAt: string;
}

export interface EventoMomento {
  id: string;
  descricao: string;
  horaAgendada: string;
  horaInicio?: string;
  horaConclusao?: string;
  ordem: number;
  eventoId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventoDto {
  nome: string;
  descricao?: string;
  dataInicio: string;
  dataFim: string;
}

export interface CreateMomentoDto {
  descricao: string;
  horaAgendada: string;
  ordem: number;
  eventoId: string;
}

export const eventosService = {
  create: (data: CreateEventoDto) =>
    api.post<Evento>('/eventos', data),
  list: () => api.get<Evento[]>('/eventos'),
  get: (id: string) => api.get<Evento>(`/eventos/${id}`),
  update: (id: string, data: Partial<CreateEventoDto>) =>
    api.patch<Evento>(`/eventos/${id}`, data),
  delete: (id: string) => api.delete<void>(`/eventos/${id}`),

  start: (id: string) =>
    api.patch<Evento>(`/eventos/${id}/start`),
  pause: (id: string) =>
    api.patch<Evento>(`/eventos/${id}/pause`),
  resume: (id: string) =>
    api.patch<Evento>(`/eventos/${id}/resume`),
  end: (id: string) =>
    api.patch<Evento>(`/eventos/${id}/end`),
  reset: (id: string) =>
    api.patch<Evento>(`/eventos/${id}/reset`),

  addMomento: (data: CreateMomentoDto) =>
    api.post<EventoMomento>('/eventos/momentos', data),
  updateMomento: (id: string, data: Partial<CreateMomentoDto>) =>
    api.patch<EventoMomento>(`/eventos/momentos/${id}`, data),
  startMomento: (id: string) =>
    api.patch<EventoMomento>(`/eventos/momentos/${id}/start`),
  completeMomento: (id: string) =>
    api.patch<EventoMomento>(`/eventos/momentos/${id}/complete`),
};
