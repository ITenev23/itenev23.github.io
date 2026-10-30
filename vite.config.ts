import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { defineConfig } from "vitest/config";

/**
 * The CV PDF is a build output (scripts/build-resume.mjs), so under `pnpm dev` there is no
 * file and the SPA fallback would hand back index.html as "resume.pdf". This renders the
 * PDF on request instead, from the running dev server, with the same code as the build.
 */
function resumePdfInDev(): Plugin {
  return {
    name: "resume-pdf-in-dev",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/resume.pdf", async (_req, res) => {
        const { findChrome, renderResume } = await import("./scripts/resume.mjs");
        const chrome = findChrome();
        if (!chrome) {
          res.statusCode = 503;
          res.end("resume.pdf: Chrome not found; set CHROME_PATH");
          return;
        }
        try {
          const base = server.resolvedUrls?.local[0] ?? "http://localhost:5173/";
          const pdf = await renderResume(chrome, base);
          res.setHeader("Content-Type", "application/pdf");
          res.end(Buffer.from(pdf));
        } catch (error) {
          res.statusCode = 500;
          res.end(`resume.pdf: ${String(error)}`);
        }
      });
    },
  };
}

// User site (<user>.github.io) is served from the domain root, so base stays "/".
export default defineConfig({
  base: "/",
  plugins: [
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    resumePdfInDev(),
  ],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  build: {
    target: "es2022",
    // No manualChunks: three.js and React Flow are only reached through lazy imports, so
    // the bundler already keeps them off the critical path. A manual "three" chunk pulled
    // React into it, which made every page download three.js up front.
    // Fonts stay separate files: inlined into the CSS they would block first paint.
    assetsInlineLimit: (file) => (/\.woff2?$/.test(file) ? false : undefined),
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
