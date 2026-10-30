import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { clsx } from "clsx";
import { type RefObject, useEffect, useMemo, useRef, useState } from "react";
import {
  AdditiveBlending,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  CubicBezierCurve3,
  CylinderGeometry,
  EdgesGeometry,
  type GridHelper,
  type Group,
  type LineBasicMaterial,
  MOUSE,
  type OrthographicCamera,
  Shape,
  ShapeGeometry,
  type Sprite,
  TubeGeometry,
  Vector3,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { Architecture, ArchNode, EdgeKind, NodeKind } from "@/content";
import {
  type BoardLayout,
  type Curve,
  layoutBoard,
  type Vec3,
} from "@/shared/lib/architecture-layout";
import { edgeKey, edgeStyle, kindIcon, ownerStyle } from "@/shared/lib/architecture-style";
import { getGlyphTexture, getSoftDot, getTextTexture } from "@/shared/lib/three-textures";
import { useInView } from "@/shared/lib/useInView";
import { useNarrow } from "@/shared/lib/useMediaQuery";
import { type EmphasisState, edgeState, type Focus, nodeState } from "./focus";

type Props = {
  architecture: Architecture;
  focus: Focus;
  selected: string | null;
  activeStep: { from: string; to: string } | null;
  reduced: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string | null) => void;
};

type ViewApi = { zoomBy: (factor: number) => void; reset: () => void };

type SceneProps = Props & {
  layout: BoardLayout;
  labels: RefObject<Map<string, HTMLElement>>;
  controls: RefObject<OrbitControls | null>;
  view: RefObject<ViewApi | null>;
};

// Resting view: a fixed axonometric angle, rows reading left to right.
const AZIMUTH = 0.3;
const POLAR = 0.8;
const restDirection = () =>
  new Vector3(
    Math.sin(POLAR) * Math.sin(AZIMUTH),
    Math.cos(POLAR),
    Math.sin(POLAR) * Math.cos(AZIMUTH),
  );

/**
 * The platform as an architecture board: one floor, zones for each account or
 * team, a symbol per component type, and arcs with packets for traffic. The
 * camera is orthographic so nothing distorts with distance. Labels are DOM tags
 * projected every frame: crisp, accessible and keyboard-focusable.
 */
export default function ArchitectureScene(props: Props) {
  const { architecture, focus, selected, activeStep, onHover, onSelect } = props;
  // Only a click or a flow step changes a box's size or position. Hover just tints
  // it, so nothing moves under a resting pointer (that loop made the board blink).
  const isPinned = (id: string) =>
    selected === id || activeStep?.from === id || activeStep?.to === id;
  const layout = useMemo(() => layoutBoard(architecture), [architecture]);
  const wrap = useRef<HTMLDivElement>(null);
  const labels = useRef(new Map<string, HTMLElement>());
  const controls = useRef<OrbitControls | null>(null);
  const view = useRef<ViewApi | null>(null);
  const inView = useInView(wrap);
  // Phones can't fit every tag legibly: show only what is in focus (tap or flow).
  const narrow = useNarrow();
  const [ready, setReady] = useState(false);
  const start = restDirection().multiplyScalar(60);

  const button =
    "grid size-8 place-items-center rounded-md border border-line bg-surface/90 font-mono text-muted text-sm backdrop-blur transition-colors hover:border-matrix hover:text-fg";

  return (
    <div
      ref={wrap}
      className="relative h-full w-full select-none"
      // Plain scrolling keeps scrolling the page; Ctrl/⌘ + scroll (and pinch) zooms.
      onWheelCapture={(e) => {
        if (controls.current) controls.current.enableZoom = e.ctrlKey || e.metaKey;
      }}
    >
      <Canvas
        orthographic
        frameloop={inView ? "always" : "never"}
        dpr={[1, 2]}
        camera={{ position: [start.x, start.y, start.z], zoom: 30, near: -100, far: 400 }}
        gl={{ antialias: true, alpha: true }}
        onCreated={() => setReady(true)}
        className={clsx("transition-opacity duration-700", ready ? "opacity-100" : "opacity-0")}
      >
        <Scene {...props} layout={layout} labels={labels} controls={controls} view={view} />
      </Canvas>

      {/* Fade the infinite grid into the page instead of a hard edge. */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,var(--color-bg)_100%)]" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {architecture.nodes.map((n) => (
          <NodeLabel
            key={n.id}
            node={n}
            state={nodeState(focus, n.id)}
            selected={selected === n.id}
            pinned={isPinned(n.id)}
            quiet={narrow}
            register={(el) => {
              if (el) labels.current.set(n.id, el);
              else labels.current.delete(n.id);
            }}
            onHover={onHover}
            onSelect={onSelect}
          />
        ))}
      </div>

      <div className="absolute top-3 right-3 flex flex-col gap-1.5">
        <button
          type="button"
          className={button}
          aria-label="Zoom in"
          onClick={() => view.current?.zoomBy(1.3)}
        >
          +
        </button>
        <button
          type="button"
          className={button}
          aria-label="Zoom out"
          onClick={() => view.current?.zoomBy(1 / 1.3)}
        >
          −
        </button>
        <button
          type="button"
          className={button}
          aria-label="Reset view"
          onClick={() => view.current?.reset()}
        >
          ⟲
        </button>
      </div>
    </div>
  );
}

function NodeLabel({
  node,
  state,
  selected,
  pinned,
  quiet,
  register,
  onHover,
  onSelect,
}: {
  node: ArchNode;
  state: EmphasisState;
  selected: boolean;
  /** Selected or on the current flow step: the only state that changes the tag's size. */
  pinned: boolean;
  /** Hidden unless in focus (still focusable for keyboard users). */
  quiet: boolean;
  register: (el: HTMLElement | null) => void;
  onHover: (id: string | null) => void;
  onSelect: (id: string | null) => void;
}) {
  const owner = ownerStyle[node.owner];
  const hot = selected || state === "active";
  return (
    <button
      type="button"
      ref={register}
      onPointerEnter={() => onHover(node.id)}
      onPointerLeave={() => onHover(null)}
      onFocus={() => onHover(node.id)}
      onBlur={() => onHover(null)}
      onClick={() => onSelect(selected ? null : node.id)}
      aria-pressed={selected}
      aria-label={`${node.label}, ${owner.label}`}
      className={clsx(
        "pointer-events-auto absolute top-0 left-0 flex flex-col items-center whitespace-nowrap rounded-md border bg-bg/85 px-1.5 py-0.5 backdrop-blur-sm transition-[opacity,border-color] duration-300",
        quiet && !hot
          ? "opacity-0 focus-visible:opacity-100"
          : state === "dim"
            ? "opacity-25"
            : "opacity-100",
      )}
      // Hidden until the first frame has projected it into place.
      style={{
        visibility: "hidden",
        borderColor: hot ? owner.color : "color-mix(in oklab, var(--color-line) 70%, transparent)",
      }}
    >
      <span className="flex items-center gap-1.5 font-medium text-[10.5px] text-fg leading-tight">
        <span className="size-1.5 shrink-0 rounded-full" style={{ background: owner.color }} />
        {pinned ? node.label : (node.short ?? node.label)}
      </span>
      {pinned && node.sub && (
        <span className="font-mono text-[9px] leading-tight" style={{ color: owner.color }}>
          {node.sub}
        </span>
      )}
    </button>
  );
}

function Scene({
  architecture,
  layout,
  focus,
  selected,
  activeStep,
  reduced,
  onHover,
  onSelect,
  labels,
  controls,
  view,
}: SceneProps) {
  const { camera, gl, size } = useThree();
  const cam = camera as OrthographicCamera;
  const fit = useRef(0);
  const zoomGoal = useRef<number | null>(null);
  const panGoal = useRef<Vector3 | null>(null);
  const resetting = useRef(false);
  const tmp = useMemo(() => new Vector3(), []);
  const tmp2 = useMemo(() => new Vector3(), []);
  const rest = useMemo(restDirection, []);
  const fontsReady = useFontsReady();

  // Orbit controls straight from three's own addons: limited rotate, right-drag pans.
  useEffect(() => {
    const c = new OrbitControls(camera, gl.domElement);
    Object.assign(c, {
      enableDamping: true,
      dampingFactor: 0.12,
      enableZoom: false,
      zoomToCursor: true,
      rotateSpeed: 0.45,
      screenSpacePanning: false,
      minPolarAngle: 0.4,
      maxPolarAngle: 1.05,
      minAzimuthAngle: AZIMUTH - 0.55,
      maxAzimuthAngle: AZIMUTH + 0.55,
    });
    c.mouseButtons = { LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN };
    // On touch screens vertical swipes keep scrolling the page; horizontal ones rotate.
    gl.domElement.style.touchAction = "pan-y";
    const interrupt = () => {
      zoomGoal.current = null;
      panGoal.current = null;
      resetting.current = false;
    };
    c.addEventListener("start", interrupt);
    controls.current = c;
    return () => {
      c.removeEventListener("start", interrupt);
      c.dispose();
      controls.current = null;
      document.body.style.cursor = "";
    };
  }, [camera, gl, controls]);

  // Fit the whole board to the viewport; the first fit eases in from slightly wider.
  useEffect(() => {
    const { x0, x1, z0, z1 } = layout.bounds;
    camera.updateMatrixWorld();
    const right = new Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
    const up = new Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
    const corners = [x0, x1].flatMap((x) =>
      [z0, z1].flatMap((z) => [0, 1.4].map((y) => new Vector3(x, y, z))),
    );
    const span = (axis: Vector3) => {
      const d = corners.map((p) => p.dot(axis));
      return Math.max(...d) - Math.min(...d);
    };
    const next = Math.min(size.width / span(right), size.height / span(up)) * 0.96;
    const first = fit.current === 0;
    fit.current = next;
    const c = controls.current;
    if (c) Object.assign(c, { minZoom: next * 0.75, maxZoom: next * 4 });
    cam.zoom = first && !reduced ? next * 0.86 : next;
    zoomGoal.current = first && !reduced ? next : null;
    cam.updateProjectionMatrix();
  }, [size, layout, camera, cam, controls, reduced]);

  useEffect(() => {
    view.current = {
      zoomBy: (factor) => {
        const base = zoomGoal.current ?? cam.zoom;
        zoomGoal.current = Math.min(fit.current * 4, Math.max(fit.current * 0.75, base * factor));
      },
      reset: () => {
        resetting.current = true;
        zoomGoal.current = fit.current;
        panGoal.current = new Vector3();
      },
    };
    return () => {
      view.current = null;
    };
  }, [cam, view]);

  // Selecting a box, or stepping through a flow, glides the board toward it.
  useEffect(() => {
    const p = selected ? layout.positions.get(selected) : undefined;
    if (p) panGoal.current = new Vector3(p[0] * 0.5, 0, p[2] * 0.5);
  }, [selected, layout]);
  useEffect(() => {
    if (!activeStep) return;
    const a = layout.positions.get(activeStep.from);
    const b = layout.positions.get(activeStep.to);
    if (a && b) panGoal.current = new Vector3((a[0] + b[0]) * 0.3, 0, (a[2] + b[2]) * 0.3);
  }, [activeStep, layout]);

  useFrame((state, delta) => {
    const c = controls.current;
    if (!c) return;
    const k = reduced ? 1 : 1 - Math.exp(-delta * 6);

    if (zoomGoal.current !== null) {
      cam.zoom += (zoomGoal.current - cam.zoom) * k;
      cam.updateProjectionMatrix();
      if (Math.abs(cam.zoom - zoomGoal.current) < 0.02) zoomGoal.current = null;
    }
    if (panGoal.current) {
      tmp.copy(panGoal.current).sub(c.target).multiplyScalar(k);
      c.target.add(tmp);
      camera.position.add(tmp);
      if (c.target.distanceTo(panGoal.current) < 0.005) panGoal.current = null;
    }
    if (resetting.current) {
      const dist = camera.position.distanceTo(c.target);
      tmp2.copy(rest).multiplyScalar(dist).add(c.target);
      camera.position.lerp(tmp2, k);
      if (camera.position.distanceTo(tmp2) < 0.01) resetting.current = false;
    }
    // Keep panning on the board.
    const { x0, x1, z0, z1 } = layout.bounds;
    tmp.set(
      Math.min(x1, Math.max(x0, c.target.x)) - c.target.x,
      0,
      Math.min(z1, Math.max(z0, c.target.z)) - c.target.z,
    );
    c.target.add(tmp);
    camera.position.add(tmp);
    c.update(delta);

    const { width, height } = state.size;
    for (const [id, el] of labels.current) {
      const p = layout.positions.get(id);
      if (!p) continue;
      tmp.set(p[0], 0, p[2] + 0.42).project(state.camera);
      el.style.visibility = "visible";
      el.style.transform = `translate3d(${((tmp.x + 1) / 2) * width}px, ${((1 - tmp.y) / 2) * height}px, 0) translate(-50%, 3px)`;
      el.style.zIndex = el.getAttribute("aria-pressed") === "true" ? "999" : "1";
    }
  });

  const step = activeStep ? layout.edges.find((e) => e.key === edgeKey(activeStep)) : undefined;

  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight position={[6, 12, 5]} intensity={1.1} />
      <directionalLight position={[-6, 5, -4]} intensity={0.35} color="#8b7bff" />

      <Floor />
      {layout.zones.map((z) => (
        <Zone key={z.label} zone={z} fontsReady={fontsReady} />
      ))}
      {fontsReady &&
        layout.rows.map((r) => (
          <FloorText
            key={r.label}
            text={r.label.toUpperCase()}
            color="#4f6b55"
            height={0.3}
            x={r.x}
            z={r.z}
          />
        ))}

      {layout.edges.map((e) => (
        <EdgeArc key={e.key} curve={e.curve} kind={e.kind} state={edgeState(focus, e.key)} />
      ))}
      {!reduced && <Traffic layout={layout} focus={focus} />}
      {architecture.nodes.map((n) => {
        const p = layout.positions.get(n.id);
        return p ? (
          <Component
            key={n.id}
            node={n}
            position={p}
            state={nodeState(focus, n.id)}
            selected={selected === n.id}
            pinned={selected === n.id || activeStep?.from === n.id || activeStep?.to === n.id}
            fontsReady={fontsReady}
            onHover={onHover}
            onSelect={onSelect}
          />
        ) : null;
      })}
      {step && <Packet key={step.key} curve={step.curve} reduced={reduced} />}
    </>
  );
}

function useFontsReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let live = true;
    document.fonts.ready.then(() => {
      if (live) setReady(true);
    });
    return () => {
      live = false;
    };
  }, []);
  return ready;
}

function Floor() {
  const grid = useRef<GridHelper>(null);
  useEffect(() => {
    const m = grid.current?.material as LineBasicMaterial | undefined;
    if (m) Object.assign(m, { transparent: true, opacity: 0.55, depthWrite: false });
  }, []);
  return <gridHelper ref={grid} args={[90, 180, "#142417", "#0d1810"]} position={[0, -0.01, 0]} />;
}

const ZONE_TONE = {
  primary: { fill: "#3d8f55", line: "#23502f", text: "#5e9a6b" },
  team: { fill: "#8f9c92", line: "#4a564d", text: "#8f9c92" },
  external: { fill: "#f6a96b", line: "#6e4a36", text: "#c98a5a" },
} as const;

function Zone({ zone, fontsReady }: { zone: BoardLayout["zones"][number]; fontsReady: boolean }) {
  const tone = ZONE_TONE[zone.tone];
  const { fill, outline } = useMemo(() => {
    const r = 0.4;
    const s = new Shape();
    const { x0, x1, z0, z1 } = zone;
    s.moveTo(x0 + r, z0);
    s.lineTo(x1 - r, z0);
    s.absarc(x1 - r, z0 + r, r, -Math.PI / 2, 0, false);
    s.lineTo(x1, z1 - r);
    s.absarc(x1 - r, z1 - r, r, 0, Math.PI / 2, false);
    s.lineTo(x0 + r, z1);
    s.absarc(x0 + r, z1 - r, r, Math.PI / 2, Math.PI, false);
    s.lineTo(x0, z0 + r);
    s.absarc(x0 + r, z0 + r, r, Math.PI, Math.PI * 1.5, false);
    // Shapes are drawn in XY; rotating +90° about X lays (x, y) onto the floor as (x, z).
    const fill = new ShapeGeometry(s, 6).rotateX(Math.PI / 2);
    const outline = new BufferGeometry().setFromPoints(
      s.getPoints(6).map((p) => new Vector3(p.x, 0.004, p.y)),
    );
    return { fill, outline };
  }, [zone]);
  useEffect(
    () => () => {
      fill.dispose();
      outline.dispose();
    },
    [fill, outline],
  );
  const dashed = zone.tone !== "primary";

  return (
    <group>
      <mesh geometry={fill} position={[0, 0.002, 0]}>
        <meshBasicMaterial color={tone.fill} transparent opacity={0.045} depthWrite={false} />
      </mesh>
      <lineLoop geometry={outline} ref={(l) => l?.computeLineDistances()}>
        {dashed ? (
          <lineDashedMaterial color={tone.line} dashSize={0.18} gapSize={0.12} />
        ) : (
          <lineBasicMaterial color={tone.line} />
        )}
      </lineLoop>
      {fontsReady && (
        <FloorText
          text={zone.label.toUpperCase()}
          color={tone.text}
          height={0.36}
          x={zone.x0 + 0.1}
          z={zone.z0 - 0.3}
        />
      )}
    </group>
  );
}

/** Text printed flat on the floor, left-aligned at (x, z). */
function FloorText({
  text,
  color,
  height,
  x,
  z,
}: {
  text: string;
  color: string;
  height: number;
  x: number;
  z: number;
}) {
  const { texture, aspect } = getTextTexture(text, color);
  const width = height * aspect;
  return (
    <mesh position={[x + width / 2, 0.006, z]} rotation-x={-Math.PI / 2}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

type Shape3D = { body: BufferGeometry; edges: EdgesGeometry; top: number; glyph: number };

const box = (w: number, h: number, d: number, y = 0) =>
  new BoxGeometry(w, h, d).translate(0, y + h / 2, 0);
const cylinder = (r: number, h: number, segments: number, y = 0) =>
  new CylinderGeometry(r, r, h, segments).translate(0, y + h / 2, 0);
const merged = (...parts: BufferGeometry[]) =>
  mergeGeometries(parts) ?? parts[0] ?? new BufferGeometry();
const defineShape = (body: BufferGeometry, glyph: number): Shape3D => {
  body.computeBoundingBox();
  return { body, edges: new EdgesGeometry(body, 30), top: body.boundingBox?.max.y ?? 0, glyph };
};

/**
 * One symbol per component type, built to KIND_HEIGHT so edges land on the top:
 * stacked server blades, a cube for a function, a hexagonal hub, a stack of
 * message plates, a database cylinder, a ghost box for third parties.
 */
const SHAPES: Record<NodeKind, Shape3D> = {
  client: defineShape(box(0.95, 0.1, 0.66), 0.42),
  gateway: defineShape(box(0.8, 0.4, 0.6), 0.36),
  service: defineShape(merged(box(1.05, 0.24, 0.74), box(1.05, 0.24, 0.74, 0.29)), 0.44),
  function: defineShape(box(0.62, 0.42, 0.62), 0.4),
  bus: defineShape(cylinder(0.5, 0.16, 6), 0.44),
  queue: defineShape(
    merged(box(0.95, 0.07, 0.62), box(0.95, 0.07, 0.62, 0.12), box(0.95, 0.07, 0.62, 0.24)),
    0.4,
  ),
  datastore: defineShape(merged(cylinder(0.36, 0.23, 40), cylinder(0.36, 0.23, 40, 0.28)), 0.42),
  external: defineShape(box(0.85, 0.36, 0.62), 0.36),
};

function Component({
  node,
  position,
  state,
  selected,
  pinned,
  fontsReady,
  onHover,
  onSelect,
}: {
  node: ArchNode;
  position: Vec3;
  state: EmphasisState;
  selected: boolean;
  /** Selected or on the current flow step: the only state that lifts the box. */
  pinned: boolean;
  fontsReady: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string | null) => void;
}) {
  const shape = SHAPES[node.kind];
  const color = ownerStyle[node.owner].color;
  const lift = useRef<Group>(null);
  const hot = selected || state === "active";
  const dim = state === "dim";
  const ghost = node.owner === "external";

  useFrame((_, delta) => {
    const g = lift.current;
    if (g) g.position.y += ((pinned ? 0.12 : 0) - g.position.y) * (1 - Math.exp(-delta * 10));
  });

  return (
    <group position={position}>
      {node.owner === "built" && !dim && <FloorGlow color={color} strong={hot} />}
      <group ref={lift}>
        {/* biome-ignore lint/a11y/noStaticElementInteractions: a three.js mesh, not DOM; keyboard users get the label buttons. */}
        <mesh
          geometry={shape.body}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover(node.id);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            onHover(null);
            document.body.style.cursor = "";
          }}
          onClick={(e) => {
            e.stopPropagation();
            // A drag that ends on a component is a rotate, not a click.
            if (e.delta > 5) return;
            onSelect(selected ? null : node.id);
          }}
        >
          <meshStandardMaterial
            color="#0e1a12"
            emissive={color}
            emissiveIntensity={hot ? 0.28 : dim ? 0 : 0.06}
            roughness={0.6}
            metalness={0.1}
            transparent
            opacity={ghost ? 0.08 : dim ? 0.35 : 0.94}
            polygonOffset
            polygonOffsetFactor={1}
            polygonOffsetUnits={1}
          />
        </mesh>
        <lineSegments geometry={shape.edges} ref={(l) => l?.computeLineDistances()}>
          {ghost ? (
            <lineDashedMaterial
              color={color}
              dashSize={0.07}
              gapSize={0.05}
              transparent
              opacity={dim ? 0.15 : hot ? 1 : 0.6}
            />
          ) : (
            <lineBasicMaterial color={color} transparent opacity={dim ? 0.12 : hot ? 1 : 0.85} />
          )}
        </lineSegments>
        {fontsReady && (
          <mesh position={[0, shape.top + 0.004, 0]} rotation-x={-Math.PI / 2}>
            <planeGeometry args={[shape.glyph, shape.glyph]} />
            <meshBasicMaterial
              map={getGlyphTexture(kindIcon[node.kind], color)}
              transparent
              opacity={dim ? 0.15 : 1}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        )}
      </group>
    </group>
  );
}

/** A soft pool of light under the components I built. */
function FloorGlow({ color, strong }: { color: string; strong: boolean }) {
  return (
    <mesh position={[0, 0.003, 0]} rotation-x={-Math.PI / 2}>
      <planeGeometry args={[2.1, 2.1]} />
      <meshBasicMaterial
        map={getSoftDot()}
        color={color}
        transparent
        opacity={strong ? 0.5 : 0.22}
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

const toCurve = ([a, b, c, d]: Curve) =>
  new CubicBezierCurve3(new Vector3(...a), new Vector3(...b), new Vector3(...c), new Vector3(...d));

function EdgeArc({ curve, kind, state }: { curve: Curve; kind: EdgeKind; state: EmphasisState }) {
  const active = state === "active";
  const geometry = useMemo(() => new TubeGeometry(toCurve(curve), 48, 0.016, 6), [curve]);
  const glow = useMemo(
    () => (active ? new TubeGeometry(toCurve(curve), 48, 0.05, 8) : null),
    [curve, active],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => glow?.dispose(), [glow]);

  const color = edgeStyle[kind].color;
  return (
    <>
      <mesh geometry={geometry}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={active ? 1 : state === "dim" ? 0.05 : 0.32}
          depthWrite={false}
        />
      </mesh>
      {glow && (
        <mesh geometry={glow}>
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.25}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}
    </>
  );
}

const SPEED: Record<EdgeKind, number> = {
  http: 0.34,
  event: 0.22,
  queue: 0.18,
  invoke: 0.4,
  ai: 0.3,
  data: 0.14,
};

/** One draw call for every packet on every edge. */
function Traffic({ layout, focus }: { layout: BoardLayout; focus: Focus }) {
  const { curves, colors, particles, geometry } = useMemo(() => {
    const curves = layout.edges.map((e) => toCurve(e.curve));
    const colors = layout.edges.map((e) => new Color(edgeStyle[e.kind].color));
    const particles = layout.edges.flatMap((e, i) => {
      const n = e.kind === "data" ? 1 : 2;
      return Array.from({ length: n }, (_, k) => ({
        edge: i,
        phase: (k / n + i * 0.137) % 1,
        speed: SPEED[e.kind],
      }));
    });
    const geometry = new BufferGeometry();
    geometry.setAttribute(
      "position",
      new BufferAttribute(new Float32Array(particles.length * 3), 3),
    );
    geometry.setAttribute("color", new BufferAttribute(new Float32Array(particles.length * 3), 3));
    return { curves, colors, particles, geometry };
  }, [layout]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const point = useMemo(() => new Vector3(), []);
  const tint = useMemo(() => new Color(), []);

  useFrame(({ clock }) => {
    const pos = geometry.getAttribute("position") as BufferAttribute;
    const col = geometry.getAttribute("color") as BufferAttribute;
    particles.forEach((p, i) => {
      const edge = layout.edges[p.edge];
      const curve = curves[p.edge];
      const color = colors[p.edge];
      if (!edge || !curve || !color) return;
      curve.getPoint((clock.elapsedTime * p.speed + p.phase) % 1, point);
      pos.setXYZ(i, point.x, point.y, point.z);
      const st = edgeState(focus, edge.key);
      // Additive blending: a near-black packet is effectively invisible.
      tint.copy(color).multiplyScalar(st === "active" ? 1.5 : st === "dim" ? 0.03 : 0.7);
      col.setXYZ(i, tint.r, tint.g, tint.b);
    });
    pos.needsUpdate = true;
    col.needsUpdate = true;
  });

  return (
    <points geometry={geometry}>
      {/* Orthographic camera: size is in pixels. */}
      <pointsMaterial
        size={7}
        sizeAttenuation={false}
        map={getSoftDot()}
        vertexColors
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}

/** The bright dot that walks a flow step's edge. */
function Packet({ curve, reduced }: { curve: Curve; reduced: boolean }) {
  const ref = useRef<Sprite>(null);
  const started = useRef<number | null>(null);
  const path = useMemo(() => toCurve(curve), [curve]);
  const point = useMemo(() => new Vector3(), []);

  useFrame(({ clock }) => {
    const s = ref.current;
    if (!s) return;
    started.current ??= clock.elapsedTime;
    const t = reduced ? 1 : Math.min(1, (clock.elapsedTime - started.current) / 1.4);
    path.getPoint(1 - (1 - t) ** 3, point);
    s.position.copy(point);
    const pulse = 0.45 + Math.sin(clock.elapsedTime * 6) * 0.05;
    s.scale.set(pulse, pulse, 1);
  });

  return (
    <sprite ref={ref}>
      <spriteMaterial
        map={getSoftDot()}
        color="#ffffff"
        blending={AdditiveBlending}
        transparent
        depthWrite={false}
      />
    </sprite>
  );
}
