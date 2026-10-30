import type { Architecture, ArchZone, EdgeKind, NodeKind } from "@/content";
import { edgeKey } from "./architecture-style";

export type Vec3 = [number, number, number];
export type Curve = [Vec3, Vec3, Vec3, Vec3];

/**
 * Height of each component shape on the board. Edges leave from and land on the
 * top face, so the 3D shapes must be built to these heights.
 */
const KIND_HEIGHT: Record<NodeKind, number> = {
  client: 0.1,
  gateway: 0.4,
  service: 0.53,
  function: 0.42,
  bus: 0.16,
  queue: 0.31,
  datastore: 0.51,
  external: 0.36,
};

export type BoardLayout = {
  /** Centre of each component's base, on the floor (y = 0). */
  positions: Map<string, Vec3>;
  /** Nodes in busy rows whose label drops a line, so neighbours don't collide. */
  staggered: Set<string>;
  zones: (Pick<ArchZone, "label" | "tone"> & { x0: number; x1: number; z0: number; z1: number })[];
  /** Row titles printed on the floor, only for zones with more than one row. */
  rows: { label: string; x: number; z: number }[];
  edges: { key: string; from: string; to: string; kind: EdgeKind; curve: Curve }[];
  bounds: { x0: number; x1: number; z0: number; z1: number };
};

const CELL_X = 1.55;
const ROW_Z = 1.75;
const ZONE_GAP = 0.8;
const PAD_X = 1.4;

/**
 * Lays a layered diagram flat on a floor: columns along x, lanes as rows along z,
 * and consecutive lanes grouped into zones (accounts, other teams, third parties).
 * Pure, so the hero and the explorer share it and it can be tested without WebGL.
 */
export function layoutBoard(arch: Architecture): BoardLayout {
  const xs = arch.nodes.map((n) => n.x);
  const [minX, maxX] = [Math.min(...xs), Math.max(...xs)];
  const midX = (minX + maxX) / 2;
  const laneYs = [
    ...new Set(arch.lanes.length ? arch.lanes.map((l) => l.y) : arch.nodes.map((n) => n.y)),
  ].sort((a, b) => a - b);

  const zoneOf = (y: number) => arch.zones.findIndex((z) => y >= z.from && y <= z.to);
  const rawZ = (y: number) => y * ROW_Z + Math.max(0, zoneOf(y)) * ZONE_GAP;
  const zs = laneYs.map(rawZ);
  const midZ = (Math.min(...zs) + Math.max(...zs)) / 2;
  const zAt = (y: number) => rawZ(y) - midZ;
  const xAt = (x: number) => (x - midX) * CELL_X;

  const positions = new Map<string, Vec3>();
  const staggered = new Set<string>();
  for (const y of new Set(arch.nodes.map((n) => n.y))) {
    const row = arch.nodes.filter((n) => n.y === y).sort((a, b) => a.x - b.x);
    row.forEach((n, i) => {
      positions.set(n.id, [xAt(n.x), 0, zAt(n.y)]);
      if (row.length >= 6 && i % 2 === 1) staggered.add(n.id);
    });
  }

  const [x0, x1] = [xAt(minX) - PAD_X, xAt(maxX) + PAD_X];
  const inset = 0.06;
  const zones = arch.zones.map((z) => ({
    label: z.label,
    tone: z.tone,
    x0,
    x1,
    z0: zAt(z.from) - ROW_Z / 2 + inset,
    z1: zAt(z.to) + ROW_Z / 2 - inset,
  }));

  const rows = arch.lanes
    .filter((l) => {
      const z = arch.zones[zoneOf(l.y)];
      return !z || z.to > z.from;
    })
    .map((l) => ({ label: l.label, x: x0 + 0.3, z: zAt(l.y) - ROW_Z * 0.38 }));

  const kindOf = new Map(arch.nodes.map((n) => [n.id, n.kind]));
  const edges = arch.edges.flatMap((e) => {
    const a = positions.get(e.from);
    const b = positions.get(e.to);
    const [ka, kb] = [kindOf.get(e.from), kindOf.get(e.to)];
    if (!a || !b || !ka || !kb) return [];
    return [
      {
        key: edgeKey(e),
        from: e.from,
        to: e.to,
        kind: e.kind,
        curve: arc(a, KIND_HEIGHT[ka], b, KIND_HEIGHT[kb]),
      },
    ];
  });

  const z0 = zones.length ? Math.min(...zones.map((z) => z.z0)) : Math.min(...zs) - midZ - ROW_Z;
  const z1 = zones.length ? Math.max(...zones.map((z) => z.z1)) : Math.max(...zs) - midZ + ROW_Z;
  return { positions, staggered, zones, rows, edges, bounds: { x0, x1, z0, z1 } };
}

/** An arc that leaves the top of one shape, rises with distance, and lands on the other. */
function arc(a: Vec3, ha: number, b: Vec3, hb: number): Curve {
  const dist = Math.hypot(b[0] - a[0], b[2] - a[2]);
  const top = Math.max(ha, hb) + Math.min(1.5, 0.35 + dist * 0.13);
  const at = (t: number): Vec3 => [a[0] + (b[0] - a[0]) * t, top, a[2] + (b[2] - a[2]) * t];
  return [[a[0], ha, a[2]], at(0.15), at(0.85), [b[0], hb, b[2]]];
}
