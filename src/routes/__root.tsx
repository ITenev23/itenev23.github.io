import { createRootRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { clsx } from "clsx";
import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { AgentDock } from "@/features/agent/AgentDock";

import { LostAgent } from "@/features/not-found/LostAgent";
import { SiteSearch } from "@/features/search/SiteSearch";
import { useIdle } from "@/shared/lib/useIdle";
import { useTitle } from "@/shared/lib/useTitle";
import { Footer } from "@/shared/ui/Footer";
import { MatrixRain } from "@/shared/ui/MatrixRain";
import { Nav } from "@/shared/ui/Nav";
import { ScrollProgress } from "@/shared/ui/ScrollProgress";

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
});

function RootLayout() {
  // The search bar opened across the nav on small screens (wide screens always show it).
  const [searchOpen, setSearchOpen] = useState(false);
  // The home page has its own progress indicator: the work line.
  const home = useRouterState({ select: (s) => s.location.pathname === "/" });
  // The rain is decoration: it starts once the first page is idle, then keeps falling behind
  // every page. This layout never unmounts, so it carries on across navigation too.
  const idle = useIdle();
  const reduced = useReducedMotion() ?? false;
  // Vivid behind the hero; a quiet texture behind everything people read.
  const [atTop, setAtTop] = useState(true);
  useEffect(() => {
    const check = () => setAtTop(window.scrollY < window.innerHeight * 0.5);
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, []);

  return (
    <>
      {idle && (
        <MatrixRain
          animate={!reduced}
          // Fixed to the screen, so the content scrolls over it. lvh, not dvh: a phone's
          // address bar sliding away mustn't resize the canvas and restart the rain.
          className={clsx(
            "rain-in pointer-events-none fixed inset-x-0 top-0 -z-20 h-lvh w-full transition-opacity duration-700 print:hidden",
            home && atTop ? "opacity-40" : "opacity-15",
          )}
        />
      )}
      <Nav
        search={<SiteSearch open={searchOpen} onOpenChange={setSearchOpen} />}
        onOpenSearch={() => setSearchOpen(true)}
      />
      {!home && <ScrollProgress />}
      <main>
        <Outlet />
      </main>
      <Footer />
      {/* The companion agent: decoration, so he too waits for the page to be idle. */}
      {idle && <AgentDock />}
    </>
  );
}

function NotFound() {
  useTitle("Page not found");
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    // The lost agent is here already, so the docked one stays away (data-agent-home).
    <div
      data-agent-home
      className="grid min-h-dvh place-items-center px-6 pt-16 text-center font-mono"
    >
      <div>
        <LostAgent className="mx-auto size-44 text-matrix [filter:drop-shadow(0_0_10px_color-mix(in_oklab,var(--color-matrix)_45%,transparent))] md:size-52" />
        <p className="mt-2 font-semibold text-7xl text-pink">404</p>
        <p className="mt-4 text-muted">This page doesn't exist, or it has moved.</p>
        {/* The missing path as a shell would report it; React escapes it as text. */}
        <p className="mx-auto mt-6 max-w-md rounded-lg [overflow-wrap:anywhere] border border-line bg-surface/70 px-4 py-3 text-left text-muted text-xs leading-relaxed">
          <span className="text-matrix">$</span> cd {path}
          <br />
          cd: {path}: No such file or directory
        </p>
        <Link to="/" className="mt-8 inline-block text-matrix hover:underline">
          ← back to the home page
        </Link>
      </div>
    </div>
  );
}
