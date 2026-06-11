import api from '@/src/lib/api';

export interface DashboardMetrics {
  total: number;
  published: number;
  publishedPercentage: string;
  inProgress: number;
  notStarted: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
}

export interface UserMetrics {
  userId: string;
  totalAssigned: number;
  published: number;
  inProgress: number;
  publishedPercentage: string;
}

export interface TimelineMetrics {
  statusTransitions: number;
  avgTimePerTransition: Record<string, number>;
}

export interface PlatformMetrics {
  [platform: string]: number;
}

export const reportsService = {
  getDashboard: () =>
    api.get<DashboardMetrics>('/reports/dashboard'),
  getUserMetrics: (userId: string) =>
    api.get<UserMetrics>(`/reports/by-user/${userId}`),
  getTimeline: () =>
    api.get<TimelineMetrics>('/reports/timeline'),
  getPlatforms: () =>
    api.get<PlatformMetrics>('/reports/platforms'),
};
