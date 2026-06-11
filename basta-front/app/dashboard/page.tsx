'use client';

import { useReports } from '@/src/hooks/useReports';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const { metrics, loading, error } = useReports();

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-gray-600">Carregando dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      <header className="space-y-2">
        <h1 className="text-4xl font-bold">Dashboard de Posts</h1>
        <p className="text-gray-600">
          Gerencie a produção de conteúdo para o evento ao vivo
        </p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        <KPICard
          label="Total de Posts"
          value={metrics?.total || 0}
          color="bg-blue-50"
          textColor="text-blue-600"
        />
        <KPICard
          label="Publicados"
          value={metrics?.published || 0}
          subtext={`${metrics?.publishedPercentage || 0}%`}
          color="bg-green-50"
          textColor="text-green-600"
        />
        <KPICard
          label="Em Produção"
          value={metrics?.inProgress || 0}
          color="bg-yellow-50"
          textColor="text-yellow-600"
        />
        <KPICard
          label="Não Iniciado"
          value={metrics?.notStarted || 0}
          color="bg-gray-50"
          textColor="text-gray-600"
        />
      </div>

      {/* Main CTA */}
      <div className="space-y-4">
        <button
          onClick={() => router.push('/dashboard/kanban')}
          className="w-full rounded-lg bg-blue-600 px-6 py-4 font-semibold text-white transition hover:bg-blue-700 text-lg"
        >
          ➜ Ir para o Kanban
        </button>
      </div>

      {/* Chart sections (placeholder) */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-gray-200 p-6">
          <h2 className="mb-4 font-semibold">Por Tipo</h2>
          <div className="space-y-2">
            {Object.entries(metrics?.byType || {}).map(([type, count]) => (
              <div key={type} className="flex justify-between">
                <span className="capitalize text-gray-600">{type}</span>
                <span className="font-semibold">{count as number}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 p-6">
          <h2 className="mb-4 font-semibold">Por Status</h2>
          <div className="space-y-2">
            {Object.entries(metrics?.byStatus || {}).map(([status, count]) => (
              <div key={status} className="flex justify-between">
                <span className="capitalize text-gray-600">{status}</span>
                <span className="font-semibold">{count as number}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface KPICardProps {
  label: string;
  value: number;
  subtext?: string;
  color: string;
  textColor: string;
}

function KPICard({ label, value, subtext, color, textColor }: KPICardProps) {
  return (
    <div className={`rounded-lg ${color} p-6`}>
      <p className="text-sm text-gray-600">{label}</p>
      <div className={`text-3xl font-bold ${textColor}`}>{value}</div>
      {subtext && <p className={`text-xs ${textColor}`}>{subtext}</p>}
    </div>
  );
}
