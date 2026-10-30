import { motion } from "motion/react";
import { useState } from "react";
import { profile } from "@/content";
import { scrollToId } from "@/shared/lib/scroll";
import { useIdle } from "@/shared/lib/useIdle";
import { DecodeText } from "@/shared/ui/DecodeText";
import { DownloadCv } from "@/shared/ui/DownloadCv";
import { type AgentCue, HeroAgent } from "./HeroAgent";

const nameGradient = "bg-gradient-to-br from-fg via-fg to-matrix bg-clip-text text-transparent";

/** The first screen. Its background is the site-wide Matrix rain (see the root layout). */
export function Hero() {
  // The agent is decoration: like the rain, he arrives once the page is idle. His space is
  // reserved from the start, so nothing shifts when he does.
  const idle = useIdle();
  const [cue, setCue] = useState<AgentCue>(null);
  const cueProps = (c: AgentCue) => ({
    onPointerEnter: () => setCue(c),
    onPointerLeave: () => setCue(null),
    onFocus: () => setCue(c),
    onBlur: () => setCue(null),
  });

  return (
    // The agent's home: the docked companion stays away while the hero is in view.
    <header data-agent-home className="relative grid min-h-dvh items-center overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pt-16 lg:flex-row lg:items-center lg:justify-between"
      >
        <div className="max-w-2xl">
          {/* Words from Neo's screen in The Matrix; the scroll cue's white rabbit follows them. */}
          <p
            aria-hidden="true"
            className="font-mono text-matrix text-sm [text-shadow:0_0_16px_color-mix(in_oklab,var(--color-matrix)_55%,transparent)]"
          >
            <DecodeText text="> the Matrix has you…" />
          </p>
          {/* The gradient lives on the name itself, so the decoding noise can wear it too. */}
          <h1 className="mt-4 font-extrabold text-6xl tracking-tighter md:text-8xl">
            <DecodeText
              text={profile.name}
              delay={150}
              className={nameGradient}
              overlayClassName={nameGradient}
            />
          </h1>
          {/* The title, and a joke written as a code comment. */}
          <p className="mt-5 font-mono text-base md:text-lg">
            <span className="text-matrix [text-shadow:0_0_16px_color-mix(in_oklab,var(--color-matrix)_55%,transparent)]">
              <DecodeText text={profile.headline} delay={300} />
            </span>
            {profile.tagline && (
              <span className="text-muted">
                {" "}
                <DecodeText
                  text={`// ${profile.tagline}`}
                  delay={380}
                  className="whitespace-nowrap"
                />
              </span>
            )}
          </p>
          <p className="mt-6 max-w-xl text-fg/90 text-lg leading-relaxed md:text-xl">
            <DecodeText text={profile.intro} delay={450} wrap />
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => scrollToId("work")}
              {...cueProps("point")}
              className="rounded-full bg-matrix px-5 py-2.5 font-medium text-bg shadow-[0_0_32px_-8px_var(--color-matrix)] transition-transform hover:-translate-y-0.5"
            >
              <DecodeText text="Explore my work ↓" delay={600} />
            </button>
            <DownloadCv
              {...cueProps("paper")}
              className="rounded-full border border-matrix/40 bg-bg/40 px-5 py-2.5 text-matrix backdrop-blur transition-colors hover:bg-matrix/10"
            >
              <DecodeText text="Grab my CV ↓" delay={650} />
            </DownloadCv>
          </div>
        </div>

        <div className="aspect-[240/150] w-64 shrink-0 sm:w-72 lg:w-80 xl:w-[26rem]">
          {idle && (
            <div className="rain-in">
              <HeroAgent cue={cue} />
            </div>
          )}
        </div>
      </motion.div>

      {/* A thin line with a falling light: the work line starts here. The label is a Matrix nod,
          paired with the red pill under the name. */}
      <button
        type="button"
        onClick={() => scrollToId("work")}
        aria-label="Scroll to my work"
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] text-muted uppercase tracking-[0.3em] transition-colors hover:text-matrix sm:flex"
      >
        <DecodeText text="follow the white rabbit" delay={750} />
        <span className="relative h-12 w-px overflow-hidden bg-line">
          <span className="scroll-cue absolute inset-x-0 top-0 h-1/3 bg-matrix shadow-[0_0_8px_var(--color-matrix)]" />
        </span>
      </button>
    </header>
  );
}
