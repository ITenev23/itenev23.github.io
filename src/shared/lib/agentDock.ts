import { useSyncExternalStore } from "react";

// Whether the docked agent is shown: the visitor can hide him (his ×, or search)
// and the choice is remembered. Storage may be blocked; he then simply shows.
const KEY = "agent-dock";
const listeners = new Set<() => void>();

function read(): boolean {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

let shown = typeof window === "undefined" ? true : read();

export function setAgentShown(value: boolean) {
  shown = value;
  try {
    localStorage.setItem(KEY, value ? "on" : "off");
  } catch {
    // Not remembered; it still applies for this visit.
  }
  for (const listener of listeners) listener();
}

export function useAgentShown(): boolean {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => shown,
    () => true,
  );
}
