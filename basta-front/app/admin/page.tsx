"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { mailerService } from "@/src/services/mailer.service";
import { orderService, type Order, type OrderStatus, type OrderStats } from "@/src/services/order.service";
import Pagination from "@/app/components/Pagination";
import { Alert } from "@/app/components/Alert";

function parseTokenPayload(token: string) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  RESERVADO: "Reservado",
  PAGO: "Pago",
  EM_SEPARACAO: "Em separação",
  ENVIADO: "Enviado",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  RESERVADO: "bg-yellow-900 text-yellow-200",
  PAGO: "bg-green-900 text-green-200",
  EM_SEPARACAO: "bg-blue-900 text-blue-200",
  ENVIADO: "bg-purple-900 text-purple-200",
  ENTREGUE: "bg-emerald-900 text-emerald-200",
  CANCELADO: "bg-red-900 text-red-200",
};

function getLastSixMonths(): { value: string; label: string }[] {
  const months = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("pt-BR", { month: "long", year: "numeric" });
    months.push({ value, label });
  }
  return months;
}

export default function AdminPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [alert, setAlert] = useState<{ message: string; variant: "error" | "success" } | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [page, setPage] = useState(1);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Admin-only guard
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) { router.replace("/login"); return; }
    const payload = parseTokenPayload(token);
    if (payload?.role !== "admin") { router.replace("/"); return; }
  }, [router]);

  // Debounce search
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [search]);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [statusFilter, selectedMonth]);

  // Fetch stats once on mount
  useEffect(() => {
    orderService.getStats().then((res: any) => {
      setStats(res?.data ?? res);
    });
  }, []);

  // Fetch orders on param change
  useEffect(() => {
    setIsLoading(true);
    orderService
      .getAll({
        page,
        limit: 10,
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
        month: selectedMonth || undefined,
      })
      .then((res) => {
        setOrders(res?.items ?? []);
        setTotal(res?.total ?? 0);
        setTotalPages(res?.totalPages ?? 1);
      })
      .finally(() => setIsLoading(false));
  }, [page, debouncedSearch, statusFilter, selectedMonth]);

  const handleStatusChange = async (orderId: number, status: OrderStatus) => {
    try {
      const res: any = await orderService.updateStatus(orderId, status);
      const updated = res?.data ?? res;
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: updated.status } : o))
      );
      try {
        await mailerService.sendOrderStatus(orderId, status);
      } catch {
        setAlert({ message: "Status atualizado, mas não foi possível enviar o email.", variant: "error" });
      }
    } catch {
      setAlert({ message: "Erro ao atualizar status.", variant: "error" });
    }
  };

  const months = getLastSixMonths();

  return (
    <section className="w-full min-h-screen bg-black px-6 py-10 text-white sm:px-10 sm:py-16">
      {alert && (
        <Alert message={alert.message} variant={alert.variant} className="mx-auto w-full max-w-6xl" />
      )}
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <h1 className="text-3xl font-bold">Painel do administrador</h1>

        {/* Stats cards */}
        {stats && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                Pedidos este mês
              </p>
              <p className="mt-2 text-3xl font-bold">{stats.totalOrdersThisMonth}</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                Receita este mês
              </p>
              <p className="mt-2 text-3xl font-bold">
                R$ {Number(stats.revenueThisMonth).toFixed(2)}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                Por status
              </p>
              <div className="mt-2 space-y-1">
                {Object.entries(stats.byStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between text-sm">
                    <span className="text-zinc-300">
                      {STATUS_LABELS[status as OrderStatus] ?? status}
                    </span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
                {Object.keys(stats.byStatus).length === 0 && (
                  <p className="text-sm text-zinc-500">Sem pedidos.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Pedidos</h2>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:outline-none"
          >
            <option value="">Todos os meses</option>
            {months.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        {/* Search + status filter */}
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Buscar por ID ou nome do cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-600"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "")}
            className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:outline-none"
          >
            <option value="">Todos os status</option>
            {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((key) => (
              <option key={key} value={key}>{STATUS_LABELS[key]}</option>
            ))}
          </select>
          {(search || statusFilter || selectedMonth) && (
            <button
              onClick={() => { setSearch(""); setStatusFilter(""); setSelectedMonth(""); }}
              className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 hover:text-white focus:outline-none"
            >
              Limpar filtros
            </button>
          )}
        </div>

        {/* Results count */}
        <p className="text-xs text-zinc-500">
          {total} pedido(s) encontrado(s)
          {totalPages > 1 && ` · Página ${page} de ${totalPages}`}
        </p>

        {/* Orders list */}
        {isLoading ? (
          <p className="text-sm text-zinc-400">Carregando...</p>
        ) : orders.length === 0 ? (
          <p className="text-sm text-zinc-400">Nenhum pedido encontrado.</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900"
              >
                {/* Row */}
                <div
                  className="flex cursor-pointer items-center gap-4 p-4"
                  onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                >
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">
                      #{order.id} · {order.user?.fullName ?? "—"}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {new Date(order.createdAt).toLocaleDateString("pt-BR")} ·{" "}
                      {order.items?.length ?? 0} item(s) · R${" "}
                      {Number(order.total).toFixed(2)}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      STATUS_COLORS[order.status] ?? "bg-zinc-800 text-zinc-300"
                    }`}
                  >
                    {STATUS_LABELS[order.status] ?? order.status}
                  </span>
                  <select
                    value={order.status}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                    className="rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-sm text-white focus:outline-none"
                  >
                    {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((key) => (
                      <option key={key} value={key}>{STATUS_LABELS[key]}</option>
                    ))}
                  </select>
                </div>

                {/* Expanded items */}
                {expandedId === order.id && (
                  <div className="border-t border-zinc-700 px-4 pb-4 pt-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                      Itens
                    </p>
                    <div className="space-y-2">
                      {order.items?.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 text-sm">
                          {item.productRelease?.imageFrontUrl && (
                            <img
                              src={item.productRelease.imageFrontUrl}
                              alt={item.productRelease.name}
                              className="h-10 w-10 rounded-md object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-white">
                              {item.productRelease?.name ?? "—"}
                            </p>
                            <p className="text-xs text-zinc-400">
                              {item.size} · {item.gender} · {item.color} · {item.quantity}x · R${" "}
                              {Number(item.price).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {order.address && (
                      <p className="mt-3 text-xs text-zinc-400">
                        Entrega: {order.address.street}, {order.address.number} —{" "}
                        {order.address.city}/{order.address.state}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </section>
  );
}
