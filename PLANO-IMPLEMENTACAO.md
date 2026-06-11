# Plano de Implementação: Dashboard Comunicação Praça

**Versão**: 1.0  
**Data**: 2026-06-11  
**Objetivo**: Adaptar o template Basta para um dashboard de gerenciamento de posts em eventos ao vivo

---

## 1. Visão Geral da Transformação

### Escopo de Mudança
Transformar o template e-commerce (Basta Fabric) em uma plataforma de **controle operacional para governança de conteúdo em tempo real**.

| Aspecto | Template Atual (Basta) | Dashboard de Eventos |
|--------|----------------------|---------------------|
| **Entidade Principal** | Product/Release | Post |
| **Usuários** | Customers + Admin | Designer, Social Media, Gestor |
| **Fluxo Principal** | Compra (carrinho → checkout) | Pipeline de produção (8 etapas) |
| **Visão** | Catálogo público | Kanban/Grid por responsável |
| **Real-time** | Não crítico | Crítico (<2s sync) |

### Stack Reutilizável
✅ **Mantém**:
- NestJS 11 + TypeORM + PostgreSQL
- Next.js 16 + React 19 + Tailwind
- JWT auth + RBAC (role-based access control)
- Axios + interceptors

🔄 **Adapta**:
- Entidades (Product → Post)
- Módulos (Products, Cart → Posts, Pipeline)
- Pages (Catálogo → Dashboard Kanban)
- Real-time sync (adicionar WebSockets ou polling)

❌ **Remove/Desativa**:
- Módulos de E-commerce (Cart, Checkout, Payments, Orders)
- Lógica de Releases
- Sistema de endereços de entrega

---

## 2. Modelo de Dados

### Entidades Principais

#### 2.1 Post
```typescript
entity Post {
  id: UUID
  title: string           // "Nome/descrição"
  description: string
  responsible: User       // Quem é responsável
  platform: Platform      // Instagram | WhatsApp | YouTube
  type: PostType         // Criativo | Vídeo
  format: PostFormat     // Feed | Story | Reels | Capa
  status: PostStatus     // Ver workflow abaixo
  createdAt: Date
  updatedAt: Date
  createdBy: User
  updatedBy: User
  statusHistory: PostStatusHistory[] // Auditoria
}

enum PostStatus {
  NaoIniciado = "nao_iniciado",
  Captando = "captando",
  Editando = "editando",
  Criando = "criando",
  Aprovacao = "aprovacao",
  CopyCapa = "copy_capa",
  EmPublicacao = "em_publicacao",
  Publicado = "publicado"
}

entity PostStatusHistory {
  id: UUID
  post: Post
  previousStatus: PostStatus
  newStatus: PostStatus
  changedAt: Date
  changedBy: User
  reason?: string
}
```

#### 2.2 Evento (Container)
```typescript
entity Evento {
  id: UUID
  nome: string
  dataInicio: Date
  dataFim: Date
  posts: Post[]
  momentos: EventoMomento[]
  status: "planejamento" | "ao_vivo" | "encerrado"
}

entity EventoMomento {
  id: UUID
  evento: Evento
  descricao: string
  horaAgendada: Date
  horaInicio?: Date
  horaConclusao?: Date
  ordem: number
}
```

#### 2.3 Usuário (Estender modelo existente)
```typescript
enum Role {
  GESTOR = "gestor",        // Admin completo
  DESIGNER = "designer",    // Visualiza suas + avanço até "Aprovação"
  SOCIAL_MEDIA = "social",  // Visualiza suas + avanço de "Aprovação" → "Publicado"
}

// Adicionar ao User entity:
role: Role
// perms já em @Roles() decorators
```

---

## 3. Arquitetura Backend (NestJS)

### 3.1 Módulos a Criar

```
src/
├── posts/                      [NOVO]
│   ├── posts.controller.ts     (CRUD + avanço de status)
│   ├── posts.service.ts
│   ├── post.entity.ts
│   ├── dtos/
│   │   ├── create-post.dto.ts
│   │   ├── update-post.dto.ts
│   │   └── advance-status.dto.ts
│   └── posts.module.ts
│
├── eventos/                     [NOVO]
│   ├── eventos.controller.ts
│   ├── eventos.service.ts
│   ├── evento.entity.ts
│   ├── evento-momento.entity.ts
│   └── eventos.module.ts
│
├── reports/                     [NOVO]
│   ├── reports.controller.ts   (KPIs + métricas)
│   ├── reports.service.ts
│   └── reports.module.ts
│
├── auth/                        [ADAPTAR]
│   └── roles.enum.ts           (Gestor, Designer, Social Media)
│
└── common/
    └── decorators/             [ADAPTAR]
        ├── @Roles()            (já existe)
        └── @RequireAdminMode() [NOVO] — para operações críticas
```

### 3.2 Endpoints Principais

#### Posts
```
POST   /posts                    Criar post (Gestor)
GET    /posts                    Listar meus posts (com filtro de acesso)
GET    /posts/:id                Visualizar post
PATCH  /posts/:id                Editar (Gestor)
DELETE /posts/:id                Remover (Gestor)
PATCH  /posts/:id/advance-status Avançar no pipeline (respeitando permissões)
GET    /posts/history/:id        Auditoria de mudanças
```

#### Eventos
```
POST   /eventos                  Criar evento (Gestor)
GET    /eventos                  Listar eventos
GET    /eventos/:id              Detalhes
PATCH  /eventos/:id              Editar (Gestor)
PATCH  /eventos/:id/start        Iniciar cronômetro
PATCH  /eventos/:id/pause        Pausar cronômetro
PATCH  /eventos/:id/reset        Zerar cronômetro
```

#### Reports (KPIs)
```
GET    /reports/dashboard        Métricas consolidadas (total, %, por status)
GET    /reports/by-user/:userId  Progresso individual
GET    /reports/timeline         Tempo médio por etapa (pós-evento)
GET    /reports/export           Download de relatório (CSV/PDF)
```

### 3.3 Permissões (Guards)

```typescript
// Role-based permissions matrix
const PERMISSIONS = {
  [Role.GESTOR]: {
    posts: ["create", "read", "update", "delete"],
    status: ["advance", "reverse"],
    access: "view_all"
  },
  [Role.DESIGNER]: {
    posts: ["read"],
    status: ["advance"], // until "aprovacao"
    access: "view_own"
  },
  [Role.SOCIAL_MEDIA]: {
    posts: ["read"],
    status: ["advance"], // from "aprovacao" to "publicado"
    access: "view_own"
  }
};

// @Roles(Role.GESTOR) @RequireAdminMode() — para delete/revert
```

---

## 4. Arquitetura Frontend (Next.js)

### 4.1 Estrutura de Pages/Routes

```
app/
├── dashboard/                  [NOVO]
│   ├── layout.tsx             (sidebar com filtros + menu)
│   ├── page.tsx               (kanban board principal)
│   ├── [postId]/              (detalhes + edição)
│   └── analytics/             (KPIs + relatórios)
│
├── eventos/                    [NOVO]
│   ├── page.tsx               (lista + criar)
│   ├── [eventoId]/
│   │   ├── page.tsx           (visualizar)
│   │   ├── schedule/          (cronograma + momentos)
│   │   └── timeline/          (relógio do evento)
│   └── components/
│
├── admin/                      [ADAPTAR]
│   ├── users/                 (RBAC management)
│   └── settings/              (admin mode toggle)
│
└── components/                 [ADAPTAR]
    ├── Kanban.tsx             (board com drag-drop)
    ├── PostCard.tsx
    ├── StatusBadge.tsx
    ├── AdminModeToggle.tsx     [NOVO]
    └── KPIDashboard.tsx        [NOVO]
```

### 4.2 Drag-and-Drop Implementation

#### Library Choice
**Recomendação**: `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities`

**Por quê**:
- ✅ Modern, bem mantida (2024+)
- ✅ Typescript first
- ✅ Modular (só o que precisa)
- ✅ Acessibilidade (keyboard support)
- ✅ Suporta drag between columns (status transition)

**Alternativa**: `react-beautiful-dnd` (mais known, porém menos flexível)

#### Estrutura Kanban

```
┌─ Dashboard Kanban ────────────────────────────┐
│                                                │
│  [Filtros: Tipo | Status | Responsável | ...]│
│                                                │
│ ┌──────────┬──────────┬──────────┐            │
│ │ Não      │ Captando │ Editando │ ...        │
│ │ iniciado │          │          │            │
│ ├──────────┼──────────┼──────────┤            │
│ │ ┌─────┐  │ ┌─────┐  │ ┌─────┐  │            │
│ │ │Post1│  │ │Post2│  │ │Post3│  │            │
│ │ │drag │  │ │drag │  │ │drag │  │            │
│ │ └─────┘  │ └─────┘  │ └─────┘  │            │
│ │          │          │          │            │
│ │ ┌─────┐  │          │          │            │
│ │ │Post4│  │          │          │            │
│ │ └─────┘  │          │          │            │
│ └──────────┴──────────┴──────────┘            │
│                                                │
└────────────────────────────────────────────────┘

Drag Post1 de "Não iniciado" → "Captando" 
  = Validar permissão (Designer até "Aprovação")
  = PATCH /posts/1/advance-status
  = Atualizar UI em tempo real
```

### 4.3 Componentes Frontend

#### Dashboard Principal
```typescript
// app/dashboard/page.tsx
"use client";

import { useUser } from '@/hooks/useUser';
import { usePosts } from '@/hooks/usePosts';
import { KanbanBoard } from '@/components/KanbanBoard';
import { KPIDashboard } from '@/components/KPIDashboard';
import { VisibilityFilter } from '@/components/VisibilityFilter';

export default function DashboardPage() {
  const { user } = useUser(); // Current user + role
  const { posts, filters, setFilters } = usePosts(); // Role-aware fetching
  
  return (
    <div className="space-y-6">
      <header>
        <h1>Posts do Evento</h1>
        <AdminModeToggle /> {/* Se role === GESTOR */}
      </header>
      
      <VisibilityFilter value={filters.view} onChange={...} />
      {/* View options depend on role:
          - Não vejo opção "ver todos" se não sou Gestor
          - Por padrão vejo apenas meus posts */}
      
      <KanbanBoard posts={posts} onStatusChange={...} />
      <KPIDashboard />
    </div>
  );
}
```

#### Hook: usePosts (role-aware)
```typescript
// src/hooks/usePosts.ts
"use client";

export function usePosts() {
  const { user } = useUser();
  const [filters, setFilters] = useState({
    view: user.role === Role.GESTOR ? 'all' : 'own',
    status: null,
    type: null,
    platform: null
  });

  // Fetch /posts?view=all|own&status=...
  // Backend filtra por responsável se view=own
  
  return { posts, filters, setFilters };
}
```

#### Kanban Board com dnd-kit
```typescript
// src/components/KanbanBoard.tsx
"use client";

import { DndContext, closestCorners, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { PostColumn } from './PostColumn';

const STATUSES = [
  'nao_iniciado', 'captando', 'editando', 'criando',
  'aprovacao', 'copy_capa', 'em_publicacao', 'publicado'
];

export function KanbanBoard({ posts, onStatusChange }: Props) {
  const { user } = useUser();
  
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    if (!over) return;
    
    const postId = active.id;
    const newStatus = over.id; // column id
    
    // Validar permissão
    if (!canAdvanceTo(user.role, newStatus)) {
      toast.error("Você não tem permissão para esta etapa");
      return;
    }
    
    // API call
    advancePostStatus(postId, newStatus)
      .then(() => onStatusChange(postId, newStatus))
      .catch(err => toast.error(err.message));
  }

  return (
    <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
      <div className="grid grid-cols-8 gap-4 overflow-x-auto">
        {STATUSES.map(status => (
          <SortableContext
            key={status}
            items={posts.filter(p => p.status === status).map(p => p.id)}
            strategy={verticalListSortingStrategy}
          >
            <PostColumn
              status={status}
              posts={posts.filter(p => p.status === status)}
            />
          </SortableContext>
        ))}
      </div>
    </DndContext>
  );
}
```

#### Post Card (draggable)
```typescript
// src/components/PostCard.tsx
"use client";

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function PostCard({ post }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
    id: post.id
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-4 rounded border cursor-grab ${isDragging ? 'opacity-50 ring-2' : ''}`}
    >
      <h3 className="font-bold">{post.title}</h3>
      <p className="text-sm text-gray-600">{post.platform}</p>
      <p className="text-xs text-gray-500">👤 {post.responsible.name}</p>
      <time className="text-xs text-gray-400">{new Date(post.updatedAt).toLocaleString('pt-BR')}</time>
    </div>
  );
}
```

### 4.4 Serviços Frontend

```typescript
// src/services/posts.service.ts
export const postsService = {
  list: (filters) => api.get('/posts', { params: filters }),
  get: (id) => api.get(`/posts/${id}`),
  create: (data) => api.post('/posts', data),
  update: (id, data) => api.patch(`/posts/${id}`, data),
  delete: (id) => api.delete(`/posts/${id}`),
  advanceStatus: (id, newStatus) => api.patch(`/posts/${id}/advance-status`, { newStatus }),
};

// src/services/reports.service.ts
export const reportsService = {
  dashboard: () => api.get('/reports/dashboard'),
  byUser: (userId) => api.get(`/reports/by-user/${userId}`),
  timeline: () => api.get('/reports/timeline'),
  export: (format) => api.get(`/reports/export?format=${format}`),
};
```

---

## 5. Real-Time Synchronization

### Opção A: Polling (Simples, sem dependências adicionais)
```typescript
// React Query / SWR com refetch interval
const { data: posts } = useQuery({
  queryKey: ['posts'],
  queryFn: () => postsService.list(filters),
  refetchInterval: 2000, // 2s = atende RNF-03
});
```

### Opção B: WebSockets (Melhor UX, mais complexo)
```typescript
// Socket.IO server em NestJS
@WebSocketGateway()
export class PostsGateway {
  @SubscribeMessage('posts:subscribe')
  onPostsSubscribe(client: Socket) {
    client.emit('posts:update', posts); // broadcast
  }
}

// Cliente
useEffect(() => {
  socket.on('posts:update', (newPosts) => {
    setPosts(newPosts);
  });
}, []);
```

**Recomendação**: Comece com **Polling** (RNF-03 = 2s). Migrar para WebSocket se houver gargalo.

---

## 6. Permissões e Controle de Acesso

### Matriz de Permissões

| Operação | Gestor | Designer | Social Media | Condição |
|----------|--------|----------|-------------|----------|
| Ver todos os posts | ✅ | ❌ | ❌ | Modo admin ativo |
| Ver apenas seus posts | ✅ | ✅ | ✅ | Default |
| Criar post | ✅ | ❌ | ❌ | - |
| Editar post | ✅ | ❌ | ❌ | - |
| Deletar post | ✅ | ❌ | ❌ | - |
| Avançar até "Aprovação" | ✅ | ✅ | ❌ | Designer only |
| Avançar de "Aprovação" → "Publicado" | ✅ | ❌ | ✅ | Social Media only |
| Reverter status | ✅ | ❌ | ❌ | Gestor only |
| Visualizar KPIs | ✅ | ✅ | ✅ | Role-aware |
| Exportar relatórios | ✅ | ❌ | ❌ | - |

### Implementação

#### Backend
```typescript
// src/auth/decorators/require-admin-mode.decorator.ts
export function RequireAdminMode() {
  return applyDecorators(
    UseGuards(JwtAuthGuard, AdminModeGuard),
  );
}

// posts.controller.ts
@Patch(':id')
@RequireAdminMode()
update(@Param('id') id: string, @Body() data: UpdatePostDto) {
  // Apenas Gestor em modo admin pode editar
}

@Patch(':id/advance-status')
advanceStatus(@User() user: JwtPayload, @Body() data: AdvanceStatusDto) {
  // Validar role antes de avançar
  this.postsService.advanceStatus(id, user.id, data.newStatus);
}
```

#### Frontend
```typescript
// src/lib/permissions.ts
export function canAdvanceTo(role: Role, targetStatus: PostStatus): boolean {
  const RESTRICTIONS = {
    [Role.DESIGNER]: ['nao_iniciado', 'captando', 'editando', 'criando', 'aprovacao'],
    [Role.SOCIAL_MEDIA]: ['aprovacao', 'copy_capa', 'em_publicacao', 'publicado'],
    [Role.GESTOR]: [/* all */],
  };
  
  return RESTRICTIONS[role]?.includes(targetStatus) ?? false;
}

export function canEditPost(role: Role): boolean {
  return role === Role.GESTOR;
}
```

---

## 7. Timeline e Fases de Implementação

### Fase 1: Backend Scaffold & Data Model (1-2 dias)
- [x] Design entidades (Post, Evento, PostStatusHistory)
- [ ] Criar migrations TypeORM
- [ ] Implementar PostsController + PostsService
- [ ] Validação de permissões com @Roles()
- [ ] Seed de dados de teste

### Fase 2: Frontend Dashboard Base (2-3 dias)
- [ ] Criar page /dashboard
- [ ] Implementar listagem de posts com filtros
- [ ] Integrar KPIDashboard (leitura de /reports/dashboard)
- [ ] Página de criação/edição (Gestor)

### Fase 3: Drag-and-Drop & Pipeline (2-3 dias)
- [ ] Instalar @dnd-kit
- [ ] Implementar KanbanBoard com 8 colunas
- [ ] Integrar PATCH /posts/:id/advance-status
- [ ] Validação de permissões no drag
- [ ] Feedback visual (loading, erros)

### Fase 4: Real-Time Sync (1-2 dias)
- [ ] Implementar polling (2s) via React Query
- [ ] WebSocket como evolução (opcional)
- [ ] Timestamp automático de mudanças

### Fase 5: Eventos & Cronômetro (1-2 dias)
- [ ] Entidade Evento + migrations
- [ ] EventosController (CRUD + start/pause/reset)
- [ ] Timer UI (relógio + contador)
- [ ] Página /eventos/[id]/timeline

### Fase 6: Reports & Analytics (1-2 dias)
- [ ] ReportsService + endpoints
- [ ] KPI cards (total, %, por responsável)
- [ ] Gráficos (tempo médio por etapa, productivity)
- [ ] Export CSV/PDF

### Fase 7: QA & Refinement (1-2 dias)
- [ ] Testes de permissões
- [ ] Performance (100+ posts)
- [ ] Mobile responsividade
- [ ] Deploy Docker

**Total estimado**: 10-16 dias (2-3 sprints)

---

## 8. Dependências a Adicionar

### Backend (package.json)
```json
{
  "@nestjs/websockets": "^11.x",    // WebSockets (opcional, Fase 4)
  "socket.io": "^4.x",              // Idem
  "class-validator": "^0.x",        // Já tem
  "typeorm": "^0.3.x",              // Já tem
}
```

### Frontend (package.json)
```json
{
  "@dnd-kit/core": "^8.x",
  "@dnd-kit/sortable": "^8.x",
  "@dnd-kit/utilities": "^3.x",
  "@tanstack/react-query": "^5.x",  // Já tem?
  "recharts": "^2.x",               // Gráficos (Fase 6)
  "jspdf": "^2.x",                  // Export PDF (Fase 6)
}
```

---

## 9. Checklist de Configuração Inicial

- [ ] Criar branch `feature/dashboard-eventos`
- [ ] Limpar módulos não usados (Cart, Payments, Orders, Releases)
- [ ] Atualizar User entity com enum Role
- [ ] Criar migrações para Post, Evento, PostStatusHistory
- [ ] Instalar dependências drag-and-drop
- [ ] Preparar mocks/fixtures de teste
- [ ] Configurar WebSocket (se escolher opção B)

---

## 10. Próximos Passos

1. **Validar este plano** com o time
2. **Iniciar Fase 1** (backend scaffold)
3. **Criar issues/tasks** com user stories para cada feature
4. **Configurar CI/CD** para validação (lint, tests, build)

---

## Anexo: Perguntas de Clarificação

- [ ] Usar Polling vs WebSockets? (recomendo polling v1)
- [ ] Limite de posts simultâneos (>100)? Como distribuir?
- [ ] Cache local para offline? (RNF-08)
- [ ] Email notifications ao avançar status?
- [ ] Integração com ferramentas externas (Slack, Google Sheets)?

