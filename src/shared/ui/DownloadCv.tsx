import type { ComponentProps } from "react";
import { profile } from "@/content";

/**
 * The CV as a PDF, printed from the /cv page: by scripts/build-resume.mjs at build time, and
 * on request by the dev server (see vite.config.ts), so the link works in both.
 */
export const resumePdf = {
  href: "/resume.pdf",
  fileName: `${profile.name.replace(/\s+/g, "-")}-CV.pdf`,
};

/** A link that downloads the CV PDF; style it per place it appears. Other link props pass through. */
export function DownloadCv({ children, ...props }: ComponentProps<"a">) {
  return (
    <a {...props} href={resumePdf.href} download={resumePdf.fileName}>
      {children}
    </a>
  );
}
