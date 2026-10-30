/**
 * The 404 page's figure: an agent in sunglasses, alone in an empty room, looks left, looks
 * right and shrugs, while a question mark appears. Drawn in the current colour; the motion
 * lives in styles.css (`.lost-*`) and stays still for people who prefer reduced motion.
 */
export function LostAgent({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="A figure in sunglasses looking around an empty room, lost"
      className={className}
    >
      {/* The empty room: a floor and the corner of two walls. */}
      <path d="M8 136 H152" strokeOpacity={0.35} />
      <path d="M8 120 L28 104 V20 M152 120 L132 104 V20 M28 104 H132" strokeOpacity={0.15} />
      <ellipse
        cx={80}
        cy={137}
        rx={22}
        ry={3}
        fill="currentColor"
        fillOpacity={0.2}
        stroke="none"
      />

      {/* Legs, suit and tie. */}
      <path d="M74 104 L72 134 M86 104 L88 134" />
      <path d="M66 70 Q80 64 94 70 L92 106 H68 Z" />
      <path d="M80 70 L77 84 L80 94 L83 84 Z" fill="currentColor" fillOpacity={0.6} />

      {/* Arms out, palms up: the shrug. */}
      <g className="lost-arms">
        <path d="M67 74 L52 90 L44 80 M93 74 L108 90 L116 80" />
        <circle cx={44} cy={79} r={2.5} fill="currentColor" stroke="none" />
        <circle cx={116} cy={79} r={2.5} fill="currentColor" stroke="none" />
      </g>

      {/* Head, sunglasses and an earpiece wire; it turns to look around. */}
      <g className="lost-head">
        <circle cx={80} cy={46} r={13} />
        <path
          d="M70 43 h8 v4 a2 2 0 0 1 -2 2 h-4 a2 2 0 0 1 -2 -2 z M82 43 h8 v4 a2 2 0 0 1 -2 2 h-4 a2 2 0 0 1 -2 -2 z"
          fill="currentColor"
        />
        <path d="M78 44.5 H82" />
        <path d="M93 49 q5 8 0 16" strokeWidth={1} strokeOpacity={0.7} />
      </g>

      <text
        className="lost-ask"
        x={104}
        y={30}
        fill="currentColor"
        stroke="none"
        fontFamily="JetBrains Mono, monospace"
        fontSize={20}
        fontWeight={600}
      >
        ?
      </text>
    </svg>
  );
}
