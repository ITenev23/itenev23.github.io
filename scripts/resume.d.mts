/** Types for resume.mjs, so vite.config.ts can use it under strict TypeScript. */
export function findChrome(): string | undefined;
export function renderResume(chrome: string, base: string): Promise<Uint8Array>;
