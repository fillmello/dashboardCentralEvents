'use client';

import { PostFilters } from '@/src/hooks/usePosts';

interface FilterBarProps {
  filters: PostFilters;
  onFilterChange: (filters: PostFilters) => void;
  users?: Array<{ id: string; fullName: string }>;
}

export function FilterBar({ filters, onFilterChange, users = [] }: FilterBarProps) {
  const statuses = [
    { value: 'nao_iniciado', label: 'Não iniciado' },
    { value: 'captando', label: 'Captando' },
    { value: 'editando', label: 'Editando' },
    { value: 'criando', label: 'Criando' },
    { value: 'aprovacao', label: 'Aprovação' },
    { value: 'copy_capa', label: 'Capa/Copy' },
    { value: 'em_publicacao', label: 'Em publicação' },
    { value: 'publicado', label: 'Publicado' },
  ];

  const platforms = [
    { value: 'instagram', label: 'Instagram' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'youtube', label: 'YouTube' },
  ];

  const types = [
    { value: 'criativo', label: 'Criativo' },
    { value: 'video', label: 'Vídeo' },
  ];

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      status: e.target.value || undefined,
    });
  };

  const handlePlatformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      platform: e.target.value || undefined,
    });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      type: e.target.value || undefined,
    });
  };

  const handleResponsibleChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    onFilterChange({
      ...filters,
      responsibleId: e.target.value || undefined,
    });
  };

  const handleClear = () => {
    onFilterChange({});
  };

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4 mb-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <select
          value={filters.status || ''}
          onChange={handleStatusChange}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Todos os status</option>
          {statuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>

        <select
          value={filters.platform || ''}
          onChange={handlePlatformChange}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Todas as plataformas</option>
          {platforms.map((platform) => (
            <option key={platform.value} value={platform.value}>
              {platform.label}
            </option>
          ))}
        </select>

        <select
          value={filters.type || ''}
          onChange={handleTypeChange}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Todos os tipos</option>
          {types.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>

        {users.length > 0 && (
          <select
            value={filters.responsibleId || ''}
            onChange={handleResponsibleChange}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">Todos os responsáveis</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.fullName}
              </option>
            ))}
          </select>
        )}
      </div>

      {Object.values(filters).some((v) => v) && (
        <button
          onClick={handleClear}
          className="text-xs font-medium text-blue-600 hover:text-blue-700"
        >
          ✕ Limpar filtros
        </button>
      )}
    </div>
  );
}
