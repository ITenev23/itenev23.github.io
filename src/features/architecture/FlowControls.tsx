import { clsx } from "clsx";
import type { ArchFlow } from "@/content";
import type { FlowPlayer } from "./useFlowPlayer";

export function FlowPicker({ flows, player }: { flows: ArchFlow[]; player: FlowPlayer }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 font-mono text-[11px] text-muted">walk through a request</span>
      {flows.map((f) => {
        const active = player.flow?.id === f.id;
        return (
          <button
            key={f.id}
            type="button"
            onClick={() => (active ? player.stop() : player.start(f.id))}
            aria-pressed={active}
            className={clsx(
              "rounded-full border px-3 py-1.5 text-xs transition-colors",
              active
                ? "border-matrix bg-matrix/10 text-matrix"
                : "border-line text-muted hover:border-matrix/60 hover:text-fg",
            )}
          >
            {active ? "■" : "▶"} {f.label}
          </button>
        );
      })}
    </div>
  );
}

export function FlowStep({ player }: { player: FlowPlayer }) {
  const { flow, step, index } = player;
  if (!flow || !step) return null;
  const btn =
    "rounded-md border border-line px-2.5 py-1 font-mono text-xs text-muted transition-colors hover:border-matrix hover:text-fg disabled:opacity-30";

  return (
    <div>
      <p className="font-mono text-matrix text-xs">
        ▶ {flow.label} · step {index + 1} / {flow.steps.length}
      </p>
      <div className="mt-3 flex gap-1" aria-hidden>
        {flow.steps.map((s, i) => (
          <span
            key={`${s.from}-${s.to}`}
            className={clsx("h-1 flex-1 rounded-full", i <= index ? "bg-matrix" : "bg-line")}
          />
        ))}
      </div>
      <p className="mt-4 text-[15px] leading-relaxed" aria-live="polite">
        {step.caption}
      </p>
      <div className="mt-5 flex items-center gap-2">
        <button type="button" className={btn} onClick={player.prev} disabled={index === 0}>
          ← prev
        </button>
        <button type="button" className={btn} onClick={player.toggle}>
          {player.playing ? "pause" : index === flow.steps.length - 1 ? "replay" : "play"}
        </button>
        <button
          type="button"
          className={btn}
          onClick={player.next}
          disabled={index === flow.steps.length - 1}
        >
          next →
        </button>
        <button type="button" className={clsx(btn, "ml-auto")} onClick={player.stop}>
          stop
        </button>
      </div>
    </div>
  );
}
