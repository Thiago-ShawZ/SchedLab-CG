// src/components/3d/Hair.tsx
// Cabelo procedural para React Three Fiber (sem GLB).
// Técnica:
// 1. Couro cabeludo estruturado e contínuo (scalp base): fecha 100% o topo da cabeça,
//    eliminando o efeito de "casca de ovo" ou manequim exposto.
// 2. Fios-guia anatômicos -> mechas com aglutinação (clumping) nas raízes -> tubos afunilados.
// 3. 1 BufferGeometry fundida por tipo com cache estático (alta performance).

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
  color: string; // cor base (raiz sai mais escura, ponta com brilho suave)
  roughness: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
  guides: number; // quantidade de mechas principais
  children: number; // fios por mecha
  length: number; // comprimento do fio esticado
  samples: number; // subdivisões por fio
  gravity: number; // tração para baixo
  initialDrop: number; // caimento inicial ao sair do couro
  noise: number; // irregularidade do percurso
  curlRadius: number; // raio da curvatura/mola
  curlTurns: number; // voltas de curvatura ao longo do comprimento
  helix: number; // 0 = onda plana em S, 1 = espiral 3D
  phaseJitter: number; // desordem de fase entre fios da mesma mecha
  spread: number; // abertura da mecha
  clump: number; // convergência (<1 reúne nas pontas, >1 abre pontas duplas)
  rootRadius: number;
  tipRadius: number;
  fringeGuides: number; // mechas dedicadas à franja/rosto
  hasAfroBase?: boolean; // base volumosa contínua para o crespo
}

export const HAIR_PRESETS: Record<HairType, HairPreset> = {
  liso: {
    // Foto 2: Bob reto com franja completa cobrindo a testa até as sobrancelhas
    color: '#1a130e', // Castanho escuro profundo / expresso
    roughness: 0.35,
    clearcoat: 0.3,
    clearcoatRoughness: 0.15,
    guides: 480,
    children: 5,
    length: 0.76, // corte bob que abraça o queixo
    samples: 34,
    gravity: 0.52, // caimento vertical bem alinhado
    initialDrop: 0.82, // mechas descem rentes ao couro
    noise: 0.015,
    curlRadius: 0.0008, // praticamente perfeitamente reto
    curlTurns: 0.2,
    helix: 0,
    phaseJitter: 0.2,
    spread: 0.065,
    clump: 0.52,
    rootRadius: 0.011,
    tipRadius: 0.004,
    fringeGuides: 110, // franja densa e completa que preenche a testa
  },
  ondulado: {
    // Foto 3: Bob ondulado com volume lateral e ondas em "S"
    color: '#221610',
    roughness: 0.42,
    clearcoat: 0.25,
    clearcoatRoughness: 0.2,
    guides: 440,
    children: 5,
    length: 1.05,
    samples: 46,
    gravity: 0.28,
    initialDrop: 0.52,
    noise: 0.03,
    curlRadius: 0.056, // ondas abertas em S visíveis
    curlTurns: 3.2,
    helix: 0.08, // onda predominantemente planar em S
    phaseJitter: 0.7,
    spread: 0.105,
    clump: 0.58,
    rootRadius: 0.011,
    tipRadius: 0.004,
    fringeGuides: 45,
  },
  cacheado: {
    // Foto 4: Cachos espirais volumosos e definidos (ringlets 3D)
    color: '#261912',
    roughness: 0.48,
    clearcoat: 0.25,
    clearcoatRoughness: 0.25,
    guides: 420,
    children: 5,
    length: 1.28,
    samples: 68,
    gravity: 0.34,
    initialDrop: 0.6,
    noise: 0.04,
    curlRadius: 0.046, // espirais bem desenhadas
    curlTurns: 11.5,
    helix: 1.0, // espiral tridimensional completa
    phaseJitter: 0.5,
    spread: 0.115,
    clump: 0.36, // cachos bem agrupados em tubos nas pontas
    rootRadius: 0.0115,
    tipRadius: 0.0042,
    fringeGuides: 50, // cachos que emolduram o rosto
  },
  crespo: {
    // Foto 5: Halo afro clássico, volumoso, denso e arredondado contínuo
    color: '#130d09', // Preto natural denso
    roughness: 0.86,
    clearcoat: 0.04,
    clearcoatRoughness: 0.4,
    guides: 460,
    children: 5,
    length: 0.34, // comprimento compacto para formar a nuvem/halo afro
    samples: 48,
    gravity: 0.01, // volume radial omnidirecional
    initialDrop: 0.0, // fios emergem em todas as direções da cabeça
    noise: 0.05,
    curlRadius: 0.034, // micromolas que se entrelaçam
    curlTurns: 13.0,
    helix: 1.0,
    phaseJitter: 0.5,
    spread: 0.12,
    clump: 0.65,
    rootRadius: 0.012,
    tipRadius: 0.005,
    fringeGuides: 60,
    hasAfroBase: true, // gera a base de volume afro que elimina qualquer transparência
  },
  seco: {
    // Foto 7 (lado direito): Desidratado, fosco, frizz e pontas abertas
    color: '#4e3a2b', // tom mais claro e descolorido/seco
    roughness: 0.95, // acabamento completamente fosco/sem brilho
    clearcoat: 0.0,
    clearcoatRoughness: 0.5,
    guides: 420,
    children: 5,
    length: 1.05,
    samples: 42,
    gravity: 0.3,
    initialDrop: 0.56,
    noise: 0.17, // alto frizz e irregularidade
    curlRadius: 0.032,
    curlTurns: 4.8,
    helix: 0.4,
    phaseJitter: 1.7, // mechas desordenadas
    spread: 0.13,
    clump: 1.32, // fios se abrem e se espalham nas pontas (pontas duplas)
    rootRadius: 0.009,
    tipRadius: 0.0035,
    fringeGuides: 35,
  },
  oleoso: {
    // Foto 7 (lado esquerdo): Fios colados, agrupados em mechas pesadas com alto brilho
    color: '#0e0a07', // preto profundo e saturado
    roughness: 0.12, // alto reflexo especular
    clearcoat: 1.0, // acabamento brilhante/úmido
    clearcoatRoughness: 0.1,
    guides: 440,
    children: 5,
    length: 0.8,
    samples: 34,
    gravity: 0.58, // caimento pesado que puxa para baixo
    initialDrop: 0.85, // fios assentados à cabeça
    noise: 0.01,
    curlRadius: 0.0008,
    curlTurns: 0.2,
    helix: 0,
    phaseJitter: 0.2,
    spread: 0.05, // mechas agrupadas e compactas
    clump: 0.2, // forte aglutinação nas pontas
    rootRadius: 0.011,
    tipRadius: 0.004,
    fringeGuides: 50,
  },
};

// ---------- colisores ----------

export interface ColliderSpec {
  center: [number, number, number];
  radii: [number, number, number];
  margin?: number;
}

interface Collider {
  center: THREE.Vector3;
  radii: THREE.Vector3;
  margin: number;
  minY?: number;
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

// ---------- Couro Cabeludo Fechado e Contínuo (Scalp Mesh) ----------

/**
 * Constrói uma cúpula contínua de couro cabeludo que acompanha o elipsoide da cabeça
 * e termina suavemente na linha anatômica do cabelo (testa, têmporas, orelhas e nuca).
 * Isso elimina qualquer espaço vazio ou visual de casca de ovo rachada.
 */
function buildScalpGeometry(
  radiiArr: [number, number, number],
  type: HairType,
  isAfro = false
): THREE.BufferGeometry {
  const [rx, ry, rz] = radiiArr;
  // O afro ganha um volume base expandido para preencher a silhueta esférica (Foto 5)
  const scaleMul = isAfro ? 1.055 : 1.004;
  const sx = rx * scaleMul;
  const sy = ry * scaleMul;
  const sz = rz * scaleMul;

  const uSegments = 64; // azimute em volta da cabeça
  const vSegments = 28; // latitude da coroa até a linha do cabelo

  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let iv = 0; iv <= vSegments; iv++) {
    const v = iv / vSegments; // 0 = topo da cabeça, 1 = linha do cabelo

    for (let iu = 0; iu <= uSegments; iu++) {
      const u = iu / uSegments;
      const phi = u * Math.PI * 2;

      const cosP = Math.cos(phi);
      const sinP = Math.sin(phi);

      const xDir = sinP;
      const zDir = cosP;

      // Ângulo polar máximo para a linha anatômica do cabelo em cada direção
      let maxTheta: number;
      if (isAfro) {
        // Afro: cúpula uniforme e abrangente
        const frontBias = zDir > 0 ? 0.78 : 0.9;
        maxTheta = Math.PI * 0.5 * frontBias;
      } else if (type === 'liso' || type === 'oleoso') {
        // Bob com franja: desce mais na testa frontal (+Z)
        if (zDir > 0.15) {
          maxTheta = Math.PI * 0.52;
        } else if (Math.abs(xDir) > 0.6) {
          maxTheta = Math.PI * 0.55;
        } else {
          maxTheta = Math.PI * 0.6;
        }
      } else {
        if (zDir > 0.25) {
          maxTheta = Math.PI * 0.49;
        } else if (Math.abs(xDir) > 0.6) {
          maxTheta = Math.PI * 0.54;
        } else {
          maxTheta = Math.PI * 0.59;
        }
      }

      const theta = v * maxTheta;
      const sinT = Math.sin(theta);
      const cosT = Math.cos(theta);

      const px = sx * sinT * sinP;
      const py = sy * cosT;
      const pz = sz * sinT * cosP;

      // Para o crespo, adiciona micro-relevo na base para criar textura densa de lã/cacho
      let disp = 1.0;
      if (isAfro && v > 0.1) {
        const noiseVal = Math.sin(px * 22) * Math.cos(pz * 22) * 0.007;
        disp += noiseVal;
      }

      positions.push(px * disp, py * disp, pz * disp);

      const nx = px / (sx * sx);
      const ny = py / (sy * sy);
      const nz = pz / (sz * sz);
      const nLen = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
      normals.push(nx / nLen, ny / nLen, nz / nLen);

      uvs.push(u, v);
    }
  }

  for (let iv = 0; iv < vSegments; iv++) {
    for (let iu = 0; iu < uSegments; iu++) {
      const a = iv * (uSegments + 1) + iu;
      const b = (iv + 1) * (uSegments + 1) + iu;
      const c = (iv + 1) * (uSegments + 1) + (iu + 1);
      const d = iv * (uSegments + 1) + (iu + 1);

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

// ---------- Amostragem Anatômica das Raízes ----------

function sampleRoots(
  count: number,
  radii: THREE.Vector3,
  rng: () => number,
  fringeGuides: number,
  type: HairType
) {
  const out: { p: THREE.Vector3; n: THREE.Vector3; isFringe: boolean }[] = [];

  // 1. Franja frontal dedicada cobrindo a testa (Foto 2 e Foto 6)
  if (fringeGuides > 0) {
    let fTries = 0;
    while (out.length < fringeGuides && fTries < fringeGuides * 50) {
      fTries++;
      // Ângulo frontal em arco sobre a testa [-PI/3, PI/3]
      const a = (rng() - 0.5) * Math.PI * 0.72;
      // Altura da franja no hemisfério frontal
      const y = (type === 'liso' || type === 'oleoso') ? 0.2 + rng() * 0.28 : 0.24 + rng() * 0.24;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const s = new THREE.Vector3(r * Math.sin(a), y, r * Math.cos(a));
      out.push({
        p: s.clone().multiply(radii),
        n: s.clone().divide(radii).normalize(),
        isFringe: true,
      });
    }
  }

  // 2. Cobertura completa do couro cabeludo (topo, têmporas, laterais e nuca)
  let tries = 0;
  while (out.length < count && tries < count * 60) {
    tries++;
    const u = rng() * 2 - 1;
    const a = rng() * Math.PI * 2;
    const r = Math.sqrt(1 - u * u);
    const s = new THREE.Vector3(r * Math.cos(a), u, r * Math.sin(a));

    // Linha de corte anatômica: testa mais alta, nuca mais baixa
    const minY = s.z > 0 ? (type === 'crespo' ? 0.18 : 0.22) : -0.28;
    if (s.y < minY) continue;

    out.push({
      p: s.clone().multiply(radii),
      n: s.clone().divide(radii).normalize(),
      isFringe: false,
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

// Fio-guia: caminha com gravidade e contorna cabeça e ombros
function makeGuide(
  root: THREE.Vector3,
  normal: THREE.Vector3,
  cfg: HairPreset,
  unit: number,
  colliders: Collider[],
  rng: () => number,
  isFringe: boolean
) {
  const segments = 12;
  // Franja tem comprimento menor para cair na testa/sobrancelha sem cobrir o rosto inteiro
  const guideLength = isFringe && (cfg.length > 0.5) ? cfg.length * 0.52 : cfg.length;
  const step = (guideLength * unit) / segments;

  // Direção inicial: a franja cai para frente e para baixo
  let dir = normal.clone();
  if (isFringe) {
    dir.addScaledVector(GRAVITY, 0.85).normalize();
  } else {
    dir.lerp(GRAVITY, cfg.initialDrop).normalize();
  }

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

// ---------- Gerador Principal de Geometria do Cabelo ----------

export interface BuildOptions {
  color?: THREE.ColorRepresentation;
  seed?: number;
  sides?: number;
  colliders?: ColliderSpec[];
}

export function buildHairGeometry(
  type: HairType,
  radiiArr: [number, number, number],
  opts: BuildOptions = {}
) {
  const cfg = HAIR_PRESETS[type] ?? HAIR_PRESETS.liso;
  const radii = new THREE.Vector3(...radiiArr);
  const unit = radii.y;
  const sides = opts.sides ?? 4; // 4 lados com normais suaves otimiza polígonos mantendo visual cilíndrico
  const rng = mulberry32(opts.seed ?? 7);

  const colliders: Collider[] = [
    { center: new THREE.Vector3(), radii: radii.clone(), margin: 0.035, minY: -0.28 * radii.y },
    ...(opts.colliders ?? []).map((c) => ({
      center: new THREE.Vector3(...c.center),
      radii: new THREE.Vector3(...c.radii),
      margin: c.margin ?? 0.03,
    })),
  ];

  const roots = sampleRoots(cfg.guides, radii, rng, cfg.fringeGuides, type);

  const pos: number[] = [];
  const nor: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];

  const base = new THREE.Color(opts.color ?? cfg.color);
  // Raiz escura profunda e pontas com tom rico natural
  const rootCol = base.clone().multiplyScalar(0.45);
  const tipCol = base.clone().lerp(new THREE.Color('#ffffff'), 0.04);
  const tmp = new THREE.Color();
  const v = new THREE.Vector3();
  const nn = new THREE.Vector3();

  const S = cfg.samples;

  for (const { p, n, isFringe } of roots) {
    const guide = makeGuide(p, n, cfg, unit, colliders, rng, isFringe);
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
      const count = Math.max(6, Math.floor((S + 1) * (0.8 + rng() * 0.2)));
      const bright = 0.9 + rng() * 0.2;
      const first = pos.length / 3;

      for (let i = 0; i < count; i++) {
        const s = i / S;
        const t = i / (count - 1);
        const N = frames.normals[i];
        const B = frames.binormals[i];

        const ramp = THREE.MathUtils.smoothstep(s, 0, 0.12);
        // Na raiz, os fios filhos nascem agrupados no couro; ao longo do comprimento, abrem ou se juntam
        const rootGroupRamp = THREE.MathUtils.lerp(0.18, 1.0, Math.min(1, s * 4.0));
        const clump = THREE.MathUtils.lerp(1, cfg.clump, s);

        const th = cfg.curlTurns * Math.PI * 2 * s + phase;
        const amp = cfg.curlRadius * unit * ramp;
        const cx = Math.sin(th) * amp;
        const cy = Math.cos(th) * amp * cfg.helix;

        v.copy(centers[i])
          .addScaledVector(N, ox * clump * rootGroupRamp + cx)
          .addScaledVector(B, oy * clump * rootGroupRamp + cy);

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

// ---------- Cache de Geometrias ----------

const hairGeometryCache = new Map<string, THREE.BufferGeometry>();
const scalpGeometryCache = new Map<string, THREE.BufferGeometry>();

function resolveType(type: string): HairType {
  return (HAIR_TYPE_IDS as string[]).includes(type) ? (type as HairType) : 'liso';
}

export function getHairGeometry(
  type: string,
  radii: [number, number, number],
  color?: string,
  seed = 7,
  colliders: ColliderSpec[] = []
) {
  const t = resolveType(type);
  const c = color ?? HAIR_PRESETS[t].color;
  const key = JSON.stringify([t, radii, c, seed, colliders]);
  let geo = hairGeometryCache.get(key);
  if (!geo) {
    geo = buildHairGeometry(t, radii, { color: c, seed, colliders });
    hairGeometryCache.set(key, geo);
  }
  return geo;
}

export function getScalpGeometry(type: string, radii: [number, number, number]) {
  const t = resolveType(type);
  const key = JSON.stringify([t, radii]);
  let geo = scalpGeometryCache.get(key);
  if (!geo) {
    geo = buildScalpGeometry(radii, t, t === 'crespo');
    scalpGeometryCache.set(key, geo);
  }
  return geo;
}

export function prebuildHair(
  type: string,
  radii: [number, number, number],
  colliders: ColliderSpec[] = []
) {
  getHairGeometry(type, radii, undefined, 7, colliders);
  getScalpGeometry(type, radii);
}

// ---------- Componente Hair ----------

interface HairProps {
  type: string;
  color?: string;
  radii: [number, number, number];
  position?: [number, number, number];
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

  const hairGeometry = useMemo(
    () => getHairGeometry(t, [rx, ry, rz], baseColor, seed, JSON.parse(collidersKey)),
    [t, rx, ry, rz, baseColor, seed, collidersKey]
  );

  const scalpGeometry = useMemo(
    () => getScalpGeometry(t, [rx, ry, rz]),
    [t, rx, ry, rz]
  );

  // Cor base do couro cabeludo correspondente à raiz profunda do cabelo
  const scalpColor = useMemo(
    () => new THREE.Color(baseColor).multiplyScalar(0.42),
    [baseColor]
  );

  return (
    <group position={position}>
      {/* 1. Base contínua do couro cabeludo: veda 100% o crânio e dá densidade de raiz */}
      <mesh geometry={scalpGeometry} receiveShadow castShadow>
        <meshStandardMaterial
          color={scalpColor}
          roughness={preset.roughness}
          metalness={0}
          envMapIntensity={0.2}
        />
      </mesh>

      {/* 2. Mechas e tubos procedurais volumosos */}
      <mesh geometry={hairGeometry} castShadow receiveShadow>
        <meshPhysicalMaterial
          vertexColors
          roughness={preset.roughness}
          metalness={0}
          clearcoat={preset.clearcoat ?? 0.15}
          clearcoatRoughness={preset.clearcoatRoughness ?? 0.2}
          envMapIntensity={0.25} // Impede que o reflexo do studio HDR pareça arame prateado
        />
      </mesh>
    </group>
  );
}
