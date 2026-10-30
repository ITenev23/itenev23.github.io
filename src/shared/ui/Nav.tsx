import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { agentLines, profile } from "@/content";
import { AgentMark } from "./Agent";
import { DecodeText } from "./DecodeText";
import { hasSocialIcon, SocialIcon } from "./SocialIcon";

/**
 * The top bar: the agent's head and the name, the site search in the middle (passed in by the
 * layout, since it is a feature), links, and profile icons. Below the large breakpoint the
 * search is a magnifier that opens the bar across the nav.
 */
export function Nav({ search, onOpenSearch }: { search: ReactNode; onOpenSearch: () => void }) {
  const link = "hover:text-matrix [&.active]:text-matrix";
  return (
    <nav className="fixed inset-x-0 top-0 z-40 border-line/60 border-b bg-bg/70 backdrop-blur-md print:hidden">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-6">
        <Link
          to="/"
          className="group/logo relative flex items-center gap-2 font-mono font-semibold text-sm tracking-tight"
        >
          {/* The agent's head as the site's mark; left out on the narrowest phones for room. */}
          <AgentMark className="hidden size-6 text-matrix transition-[filter] duration-300 [filter:drop-shadow(0_0_4px_color-mix(in_oklab,var(--color-matrix)_45%,transparent))] group-hover/logo:[filter:drop-shadow(0_0_8px_var(--color-matrix))] min-[380px]:block" />
          {/* The name glows green; under the pointer it turns green too. */}
          <span className="transition-[color,text-shadow] duration-300 [text-shadow:0_0_8px_color-mix(in_oklab,var(--color-matrix)_95%,transparent),0_0_20px_color-mix(in_oklab,var(--color-matrix)_60%,transparent)] group-hover/logo:text-matrix group-hover/logo:[text-shadow:0_0_12px_var(--color-matrix),0_0_26px_color-mix(in_oklab,var(--color-matrix)_50%,transparent)]">
            <DecodeText text={profile.name.toLowerCase().replace(" ", ".")} />
            <span className="text-matrix">_</span>
          </span>
          {/* Under the pointer (or keyboard focus) the little head has a word to say. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-full left-0 mt-3 translate-y-1 whitespace-nowrap rounded-lg border border-matrix/40 bg-bg/90 px-2.5 py-1 font-normal text-[11px] text-matrix opacity-0 shadow-[0_0_20px_-8px_var(--color-matrix)] backdrop-blur transition-[opacity,transform] duration-200 before:absolute before:-top-1 before:left-2.5 before:size-2 before:rotate-45 before:border-matrix/40 before:border-t before:border-l before:bg-bg group-hover/logo:translate-y-0 group-hover/logo:opacity-100 group-focus-visible/logo:translate-y-0 group-focus-visible/logo:opacity-100"
          >
            {agentLines.hover}
          </span>
        </Link>
        {search}
        <div className="flex shrink-0 items-center gap-3 text-muted text-sm sm:gap-6">
          <Link to="/" hash="work" className={link}>
            <DecodeText text="Work" delay={60} />
          </Link>
          <Link to="/projects" className={`${link} hidden sm:inline`}>
            <DecodeText text="Projects" delay={100} />
          </Link>
          <Link to="/cv" className={link}>
            <DecodeText text="CV" delay={140} />
          </Link>
          <Link to="/certifications" className={`${link} hidden md:inline`}>
            <DecodeText text="Certifications" delay={180} />
          </Link>
          {/* Small screens: the search bar has no room here, so a magnifier opens it. */}
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Search"
            className="hover:text-matrix lg:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              aria-hidden="true"
              className="size-4"
            >
              <circle cx={11} cy={11} r={7} />
              <path d="M20 20 L16 16" />
            </svg>
          </button>
          <Link to="/colophon" className={`${link} hidden sm:inline`}>
            <DecodeText text="How it's built" delay={260} />
          </Link>
          <span aria-hidden className="hidden h-4 w-px bg-line sm:block" />
          <div className="flex items-center gap-2.5 sm:gap-3">
            {profile.socials
              .filter((s) => hasSocialIcon(s.label))
              .map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  title={s.label}
                  className="transition-[color,filter] duration-200 hover:text-matrix hover:[filter:drop-shadow(0_0_6px_var(--color-matrix))]"
                >
                  <SocialIcon label={s.label} className="size-4" />
                </a>
              ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
