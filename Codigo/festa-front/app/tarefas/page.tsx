"use client";

import { useEffect, useState } from "react";
import { OwnTasksView } from "@/app/components/OwnTasksView";
import { SimpleSchedule } from "@/app/tarefas/components/SimpleSchedule";
import { usePosts } from "@/src/hooks/usePosts";
import { useRouteGuard } from "@/src/hooks/useRouteGuard";
import { getUserId } from "@/src/lib/auth-client";

export default function TarefasPage() {
  const { isChecking } = useRouteGuard("individual-only");
  const { posts, isLoading, error, reload } = usePosts({});
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    setUserId(getUserId());
  }, []);

  if (isChecking || userId === null) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 pt-6 pb-60 sm:px-6">
      <h1 className="display mb-1 text-xl">MINHAS TAREFAS</h1>
      <p className="mono mb-5 text-[#6a6a6a]">Suas demandas atribuídas</p>

      <OwnTasksView
        posts={posts}
        userId={userId}
        isLoading={isLoading}
        error={error}
        onChanged={reload}
      />

      <SimpleSchedule />
    </div>
  );
}
