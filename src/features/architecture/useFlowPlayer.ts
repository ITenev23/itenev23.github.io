import { useCallback, useEffect, useState } from "react";
import type { ArchFlow } from "@/content";

const STEP_MS = 3800;

/** Steps through a flow's edges, auto-advancing while playing. */
export function useFlowPlayer(flows: ArchFlow[], initial?: string) {
  const [flowId, setFlowId] = useState<string | null>(
    flows.some((f) => f.id === initial) ? (initial ?? null) : null,
  );
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(flowId !== null);

  const flow = flows.find((f) => f.id === flowId) ?? null;
  const last = flow ? flow.steps.length - 1 : 0;

  useEffect(() => {
    if (!flow || !playing) return;
    const t = setTimeout(() => {
      if (index < last) setIndex(index + 1);
      else setPlaying(false);
    }, STEP_MS);
    return () => clearTimeout(t);
  }, [flow, playing, index, last]);

  const start = useCallback((id: string) => {
    setFlowId(id);
    setIndex(0);
    setPlaying(true);
  }, []);

  const stop = useCallback(() => {
    setFlowId(null);
    setPlaying(false);
  }, []);

  return {
    flow,
    index,
    step: flow?.steps[index] ?? null,
    playing,
    start,
    stop,
    toggle: () => {
      if (!playing && index === last) setIndex(0);
      setPlaying(!playing);
    },
    next: () => {
      setPlaying(false);
      setIndex(Math.min(index + 1, last));
    },
    prev: () => {
      setPlaying(false);
      setIndex(Math.max(index - 1, 0));
    },
  };
}

export type FlowPlayer = ReturnType<typeof useFlowPlayer>;
