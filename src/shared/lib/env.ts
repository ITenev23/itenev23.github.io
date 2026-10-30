/** Small browser capability checks, safe to call during render. */

const isBrowser = typeof navigator !== "undefined";

/** "⌘" on Apple platforms, "Ctrl" elsewhere, for shortcut hints. */
export const modKey = isBrowser && /Mac|iPhone|iPad/.test(navigator.userAgent) ? "⌘" : "Ctrl";

let webgl: boolean | undefined;

export function hasWebGL(): boolean {
  if (webgl === undefined) {
    try {
      const canvas = document.createElement("canvas");
      webgl = !!(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
    } catch {
      webgl = false;
    }
  }
  return webgl;
}
