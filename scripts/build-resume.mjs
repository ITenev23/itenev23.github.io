// Build step: prints the /cv page to dist/resume.pdf (see resume.mjs), so the "Download CV"
// PDF is generated from the same content as the site and can never drift from it.
// Without Chrome the step is skipped with a warning locally, and fails in CI, where a
// missing PDF would ship a broken download link.
import { readFileSync, statSync, writeFileSync } from "node:fs";
import { preview } from "vite";
import { findChrome, renderResume } from "./resume.mjs";

const OUT = "dist/resume.pdf";

const chrome = findChrome();
if (!chrome) {
  const message = "resume.pdf: Chrome not found; set CHROME_PATH";
  if (process.env.CI) {
    console.error(message);
    process.exit(1);
  }
  console.warn(`${message}. Skipped.`);
  process.exit(0);
}

const started = Date.now();
const server = await preview({ preview: { port: 4179 }, logLevel: "warn" });
try {
  const base = server.resolvedUrls?.local[0] ?? "http://localhost:4179/";
  writeFileSync(OUT, await renderResume(chrome, base));
} finally {
  await server.close();
}

const pages = (readFileSync(OUT, "latin1").match(/\/Type\s*\/Page\b/g) ?? []).length;
const kb = Math.round(statSync(OUT).size / 1024);
console.log(`${OUT}: ${pages} page(s), ${kb} KB, in ${Date.now() - started} ms`);
if (pages > 2) console.warn(`resume.pdf runs to ${pages} pages; a CV reads best at 1-2.`);
