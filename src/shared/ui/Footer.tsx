import { Link } from "@tanstack/react-router";
import { profile } from "@/content";
import { DownloadCv } from "./DownloadCv";

export function Footer() {
  return (
    <footer className="border-line border-t print:hidden">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-10 font-mono text-muted text-xs">
        <p>
          {profile.name} · {profile.headline} · {profile.location}
        </p>
        {/* Links wrap as whole items on narrow screens, never mid-label. */}
        <div className="flex flex-wrap gap-x-5 gap-y-2 *:whitespace-nowrap">
          {profile.socials.map((s) => (
            <a
              key={s.href}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="hover:text-fg"
            >
              {s.label} ↗
            </a>
          ))}
          <DownloadCv className="hover:text-fg">CV ↓</DownloadCv>
          <Link to="/colophon" className="hover:text-fg">
            how this site is built
          </Link>
        </div>
      </div>
    </footer>
  );
}
