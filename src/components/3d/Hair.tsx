// src/components/3d/Hair.tsx
// Cabelo procedural para React Three Fiber (sem GLB).
// Técnica:
// 1. Couro cabeludo estruturado e contínuo (scalp base): fecha 100% o topo da cabeça,
//    eliminando o efeito de "casca de ovo" ou manequim exposto.
// 2. Fios-guia anatômicos com curvatura catenária gravitacional e aceleração vertical suave.
// 3. Colisores com crânio, pescoço e ombros para caimento maleável sem penetração.
// 4. Flexibilidade orgânica no shader (GPU) nas pontas livres dos fios para eliminar aspecto estático/duro.

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

// Uniforms globais compartilhados para dinâmica e flexibilidade dos fios na GPU
export const hairShaderUniforms = {
  uTime: { value: 0 },
  uSway: { value: new THREE.Vector3() },
  uGravityBounce: { value: 0 },
};

interface HairPreset {
  color: string; // tom rico do fio com pigmentação natural
  roughness: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
  guides: number; // quantidade de mechas principais
  children: number; // fios por mecha
  length: number; // comprimento do fio esticado
  samples: number; // subdivisões por fio
  gravity: number; // intensidade da gravidade
  initialDrop: number; // curvatura para baixo
  noise: number; // irregularidade do percurso
  curlRadius: number; // raio da curvatura/mola
  curlTurns: number; // voltas de curvatura ao longo do comprimento
  helix: number; // 0 = onda plana em S, 1 = espiral 3D
  phaseJitter: number; // desordem de fase entre fios da mesma mecha
  spread: number; // abertura da mecha
  clump: number; // convergência (<1 reúne nas pontas, >1 abre pontas duplas)
  rootRadius: number; // espessura fina na raiz
  tipRadius: number; // afunilamento suave na ponta
  fringeGuides: number; // mechas dedicadas à franja e cobertura frontal/têmporas
  hasAfroBase?: boolean; // base volumosa contínua para o crespo
}

export const HAIR_PRESETS: Record<HairType, HairPreset> = {
  liso: {
    // Bob clássico em camadas, liso natural maleável com caimento fluido
    color: '#1e140e', // Castanho escuro profundo natural (espresso quente)
    roughness: 0.30,
    clearcoat: 0.24,
    clearcoatRoughness: 0.28,
    guides: 580,
    children: 5,
    length: 0.92, // comprimento em camadas que contorna o maxilar e pescoço
    samples: 42,
    gravity: 0.65, // gravidade viva com caimento sedoso
    initialDrop: 0.72, // flui organicamente pela curvatura do crânio
    noise: 0.009, // caimento sedoso
    curlRadius: 0.003, // micro-ondulação sutil que elimina o aspecto de arame rígido
    curlTurns: 0.35,
    helix: 0,
    phaseJitter: 0.18,
    spread: 0.065,
    clump: 0.45,
    rootRadius: 0.0060,
    tipRadius: 0.0020,
    fringeGuides: 150,
  },
  ondulado: {
    // Ondas suaves em formato de "S" com peso gravitacional e balanço
    color: '#281a11', // Castanho médio quente com brilho natural
    roughness: 0.40,
    clearcoat: 0.22,
    clearcoatRoughness: 0.28,
    guides: 540,
    children: 5,
    length: 1.15,
    samples: 50,
    gravity: 0.52,
    initialDrop: 0.65,
    noise: 0.020,
    curlRadius: 0.048,
    curlTurns: 3.0,
    helix: 0.06,
    phaseJitter: 0.6,
    spread: 0.09,
    clump: 0.52,
    rootRadius: 0.0062,
    tipRadius: 0.0022,
    fringeGuides: 100,
  },
  cacheado: {
    // Cachos espirais volumosos (ringlets 3D) com salto e gravidade natural
    color: '#241710', // Chocolate escuro rico
    roughness: 0.46,
    clearcoat: 0.22,
    clearcoatRoughness: 0.28,
    guides: 520,
    children: 5,
    length: 1.25,
    samples: 68,
    gravity: 0.42,
    initialDrop: 0.55,
    noise: 0.030,
    curlRadius: 0.042,
    curlTurns: 10.5,
    helix: 1.0,
    phaseJitter: 0.45,
    spread: 0.105,
    clump: 0.30,
    rootRadius: 0.0065,
    tipRadius: 0.0022,
    fringeGuides: 100,
  },
  crespo: {
    // Halo afro denso e arredondado contínuo
    color: '#140e0a', // Preto natural profundo
    roughness: 0.88,
    clearcoat: 0.02,
    clearcoatRoughness: 0.5,
    guides: 560,
    children: 5,
    length: 0.34,
    samples: 48,
    gravity: 0.025,
    initialDrop: 0.05,
    noise: 0.040,
    curlRadius: 0.028,
    curlTurns: 14.5,
    helix: 1.0,
    phaseJitter: 0.5,
    spread: 0.115,
    clump: 0.62,
    rootRadius: 0.0070,
    tipRadius: 0.0028,
    fringeGuides: 100,
    hasAfroBase: true,
  },
  seco: {
    // Frizz, pontas abertas e acabamento fosco com gravidade desordenada
    color: '#523d2e', // castanho claro desidratado
    roughness: 0.95,
    clearcoat: 0.0,
    clearcoatRoughness: 0.6,
    guides: 510,
    children: 5,
    length: 1.05,
    samples: 44,
    gravity: 0.42,
    initialDrop: 0.55,
    noise: 0.042,
    curlRadius: 0.028,
    curlTurns: 2.2,
    helix: 0.25,
    phaseJitter: 0.85,
    spread: 0.11,
    clump: 1.25,
    rootRadius: 0.0062,
    tipRadius: 0.0022,
    fringeGuides: 100,
  },
  oleoso: {
    // Mechas pesadas agrupadas com caimento liso e brilho úmido acetinado
    color: '#18120c', // castanho quase preto acetinado
    roughness: 0.16,
    clearcoat: 0.58,
    clearcoatRoughness: 0.15,
    guides: 590,
    children: 5,
    length: 0.95,
    samples: 42,
    gravity: 0.72,
    initialDrop: 0.80,
    noise: 0.008,
    curlRadius: 0.002,
    curlTurns: 0.25,
    helix: 0,
    phaseJitter: 0.15,
    spread: 0.055,
    clump: 0.35,
    rootRadius: 0.0062,
    tipRadius: 0.0020,
    fringeGuides: 150,
  },
};

// ---------- colisores anatômicos ----------

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

function buildScalpGeometry(
  radiiArr: [number, number, number],
  type: HairType,
  isAfro = false
): THREE.BufferGeometry {
  const [rx, ry, rz] = radiiArr;
  // Escala segura (1.025x) para que a calota do manequim nunca atravesse o couro
  const scaleMul = isAfro ? 1.055 : 1.025;
  const sx = rx * scaleMul;
  const sy = ry * scaleMul;
  const sz = rz * scaleMul;

  const uSegments = 64;
  const vSegments = 28;

  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let iv = 0; iv <= vSegments; iv++) {
    const v = iv / vSegments;

    for (let iu = 0; iu <= uSegments; iu++) {
      const u = iu / uSegments;
      const phi = u * Math.PI * 2;

      const cosP = Math.cos(phi);
      const sinP = Math.sin(phi);

      const xDir = sinP;
      const zDir = cosP;

      let maxTheta: number;
      if (isAfro) {
        const frontBias = zDir > 0 ? 0.78 : 0.9;
        maxTheta = Math.PI * 0.5 * frontBias;
      } else if (type === 'liso' || type === 'oleoso') {
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

  // 1. Franja frontal dedicada cobrindo a testa e têmporas
  if (fringeGuides > 0) {
    let fTries = 0;
    while (out.length < fringeGuides && fTries < fringeGuides * 50) {
      fTries++;
      const a = (rng() - 0.5) * Math.PI * 0.78;
      const y = (type === 'liso' || type === 'oleoso') ? 0.16 + rng() * 0.32 : 0.22 + rng() * 0.26;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const s = new THREE.Vector3(r * Math.sin(a), y, r * Math.cos(a));
      out.push({
        p: s.clone().multiply(radii),
        n: s.clone().divide(radii).normalize(),
        isFringe: true,
      });
    }
  }

  // 2. Cobertura completa do couro cabeludo
  let tries = 0;
  while (out.length < count && tries < count * 60) {
    tries++;
    const u = rng() * 2 - 1;
    const a = rng() * Math.PI * 2;
    const r = Math.sqrt(1 - u * u);
    const s = new THREE.Vector3(r * Math.cos(a), u, r * Math.sin(a));

    const minY = s.z > 0 ? (type === 'crespo' ? 0.17 : 0.2) : -0.28;
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

// Empurra os pontos para fora dos elipsoides de colisão (cabeça, pescoço e ombros)
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

// Fio-guia com curvatura catenária gravitacional e caimento natural que abraça o crânio
function makeGuide(
  root: THREE.Vector3,
  normal: THREE.Vector3,
  cfg: HairPreset,
  radii: THREE.Vector3,
  colliders: Collider[],
  rng: () => number,
  isFringe: boolean,
  type: HairType
) {
  const segments = 18; // mais divisões para caimento e maleabilidade fluida
  const unit = radii.y;
  const guideLength = isFringe && (cfg.length > 0.5) ? cfg.length * 0.48 : cfg.length;
  const step = (guideLength * unit) / segments;

  let dir: THREE.Vector3;

  if (isFringe) {
    // Franja: projeta para a frente com curvatura convexa e caimento em direção à sobrancelha
    dir = new THREE.Vector3(root.x * 0.25, -0.6, Math.max(0.15, root.z * 0.5)).normalize();
  } else if (cfg.helix > 0.5) {
    // Cachos e afro: emergem com volume radial mas curvam sob gravidade
    dir = normal.clone().multiplyScalar(0.4).addScaledVector(GRAVITY, 0.6 * cfg.gravity).normalize();
  } else {
    // Liso / ondulado / oleoso / seco:
    // Caimento que flui para baixo imediatamente ao sair da raiz, abraçando a silhueta da cabeça
    const sideSign = root.x >= 0 ? 1 : -1;
    dir = new THREE.Vector3(
      sideSign * (0.15 + (Math.abs(root.x) / radii.x) * 0.25),
      -0.65 - cfg.initialDrop * 0.4,
      root.z < 0 ? root.z * 0.35 : -0.05
    ).normalize();
  }

  const p = root.clone();
  const pts = [p.clone()];

  for (let i = 1; i <= segments; i++) {
    const t = i / segments;

    // Aceleração gravitacional contínua (curva física de catenária)
    // O peso gravitacional puxa verticalmente para baixo com força crescente ao longo do comprimento
    const gravFactor = cfg.gravity * (0.35 + Math.pow(t, 1.4) * 1.5);
    dir.addScaledVector(GRAVITY, gravFactor);

    // Contorno natural facial para lisos e oleosos (C-curve nas pontas para emoldurar o queixo)
    if ((type === 'liso' || type === 'oleoso') && t > 0.55) {
      const sideSign = root.x >= 0 ? 1 : -1;
      const inwardT = Math.pow(t - 0.55, 1.8);
      dir.x -= sideSign * inwardT * 0.45;
      dir.z += (0.12 - p.z * 0.2) * inwardT * 0.35;
    }

    dir.x += (rng() - 0.5) * cfg.noise;
    dir.y += (rng() - 0.5) * cfg.noise * 0.5;
    dir.z += (rng() - 0.5) * cfg.noise;
    dir.normalize();

    p.addScaledVector(dir, step);

    // Colisão garantida com todos os elipsoides (crânio, pescoço e ombros)
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
  const sides = opts.sides ?? 3;
  const rng = mulberry32(opts.seed ?? 9);

  // Colisores: 1. Crânio, 2. Pescoço, 3. Ombros/Busto
  const colliders: Collider[] = [
    { center: new THREE.Vector3(0, 0, 0), radii: radii.clone(), margin: 0.038, minY: -0.28 * radii.y },
    // Colisor do Pescoço
    { center: new THREE.Vector3(0, -0.77, 0), radii: new THREE.Vector3(0.38, 0.36, 0.42), margin: 0.035 },
    // Colisor dos Ombros/Busto
    ...(opts.colliders ?? []).map((c) => ({
      center: new THREE.Vector3(...c.center),
      radii: new THREE.Vector3(...c.radii),
      margin: c.margin ?? 0.035,
    })),
  ];

  const roots = sampleRoots(cfg.guides, radii, rng, cfg.fringeGuides, type);

  const pos: number[] = [];
  const nor: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];

  const base = new THREE.Color(opts.color ?? cfg.color);
  const rootCol = base.clone().multiplyScalar(0.38);
  const tipCol = base.clone().multiplyScalar(0.95);
  const tmp = new THREE.Color();
  const v = new THREE.Vector3();
  const nn = new THREE.Vector3();

  const S = cfg.samples;

  for (const { p, n, isFringe } of roots) {
    const guide = makeGuide(p, n, cfg, radii, colliders, rng, isFringe, type);
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
      const bright = 0.92 + rng() * 0.16;
      const first = pos.length / 3;

      for (let i = 0; i < count; i++) {
        const s = i / S;
        const t = i / (count - 1);
        const N = frames.normals[i];
        const B = frames.binormals[i];

        const ramp = THREE.MathUtils.smoothstep(s, 0, 0.12);
        const rootGroupRamp = THREE.MathUtils.lerp(0.08, 1.0, Math.min(1, s * 5.0));
        const clump = THREE.MathUtils.lerp(1, cfg.clump, s);

        const th = cfg.curlTurns * Math.PI * 2 * s + phase;
        const amp = cfg.curlRadius * unit * ramp;
        const cx = Math.sin(th) * amp;
        const cy = Math.cos(th) * amp * cfg.helix;

        v.copy(centers[i])
          .addScaledVector(N, ox * clump * rootGroupRamp + cx)
          .addScaledVector(B, oy * clump * rootGroupRamp + cy);

        const r = THREE.MathUtils.lerp(cfg.rootRadius, cfg.tipRadius, Math.pow(t, 0.7)) * unit;
        tmp.copy(rootCol).lerp(tipCol, Math.pow(t, 0.85)).multiplyScalar(bright);

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
  seed = 9,
  colliders: ColliderSpec[] = []
) {
  const t = resolveType(type);
  const c = color ?? HAIR_PRESETS[t].color;
  const key = JSON.stringify(['v6', t, radii, c, seed, colliders]);
  let geo = hairGeometryCache.get(key);
  if (!geo) {
    geo = buildHairGeometry(t, radii, { color: c, seed, colliders });
    hairGeometryCache.set(key, geo);
  }
  return geo;
}

export function getScalpGeometry(type: string, radii: [number, number, number]) {
  const t = resolveType(type);
  const key = JSON.stringify(['v6', t, radii]);
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
  getHairGeometry(type, radii, undefined, 9, colliders);
  getScalpGeometry(type, radii);
}

// Configuração de flexibilidade orgânica no shader (GPU)
function setupHairMaterialShader(material: THREE.MeshPhysicalMaterial) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = hairShaderUniforms.uTime;
    shader.uniforms.uSway = hairShaderUniforms.uSway;
    shader.uniforms.uGravityBounce = hairShaderUniforms.uGravityBounce;

    shader.vertexShader = `
      uniform float uTime;
      uniform vec3 uSway;
      uniform float uGravityBounce;
    ` + shader.vertexShader;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      // Flex progressivo: raiz perfeitamente estática, comprimento ganha maleabilidade e pontas balançam livremente
      float flexLinear = clamp((0.55 - transformed.y) / 1.35, 0.0, 1.0);
      float flex = pow(flexLinear, 1.7); // curva não-linear: as pontas têm o maior arco de movimento

      // Ondulação orgânica contínua (brisa suave e balanço natural dos fios em repouso)
      float wave1 = sin(uTime * 1.8 + transformed.y * 3.5 + transformed.x * 2.0);
      float wave2 = cos(uTime * 2.4 + transformed.y * 4.2 + transformed.z * 1.8);
      transformed.x += (wave1 * 0.045 + wave2 * 0.02) * flex;
      transformed.z += (wave2 * 0.038 + wave1 * 0.015) * flex;

      // Inércia reativa e balanço dinâmico ao girar a cabeça / mover a câmera
      // Aplica arraste fluido nas pontas dos fios (lag inercial com efeito chicote suave)
      float swayLag = sin(transformed.y * 2.2 - 0.4);
      transformed.x += (uSway.x * 0.55 + uSway.x * swayLag * 0.25) * flex;
      transformed.z += (uSway.z * 0.45 + uSway.z * swayLag * 0.20) * flex;

      // Caimento e salto gravitacional nas pontas (gravidade viva)
      transformed.y -= (0.025 + uGravityBounce * 0.08) * flex;
      `
    );
  };
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
  seed = 9,
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

  const scalpColor = useMemo(
    () => new THREE.Color(baseColor).multiplyScalar(0.4),
    [baseColor]
  );

  const hairMaterial = useMemo(() => {
    const mat = new THREE.MeshPhysicalMaterial({
      vertexColors: true,
      roughness: preset.roughness,
      metalness: 0.02,
      clearcoat: preset.clearcoat ?? 0.15,
      clearcoatRoughness: preset.clearcoatRoughness ?? 0.3,
      envMapIntensity: 0.22,
      side: THREE.FrontSide,
      depthWrite: true,
    });
    setupHairMaterialShader(mat);
    return mat;
  }, [preset.roughness, preset.clearcoat, preset.clearcoatRoughness]);

  return (
    <group position={position}>
      {/* 1. Base contínua do couro cabeludo: veda 100% o crânio e dá densidade de raiz */}
      <mesh geometry={scalpGeometry} receiveShadow castShadow>
        <meshStandardMaterial
          color={scalpColor}
          roughness={preset.roughness}
          metalness={0.01}
          envMapIntensity={0.2}
          depthWrite={true}
        />
      </mesh>

      {/* 2. Mechas e fios com maleabilidade gravitacional (sem aspecto duro) */}
      <mesh geometry={hairGeometry} material={hairMaterial} castShadow receiveShadow />
    </group>
  );
}
