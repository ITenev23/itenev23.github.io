import { CanvasTexture, SRGBColorSpace } from "three";

let softDot: CanvasTexture | undefined;

/** A radial white-to-transparent sprite: glow without a post-processing pass. */
export function getSoftDot(): CanvasTexture {
  if (!softDot) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 64;
    const g = canvas.getContext("2d");
    if (g) {
      const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, "rgba(255,255,255,1)");
      grad.addColorStop(0.22, "rgba(255,255,255,0.6)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = grad;
      g.fillRect(0, 0, 64, 64);
    }
    softDot = new CanvasTexture(canvas);
  }
  return softDot;
}

const MONO = '"JetBrains Mono", ui-monospace, monospace';
const textCache = new Map<string, { texture: CanvasTexture; aspect: number }>();

/**
 * Text drawn to a canvas, for printing on the floor of a 3D scene. Call only once
 * web fonts have loaded, or the fallback font gets cached.
 */
export function getTextTexture(text: string, color: string) {
  const key = `${text}|${color}`;
  let entry = textCache.get(key);
  if (!entry) {
    const canvas = document.createElement("canvas");
    const g = canvas.getContext("2d") as
      | (CanvasRenderingContext2D & { letterSpacing?: string })
      | null;
    const font = `600 52px ${MONO}`;
    let width = 64;
    if (g) {
      g.font = font;
      g.letterSpacing = "7px";
      width = Math.ceil(g.measureText(text).width) + 24;
    }
    canvas.width = width;
    canvas.height = 72;
    if (g) {
      // Resizing the canvas resets the context state.
      g.font = font;
      g.letterSpacing = "7px";
      g.fillStyle = color;
      g.textBaseline = "middle";
      g.fillText(text, 12, 38);
    }
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 8;
    entry = { texture, aspect: canvas.width / canvas.height };
    textCache.set(key, entry);
  }
  return entry;
}

const glyphCache = new Map<string, CanvasTexture>();

/** A single glowing glyph (λ, ≋, …) for the top face of a component. */
export function getGlyphTexture(glyph: string, color: string): CanvasTexture {
  const key = `${glyph}|${color}`;
  let texture = glyphCache.get(key);
  if (!texture) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 128;
    const g = canvas.getContext("2d");
    if (g) {
      g.font = `500 76px ${MONO}`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.shadowColor = color;
      g.shadowBlur = 16;
      g.fillStyle = color;
      g.fillText(glyph, 64, 68);
    }
    texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    glyphCache.set(key, texture);
  }
  return texture;
}
