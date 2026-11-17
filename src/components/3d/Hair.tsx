// src/components/3d/Hair.tsx
// Cabelo procedural para React Three Fiber (sem GLB).
// Técnica: fios-guia -> mechas (clumping) -> curvatura em hélice -> tubo afunilado,
// tudo fundido em UMA BufferGeometry (1 draw call por tipo de cabelo).
//
// Convenções: origem = centro da cabeça, rosto olhando para +Z, Y para cima.
// As medidas dos presets são relativas ao raio vertical da cabeça (radii[1]).

import { useMemo } from 'react';
import * as THREE from 'three';

export type HairType = 'liso' | 'ondulado' | 'cacheado' | 'crespo' | 'seco' | 'oleoso';

export const HAIR_TYPE_IDS: HairType[] = [
  'liso',
  'ondulado',
  'cacheado',
  'crespo',
  'seco',
  'oleoso',
];

interface HairPreset {
  color: string; // cor base do fio (a raiz sai mais escura, a ponta mais clara)
  roughness: number;
  guides: number; // quantidade de mechas
  children: number; // fios por mecha
  length: number; // comprimento do fio esticado
  samples: number; // pontos por fio (mais = mais suave e mais pesado)
  gravity: number; // quanto a gravidade puxa o fio ao longo do comprimento
  initialDrop: number; // 0 = sai perpendicular ao couro cabeludo, 1 = cai direto
  noise: number; // irregularidade da direção
  curlRadius: number; // raio da onda/cacho
  curlTurns: number; // voltas completas ao longo do fio
  helix: number; // 0 = onda plana (ondulado), 1 = hélice (cacho)
  phaseJitter: number; // variação de fase entre fios da mesma mecha
  spread: number; // raio da mecha na raiz
  clump: number; // 1 = fios soltos na ponta, <1 = fios se juntam na ponta
  rootRadius: number;
  tipRadius: number;
}

export const HAIR_PRESETS: Record<HairType, HairPreset> = {
  liso: {
    color: '#3a2a1f', roughness: 0.42,
    guides: 380, children: 6, length: 0.95, samples: 28,
    gravity: 0.35, initialDrop: 0.55, noise: 0.03,
    curlRadius: 0.004, curlTurns: 1.2, helix: 0, phaseJitter: 1,
    spread: 0.085, clump: 0.55, rootRadius: 0.01, tipRadius: 0.0035,
  },
  ondulado: {
    color: '#4a3426', roughness: 0.48,
    guides: 380, children: 6, length: 1.0, samples: 44,
    gravity: 0.28, initialDrop: 0.5, noise: 0.04,
    curlRadius: 0.04, curlTurns: 3.5, helix: 0.3, phaseJitter: 0.8,
    spread: 0.09, clump: 0.6, rootRadius: 0.01, tipRadius: 0.0035,
  },
  cacheado: {
    color: '#33241b', roughness: 0.55,
    guides: 340, children: 5, length: 1.2, samples: 72,
    gravity: 0.4, initialDrop: 0.7, noise: 0.05,
    curlRadius: 0.035, curlTurns: 12, helix: 1, phaseJitter: 0.5,
    spread: 0.08, clump: 0.4, rootRadius: 0.011, tipRadius: 0.004,
  },
  crespo: {
    color: '#2b1d15', roughness: 0.72,
    guides: 320, children: 4, length: 0.55, samples: 56,
    gravity: 0.04, initialDrop: 0.02, noise: 0.07,
    curlRadius: 0.02, curlTurns: 16, helix: 1, phaseJitter: 0.4,
    spread: 0.09, clump: 0.5, rootRadius: 0.012, tipRadius: 0.005,
  },
  seco: {
    color: '#6b5240', roughness: 0.85,
    guides: 340, children: 5, length: 1.0, samples: 40,
    gravity: 0.3, initialDrop: 0.6, noise: 0.13,
    curlRadius: 0.03, curlTurns: 6, helix: 0.5, phaseJitter: 1.4,
    spread: 0.11, clump: 1.0, rootRadius: 0.008, tipRadius: 0.003,
  },
  oleoso: {
    color: '#1f1612', roughness: 0.2,
    guides: 380, children: 6, length: 0.95, samples: 28,
    gravity: 0.45, initialDrop: 0.6, noise: 0.015,
    curlRadius: 0.003, curlTurns: 1, helix: 0, phaseJitter: 1,
    spread: 0.07, clump: 0.3, rootRadius: 0.0105, tipRadius: 0.004,
  },
};

// ---------- colisores ----------

/** Elipsoide (em coordenadas locais da cabeça) que os fios não podem atravessar. */
export interface ColliderSpec {
  center: [number, number, number];
  radii: [number, number, number];
  margin?: number;
}

interface Collider {
  center: THREE.Vector3;
  radii: THREE.Vector3;
  margin: number;
  minY?: number; // só colide acima dessa altura (usado na cabeça, para o fio cair livre depois)
}

// ---------- utilidades ----------

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const GRAVITY = new THREE.Vector3(0, -1, 0);

// Raízes distribuídas no couro cabeludo (topo e costas; testa livre).
function sampleRoots(count: number, radii: THREE.Vector3, rng: () => number) {
  const out: { p: THREE.Vector3; n: THREE.Vector3 }[] = [];
  let tries = 0;
  while (out.length < count && tries < count * 60) {
    tries++;
    const u = rng() * 2 - 1;
    const a = rng() * Math.PI * 2;
    const r = Math.sqrt(1 - u * u);
    const s = new THREE.Vector3(r * Math.cos(a), u, r * Math.sin(a));
    const minY = s.z > 0 ? 0.38 : -0.2; // linha do cabelo na frente, mais baixa atrás
    if (s.y < minY) continue;
    out.push({
      p: s.clone().multiply(radii),
      n: s.clone().divide(radii).normalize(), // normal do elipsoide
    });
  }
  return out;
}

const _q = new THREE.Vector3();

function pushOut(p: THREE.Vector3, c: Collider) {
  if (c.minY !== undefined && p.y <= c.minY) return;
  _q.copy(p).sub(c.center).divide(c.radii);
  const len = _q.length();
  const lim = 1 + c.margin;
  if (len < lim) {
    _q.multiplyScalar(lim / Math.max(len, 1e-4));
    p.copy(_q).multiply(c.radii).add(c.center);
  }
}

// Fio-guia: caminha com gravidade e escorrega sobre cabeça e ombros (colisão com elipsoides).
function makeGuide(
  root: THREE.Vector3,
  normal: THREE.Vector3,
  cfg: HairPreset,
  unit: number,
  colliders: Collider[],
  rng: () => number,
) {
  const segments = 12;
  const step = (cfg.length * unit) / segments;
  const dir = normal.clone().lerp(GRAVITY, cfg.initialDrop).normalize();
  const p = root.clone();
  const pts = [p.clone()];

  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    dir.addScaledVector(GRAVITY, cfg.gravity * (0.15 + t));
    dir.x += (rng() - 0.5) * cfg.noise;
    dir.y += (rng() - 0.5) * cfg.noise;
    dir.z += (rng() - 0.5) * cfg.noise;
    dir.normalize();
    p.addScaledVector(dir, step);
    for (const c of colliders) pushOut(p, c);
    pts.push(p.clone());
  }
  return pts;
}

// ---------- gerador principal ----------

export interface BuildOptions {
  color?: THREE.ColorRepresentation;
  seed?: number;
  sides?: number;
  colliders?: ColliderSpec[];
}

export function buildHairGeometry(
  type: HairType,
  radiiArr: [number, number, number],
  opts: BuildOptions = {},
) {
  const cfg = HAIR_PRESETS[type] ?? HAIR_PRESETS.liso;
  const radii = new THREE.Vector3(...radiiArr);
  const unit = radii.y;
  const sides = opts.sides ?? 5;
  const rng = mulberry32(opts.seed ?? 7);

  const colliders: Collider[] = [
    { center: new THREE.Vector3(), radii: radii.clone(), margin: 0.04, minY: -0.25 * radii.y },
    ...(opts.colliders ?? []).map((c) => ({
      center: new THREE.Vector3(...c.center),
      radii: new THREE.Vector3(...c.radii),
      margin: c.margin ?? 0.03,
    })),
  ];

  const roots = sampleRoots(cfg.guides, radii, rng);

  const pos: number[] = [];
  const nor: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];

  const base = new THREE.Color(opts.color ?? cfg.color);
  const rootCol = base.clone().multiplyScalar(0.55); // raiz mais escura
  const tipCol = base.clone().lerp(new THREE.Color('#ffffff'), 0.1);
  const tmp = new THREE.Color();
  const v = new THREE.Vector3();
  const nn = new THREE.Vector3();

  const S = cfg.samples;

  for (const { p, n } of roots) {
    const guide = makeGuide(p, n, cfg, unit, colliders, rng);
    const curve = new THREE.CatmullRomCurve3(guide, false, 'centripetal');
    const centers = curve.getSpacedPoints(S);
    const frames = curve.computeFrenetFrames(S, false);
    const guidePhase = rng() * Math.PI * 2;

    for (let c = 0; c < cfg.children; c++) {
      const ang = rng() * Math.PI * 2;
      const rad = Math.sqrt(rng()) * cfg.spread * unit;
      const ox = Math.cos(ang) * rad;
      const oy = Math.sin(ang) * rad;
      const phase = guidePhase + (rng() - 0.5) * cfg.phaseJitter * Math.PI;
      const count = Math.max(6, Math.floor((S + 1) * (0.75 + rng() * 0.25)));
      const bright = 0.85 + rng() * 0.3;
      const first = pos.length / 3;

      for (let i = 0; i < count; i++) {
        const s = i / S;
        const t = i / (count - 1);
        const N = frames.normals[i];
        const B = frames.binormals[i];

        const ramp = THREE.MathUtils.smoothstep(s, 0, 0.12); // raiz fica presa no couro
        const clump = THREE.MathUtils.lerp(1, cfg.clump, s);
        const th = cfg.curlTurns * Math.PI * 2 * s + phase;
        const amp = cfg.curlRadius * unit * ramp;
        const cx = Math.sin(th) * amp;
        const cy = Math.cos(th) * amp * cfg.helix;

        v.copy(centers[i])
          .addScaledVector(N, ox * clump + cx)
          .addScaledVector(B, oy * clump + cy);

        const r = THREE.MathUtils.lerp(cfg.rootRadius, cfg.tipRadius, Math.pow(t, 0.7)) * unit;
        tmp.copy(rootCol).lerp(tipCol, t).multiplyScalar(bright);

        for (let k = 0; k < sides; k++) {
          const a = (k / sides) * Math.PI * 2;
          nn.copy(N).multiplyScalar(Math.cos(a)).addScaledVector(B, Math.sin(a));
          pos.push(v.x + nn.x * r, v.y + nn.y * r, v.z + nn.z * r);
          nor.push(nn.x, nn.y, nn.z);
          col.push(tmp.r, tmp.g, tmp.b);
        }
      }

      for (let i = 0; i < count - 1; i++) {
        for (let k = 0; k < sides; k++) {
          const a = first + i * sides + k;
          const b = first + i * sides + ((k + 1) % sides);
          const c2 = a + sides;
          const d = b + sides;
          idx.push(a, b, c2, b, d, c2);
        }
      }
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  geo.setIndex(idx);
  geo.computeBoundingSphere();
  return geo;
}

// ---------- cache (cada tipo é gerado uma única vez) ----------

const geometryCache = new Map<string, THREE.BufferGeometry>();

function resolveType(type: string): HairType {
  return (HAIR_TYPE_IDS as string[]).includes(type) ? (type as HairType) : 'liso';
}

export function getHairGeometry(
  type: string,
  radii: [number, number, number],
  color?: string,
  seed = 7,
  colliders: ColliderSpec[] = [],
) {
  const t = resolveType(type);
  const c = color ?? HAIR_PRESETS[t].color;
  const key = JSON.stringify([t, radii, c, seed, colliders]);
  let geo = geometryCache.get(key);
  if (!geo) {
    geo = buildHairGeometry(t, radii, { color: c, seed, colliders });
    geometryCache.set(key, geo);
  }
  return geo;
}

/** Gera antes da hora (ex.: em idle) para a troca de tipo ser instantânea. */
export function prebuildHair(
  type: string,
  radii: [number, number, number],
  colliders: ColliderSpec[] = [],
) {
  getHairGeometry(type, radii, undefined, 7, colliders);
}

// ---------- componente ----------

// Tampa de couro cabeludo compartilhada (cobre os espaços entre as raízes)
const capGeometry = new THREE.SphereGeometry(1, 48, 32, 0, Math.PI * 2, 0, Math.PI * 0.58);

interface HairProps {
  type: string;
  /** Cor base; se omitida, usa a cor do preset do tipo. */
  color?: string;
  /** Semi-eixos do elipsoide da cabeça [x, y, z]. */
  radii: [number, number, number];
  /** Centro da cabeça no mundo. */
  position?: [number, number, number];
  /** Elipsoides extras (ex.: ombros) que o cabelo deve contornar, em coordenadas locais. */
  colliders?: ColliderSpec[];
  seed?: number;
}

export default function Hair({
  type,
  color,
  radii,
  position = [0, 0, 0],
  colliders = [],
  seed = 7,
}: HairProps) {
  const [rx, ry, rz] = radii;
  const t = resolveType(type);
  const preset = HAIR_PRESETS[t];
  const baseColor = color ?? preset.color;
  const collidersKey = JSON.stringify(colliders);

  const geometry = useMemo(
    () => getHairGeometry(t, [rx, ry, rz], baseColor, seed, JSON.parse(collidersKey)),
    [t, rx, ry, rz, baseColor, seed, collidersKey],
  );
  const capColor = useMemo(() => new THREE.Color(baseColor).multiplyScalar(0.5), [baseColor]);

  return (
    <group position={position}>
      <group rotation={[-0.3, 0, 0]}>
        <mesh geometry={capGeometry} scale={[rx * 1.015, ry * 1.015, rz * 1.015]}>
          <meshStandardMaterial color={capColor} roughness={0.7} metalness={0} />
        </mesh>
      </group>
      <mesh geometry={geometry} castShadow>
        <meshStandardMaterial vertexColors roughness={preset.roughness} metalness={0} />
      </mesh>
    </group>
  );
}
