import type { ReactNode } from "react";

/**
 * The page-long green line the home page is read along. The line, its glowing
 * head, and every chapter's node are CSS scroll-driven animations (styles.css,
 * "The work line"), so they follow the scroll both ways with no JavaScript.
 */
export function WorkLine({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-6">
      <div className="workline [--rail:0.45rem] md:[--rail:1rem]">
        <div className="workline-track" aria-hidden>
          <div className="workline-fill" />
          <div className="workline-head" />
        </div>
        {children}
      </div>
    </div>
  );
}
