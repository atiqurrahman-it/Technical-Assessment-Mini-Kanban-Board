"use client";

import { createContext, useContext, useState } from "react";
import { createPortal } from "react-dom";

const HeaderSlotTargetContext = createContext<HTMLDivElement | null>(null);
const SetHeaderSlotTargetContext = createContext<(node: HTMLDivElement | null) => void>(() => {});

/** Wraps the app so `AppHeader` (rendered once by `CustomLayout`) and any page's `HeaderSlot` can find each other. */
export function HeaderSlotProvider({ children }: { children: React.ReactNode }) {
  const [target, setTarget] = useState<HTMLDivElement | null>(null);

  return (
    <SetHeaderSlotTargetContext.Provider value={setTarget}>
      <HeaderSlotTargetContext.Provider value={target}>{children}</HeaderSlotTargetContext.Provider>
    </SetHeaderSlotTargetContext.Provider>
  );
}

/** Mount point rendered inside `AppHeader` — where page-specific header content ends up. */
export function HeaderSlotTarget() {
  const setTarget = useContext(SetHeaderSlotTargetContext);
  return <div ref={setTarget} style={{ display: "contents" }} />;
}

/** Used by a page to inject content (e.g. a board name) into the fixed `AppHeader`. */
export function HeaderSlot({ children }: { children: React.ReactNode }) {
  const target = useContext(HeaderSlotTargetContext);
  if (!target) return null;
  return createPortal(children, target);
}
