"use client";

import { useEffect, useState } from "react";
import {
  getHeadView,
  type HeadView,
  subscribeHeadView,
} from "@/src/lib/headView";

// Reactive read of the Head's chosen board view, kept in sync across the Nav
// badge dropdown and the dashboard.
export function useHeadView(): HeadView {
  const [view, setView] = useState<HeadView>("kanban");

  useEffect(() => {
    setView(getHeadView());
    return subscribeHeadView(() => setView(getHeadView()));
  }, []);

  return view;
}
