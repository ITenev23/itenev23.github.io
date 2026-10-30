/**
 * Matrix-style rain on a 2D canvas: the site-wide background behind every page.
 * Each column falls at its own speed; the head glyph is bright, and a translucent fill over
 * the whole canvas each step turns what it leaves behind into a fading green trail.
 */

// Half-width katakana, digits and a few symbols, as in the film's rain.
const GLYPHS = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789:=*+<>¦";

type Options = {
  bg: string;
  green: string;
  /** Glyph size in canvas pixels; also the column width. */
  size: number;
  /** Opacity of the background fill per step: lower means longer trails. */
  fade?: number;
  head?: string;
};

const glyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)] ?? "0";

export function createRain(ctx: CanvasRenderingContext2D, o: Options) {
  const fade = o.fade ?? 0.085;
  const head = o.head ?? "#d9ffe3";
  let width = 0;
  let height = 0;
  let heads: number[] = [];
  let speeds: number[] = [];
  let last: string[] = [];

  return {
    /** Starts over on a cleared area of this size (canvas resizes also reset the font). */
    reset(w: number, h: number) {
      width = w;
      height = h;
      ctx.font = `${o.size}px "JetBrains Mono", monospace`;
      ctx.textBaseline = "top";
      const cols = Math.ceil(w / o.size);
      // Start above the top at staggered heights, so the rain doesn't arrive as one line.
      heads = Array.from({ length: cols }, () => (Math.random() * -h) / o.size);
      speeds = Array.from({ length: cols }, () => 0.25 + Math.random() * 0.75);
      last = Array.from({ length: cols }, glyph);
      ctx.fillStyle = o.bg;
      ctx.fillRect(0, 0, w, h);
    },

    /** Moves every column on by its speed; at most one new glyph per column. */
    step() {
      ctx.globalAlpha = fade;
      ctx.fillStyle = o.bg;
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 1;
      for (let i = 0; i < heads.length; i++) {
        const before = Math.floor(heads[i] ?? 0);
        heads[i] = (heads[i] ?? 0) + (speeds[i] ?? 0.5);
        const row = Math.floor(heads[i] ?? 0);
        if (row === before) continue;
        const x = i * o.size;
        // The old head turns green; the new one is drawn bright.
        if (before >= 0) {
          ctx.fillStyle = o.bg;
          ctx.fillRect(x, before * o.size, o.size, o.size);
          ctx.fillStyle = o.green;
          ctx.fillText(last[i] ?? "0", x, before * o.size);
        }
        const next = glyph();
        last[i] = next;
        ctx.fillStyle = head;
        ctx.fillText(next, x, row * o.size);
        if (row * o.size > height && Math.random() > 0.97) heads[i] = Math.random() * -12;
      }
    },
  };
}
