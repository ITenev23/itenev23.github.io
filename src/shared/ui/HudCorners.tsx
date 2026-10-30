const corner =
  "pointer-events-none absolute size-4 opacity-35 transition-opacity duration-300 group-hover/hud:opacity-100";
// The parent's --accent, or the theme green when it has none.
const color = { borderColor: "var(--accent, var(--color-matrix))" };

/**
 * Four HUD-style corner brackets for a card. They sit dim and light up when the card,
 * marked `group/hud` and positioned, is hovered.
 */
export function HudCorners() {
  return (
    <>
      <span
        aria-hidden
        className={`${corner} top-2 left-2 rounded-tl-md border-t border-l`}
        style={color}
      />
      <span
        aria-hidden
        className={`${corner} top-2 right-2 rounded-tr-md border-t border-r`}
        style={color}
      />
      <span
        aria-hidden
        className={`${corner} bottom-2 left-2 rounded-bl-md border-b border-l`}
        style={color}
      />
      <span
        aria-hidden
        className={`${corner} right-2 bottom-2 rounded-br-md border-r border-b`}
        style={color}
      />
    </>
  );
}
