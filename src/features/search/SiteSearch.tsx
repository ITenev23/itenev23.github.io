import { useNavigate } from "@tanstack/react-router";
import { clsx } from "clsx";
import { Command } from "cmdk";
import { useEffect, useRef, useState } from "react";
import { caseStudies, profile, projectBySlug, projects, skillById } from "@/content";
import { setAgentShown, useAgentShown } from "@/shared/lib/agentDock";
import { modKey } from "@/shared/lib/env";
import { resumePdf } from "@/shared/ui/DownloadCv";

type Props = { open: boolean; onOpenChange: (open: boolean) => void };

const itemClass =
  "flex cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2 text-sm data-[selected=true]:bg-matrix/10 data-[selected=true]:text-matrix";
// The placeholder takes turns through famous lines from The Matrix. "Follow the white rabbit" (the hero's scroll cue) and "There is no spoon" (no
// results, below) are used elsewhere, so each line lives in one place.
const hints = [
  "Are you looking for me?",
  "What is the Matrix?",
  "Free your mind.",
  "I know kung fu.",
  "Welcome to the real world.",
];
const HINT_MS = 3000;

// What an item matches on: its title plus the names of its technologies.
const skillNames = (ids: string[]) => ids.map((id) => skillById.get(id)?.name ?? id).join(" ");

// Each typed word must start a word in the item, and plurals count ("exports" finds
// "export"). The default fuzzy letter matching found "ai" inside "appraisal"; whole words
// are what people mean on a site like this.
function matchWords(value: string, search: string) {
  const words = value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
  const terms = search
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
  const hit = (t: string) =>
    words.some((w) => w.startsWith(t) || (w.length >= 4 && t.startsWith(w)));
  return terms.every(hit) ? 1 : 0;
}

const groupClass = "text-xs text-muted [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2";

/**
 * The site search: a bar in the middle of the nav. Type, and matching pages, sections,
 * projects, case studies and board walkthroughs appear in a list under it; Enter or a click
 * goes there, Esc clears. No dialog. While idle, the placeholder rotates through famous lines
 * from The Matrix. ⌘K / Ctrl K jumps into it. Below the large breakpoint
 * the nav has no room for a bar, so a magnifier (in the nav) opens it across the nav itself:
 * `open` is that state.
 */
export function SiteSearch({ open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const agentShown = useAgentShown();
  const [hint, setHint] = useState(0);

  // Rotate the hint only while the bar is idle, so it never changes under someone typing.
  useEffect(() => {
    if (focused || query) return;
    const id = window.setInterval(() => setHint((h) => (h + 1) % hints.length), HINT_MS);
    return () => window.clearInterval(id);
  }, [focused, query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(true);
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onOpenChange]);

  // Opened from the magnifier on small screens: straight into typing.
  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  const close = () => {
    setQuery("");
    onOpenChange(false);
    input.current?.blur();
  };
  const run = (fn: () => void) => {
    close();
    fn();
  };
  const goToSection = (id: string) => run(() => navigate({ to: "/", hash: id }));
  const showList = focused && query.trim().length > 0;

  return (
    <form
      aria-label="Site search"
      onSubmit={(e) => e.preventDefault()}
      className={clsx(
        "lg:flex lg:min-w-0 lg:flex-1 lg:justify-center",
        open
          ? "max-lg:fixed max-lg:inset-x-0 max-lg:top-0 max-lg:z-50 max-lg:flex max-lg:h-16 max-lg:items-center max-lg:gap-3 max-lg:border-line/60 max-lg:border-b max-lg:bg-bg/95 max-lg:px-6 max-lg:backdrop-blur-md"
          : "max-lg:hidden",
      )}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
        setFocused(false);
        onOpenChange(false);
      }}
    >
      <Command
        label="Search the site"
        loop
        filter={matchWords}
        className="relative w-full lg:max-w-xs"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted"
        >
          <circle cx={11} cy={11} r={7} />
          <path d="M20 20 L16 16" />
        </svg>
        <Command.Input
          ref={input}
          value={query}
          onValueChange={setQuery}
          onKeyDown={(e) => {
            if (e.key !== "Escape") return;
            if (query) setQuery("");
            else close();
          }}
          placeholder={hints[hint]}
          aria-keyshortcuts={modKey === "⌘" ? "Meta+K" : "Control+K"}
          className="w-full rounded-full border border-line bg-bg/60 py-1.5 pr-4 pl-8 font-mono text-[13px] text-fg outline-none transition-[border-color,box-shadow] placeholder:text-muted focus:border-matrix/50 focus:shadow-[0_0_24px_-10px_var(--color-matrix)]"
        />
        {showList && (
          <Command.List
            // Keep the focus in the input while an item is clicked, or the list would close first.
            onMouseDown={(e) => e.preventDefault()}
            className="absolute top-full left-1/2 mt-2 max-h-80 w-[min(calc(100vw-3rem),28rem)] -translate-x-1/2 overflow-y-auto rounded-xl border border-matrix/20 bg-surface p-2 shadow-2xl shadow-matrix/5"
          >
            <Command.Empty className="px-3 py-6 text-center text-muted text-sm">
              Nothing found. There is no spoon.
            </Command.Empty>

            <Command.Group heading="Navigate" className={groupClass}>
              <Command.Item
                className={itemClass}
                onSelect={() => run(() => navigate({ to: "/projects" }))}
              >
                All projects
              </Command.Item>
              <Command.Item className={itemClass} onSelect={() => goToSection("work")}>
                Selected work
              </Command.Item>
              <Command.Item className={itemClass} onSelect={() => goToSection("problem-solving")}>
                Problem solving
              </Command.Item>
              <Command.Item className={itemClass} onSelect={() => goToSection("skills")}>
                Skills and evidence
              </Command.Item>
              <Command.Item className={itemClass} onSelect={() => goToSection("experience")}>
                Experience and education
              </Command.Item>
              <Command.Item
                className={itemClass}
                onSelect={() => run(() => navigate({ to: "/certifications" }))}
              >
                Certifications and courses
              </Command.Item>
              <Command.Item
                className={itemClass}
                onSelect={() => run(() => setAgentShown(!agentShown))}
              >
                {agentShown ? "Hide the agent" : "Show the agent"}
              </Command.Item>
              <Command.Item
                className={itemClass}
                onSelect={() => run(() => navigate({ to: "/colophon" }))}
              >
                How this site is built
              </Command.Item>
              <Command.Item
                className={itemClass}
                onSelect={() => run(() => navigate({ to: "/cv" }))}
              >
                CV
              </Command.Item>
              <Command.Item
                className={itemClass}
                onSelect={() => run(() => window.location.assign(resumePdf.href))}
              >
                Grab my CV
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Projects" className={groupClass}>
              {projects.map((p) => (
                <Command.Item
                  key={p.slug}
                  value={`${p.name} ${p.domain} ${skillNames(p.skills)}`}
                  className={itemClass}
                  onSelect={() =>
                    run(() => navigate({ to: "/projects/$project", params: { project: p.slug } }))
                  }
                >
                  {p.name}
                  <span className="font-mono text-[11px] text-muted">{p.role}</span>
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="Case studies" className={groupClass}>
              {caseStudies.map((c) => (
                <Command.Item
                  key={c.slug}
                  value={`${c.title} ${skillNames(c.skills)}`}
                  className={itemClass}
                  onSelect={() =>
                    run(() =>
                      navigate({
                        to: "/projects/$project/$study",
                        params: { project: c.project, study: c.slug },
                      }),
                    )
                  }
                >
                  {c.title}
                  <span className="font-mono text-[11px] text-muted">
                    {projectBySlug.get(c.project)?.name}
                  </span>
                </Command.Item>
              ))}
            </Command.Group>

            {/* Every board's flows, grouped by project. */}
            {projects
              .filter((p) => p.architecture?.flows.length)
              .map((p) => (
                <Command.Group
                  key={p.slug}
                  heading={`Walk through a request · ${p.name}`}
                  className={groupClass}
                >
                  {p.architecture?.flows.map((f) => (
                    <Command.Item
                      key={f.id}
                      value={`${p.name} ${f.label}`}
                      className={itemClass}
                      onSelect={() =>
                        run(() =>
                          navigate({
                            to: "/projects/$project",
                            params: { project: p.slug },
                            search: { flow: f.id },
                            hash: "architecture",
                          }),
                        )
                      }
                    >
                      ▶ {f.label}
                    </Command.Item>
                  ))}
                </Command.Group>
              ))}

            <Command.Group heading="Elsewhere" className={groupClass}>
              {profile.socials.map((s) => (
                <Command.Item
                  key={s.href}
                  className={itemClass}
                  onSelect={() => run(() => window.open(s.href, "_blank", "noopener"))}
                >
                  {s.label} <span className="text-muted">↗</span>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        )}
      </Command>
      {open && (
        <button
          type="button"
          onClick={close}
          aria-label="Close search"
          className="shrink-0 text-lg text-muted hover:text-matrix lg:hidden"
        >
          ×
        </button>
      )}
    </form>
  );
}
