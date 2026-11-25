import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

interface City {
  id: string;
  en: string;
  ar: string;
  lat: number;
  lon: number;
  label?: boolean;
}

const CITIES: City[] = [
  { id: 'alex', en: 'Alexandria', ar: 'الإسكندرية', lat: 31.2, lon: 29.92, label: true },
  { id: 'cairo', en: 'Cairo', ar: 'القاهرة', lat: 30.04, lon: 31.24, label: true },
  { id: 'siwa', en: 'Siwa', ar: 'سيوة', lat: 29.2, lon: 25.52 },
  { id: 'sharm', en: 'Sharm El Sheikh', ar: 'شرم الشيخ', lat: 27.91, lon: 34.33, label: true },
  { id: 'hurghada', en: 'Hurghada', ar: 'الغردقة', lat: 27.26, lon: 33.81 },
  { id: 'luxor', en: 'Luxor', ar: 'الأقصر', lat: 25.7, lon: 32.64, label: true },
  { id: 'aswan', en: 'Aswan', ar: 'أسوان', lat: 24.09, lon: 32.9, label: true },
  { id: 'abusimbel', en: 'Abu Simbel', ar: 'أبو سمبل', lat: 22.34, lon: 31.62 },
];

const ROUTES: [string, string][] = [
  ['cairo', 'alex'],
  ['cairo', 'siwa'],
  ['cairo', 'sharm'],
  ['cairo', 'luxor'],
  ['luxor', 'hurghada'],
  ['luxor', 'aswan'],
  ['aswan', 'abusimbel'],
  ['alex', 'siwa'],
  ['hurghada', 'sharm'],
];

const OUTLINE: [number, number][] = [
  [31.6, 25.0],
  [31.3, 29.0],
  [31.4, 30.5],
  [31.25, 32.3],
  [31.1, 34.2],
  [29.5, 34.95],
  [27.75, 34.3],
  [26.5, 34.0],
  [25.1, 34.9],
  [24.0, 35.6],
  [22.0, 36.9],
  [22.0, 25.0],
];

const NILE: [number, number][] = [
  [24.09, 32.9],
  [24.98, 32.87],
  [25.7, 32.64],
  [26.16, 32.72],
  [27.18, 31.18],
  [28.1, 30.75],
  [29.0, 31.1],
  [30.04, 31.24],
  [30.9, 31.1],
  [31.4, 30.4],
];

const K = 2.1;
const project = (lat: number, lon: number, y = 0) =>
  new THREE.Vector3((lon - 30.5) * K, y, -(lat - 27) * K);

function inside(lat: number, lon: number): boolean {
  let c = false;
  for (let i = 0, j = OUTLINE.length - 1; i < OUTLINE.length; j = i++) {
    const [yi, xi] = OUTLINE[i];
    const [yj, xj] = OUTLINE[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

function useDot(): THREE.Texture {
  return useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d');
    if (g) {
      const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.4, 'rgba(255,255,255,0.55)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grad;
      g.fillRect(0, 0, 64, 64);
    }
    return new THREE.CanvasTexture(c);
  }, []);
}

function Land({ dot }: { dot: THREE.Texture }) {
  const positions = useMemo(() => {
    const pts: number[] = [];
    for (let lat = 22; lat <= 31.7; lat += 0.17) {
      for (let lon = 25; lon <= 37; lon += 0.17) {
        if (inside(lat, lon)) {
          const p = project(lat, lon);
          pts.push(p.x, 0, p.z);
        }
      }
    }
    return new Float32Array(pts);
  }, []);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#b89a72"
        map={dot}
        alphaMap={dot}
        size={0.22}
        transparent
        opacity={0.55}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

function Outline() {
  const geo = useMemo(() => {
    const pts = [...OUTLINE, OUTLINE[0]].map(([la, lo]) => project(la, lo, 0.01));
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);
  return (
    <line>
      <primitive object={geo} attach="geometry" />
      <lineBasicMaterial
        color="#ffb25a"
        transparent
        opacity={0.35}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </line>
  );
}

function Nile() {
  const geo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(NILE.map(([la, lo]) => project(la, lo, 0.02)));
    return new THREE.TubeGeometry(curve, 120, 0.04, 6, false);
  }, []);
  return (
    <mesh geometry={geo}>
      <meshBasicMaterial
        color="#38c3e6"
        toneMapped={false}
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

const TRAIL = 30;
const HEADS = 2;

/** Glowing arcs with light streams (a bright head and a fading tail) flowing along each route. */
function Streams({ dot, still }: { dot: THREE.Texture; still: boolean }) {
  const byId = useMemo(() => new Map(CITIES.map((c) => [c.id, c])), []);
  const curves = useMemo(
    () =>
      ROUTES.map(([a, b]) => {
        const ca = byId.get(a)!;
        const cb = byId.get(b)!;
        const p0 = project(ca.lat, ca.lon, 0.1);
        const p1 = project(cb.lat, cb.lon, 0.1);
        const mid = p0.clone().lerp(p1, 0.5);
        mid.y = 0.7 + p0.distanceTo(p1) * 0.3;
        return new THREE.QuadraticBezierCurve3(p0, mid, p1);
      }),
    [byId],
  );
  const arcGeos = useMemo(
    () => curves.map((c) => new THREE.TubeGeometry(c, 56, 0.016, 5, false)),
    [curves],
  );
  const count = curves.length * HEADS * TRAIL;
  const pos = useMemo(() => new Float32Array(count * 3), [count]);
  const col = useMemo(() => new Float32Array(count * 3), [count]);
  const geoRef = useRef<THREE.BufferGeometry>(null);

  useFrame(({ clock }) => {
    const g = geoRef.current;
    if (!g) return;
    const t0 = still ? 0.35 : clock.elapsedTime;
    let k = 0;
    curves.forEach((curve, r) => {
      for (let h = 0; h < HEADS; h++) {
        const speed = 0.11 + (r % 3) * 0.02;
        const head = (t0 * speed + r * 0.19 + h / HEADS) % 1;
        for (let i = 0; i < TRAIL; i++) {
          const f = 1 - i / TRAIL;
          const t = head - i * 0.011;
          const p = curve.getPoint(((t % 1) + 1) % 1);
          pos[k * 3] = p.x;
          pos[k * 3 + 1] = p.y;
          pos[k * 3 + 2] = p.z;
          const a = f * f;
          col[k * 3] = (1.0 * a + (i === 0 ? 0.0 : 0)) * 1.0;
          col[k * 3 + 1] = (0.72 + 0.25 * (i === 0 ? 1 : 0)) * a;
          col[k * 3 + 2] = (0.35 + 0.5 * (i === 0 ? 1 : 0)) * a;
          k++;
        }
      }
    });
    (g.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    (g.attributes.color as THREE.BufferAttribute).needsUpdate = true;
  });

  return (
    <group>
      {arcGeos.map((geo, i) => (
        <mesh key={i} geometry={geo}>
          <meshBasicMaterial
            color="#ffb25a"
            transparent
            opacity={0.28}
            toneMapped={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
      <points frustumCulled={false}>
        <bufferGeometry ref={geoRef}>
          <bufferAttribute attach="attributes-position" args={[pos, 3]} />
          <bufferAttribute attach="attributes-color" args={[col, 3]} />
        </bufferGeometry>
        <pointsMaterial
          vertexColors
          map={dot}
          alphaMap={dot}
          size={0.34}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
          toneMapped={false}
        />
      </points>
    </group>
  );
}

function Node({ city, isAr }: { city: City; isAr: boolean }) {
  const ring = useRef<THREE.Mesh>(null);
  const pos = useMemo(() => project(city.lat, city.lon, 0.1), [city]);
  useFrame(({ clock }) => {
    const m = ring.current;
    if (!m) return;
    const s = 1 + ((clock.elapsedTime * 0.7 + city.lat) % 1) * 2.4;
    m.scale.setScalar(s);
    (m.material as THREE.MeshBasicMaterial).opacity = (1 - (s - 1) / 2.4) * 0.55;
  });
  return (
    <group position={pos}>
      <mesh>
        <sphereGeometry args={[city.id === 'cairo' ? 0.2 : 0.14, 20, 20]} />
        <meshBasicMaterial color={city.id === 'cairo' ? '#ffffff' : '#ffc27a'} toneMapped={false} />
      </mesh>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.25, 40]} />
        <meshBasicMaterial
          color="#ffb25a"
          transparent
          toneMapped={false}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {city.label ? (
        <Html center distanceFactor={13} position={[0, 0.6, 0]} style={{ pointerEvents: 'none' }}>
          <span className="whitespace-nowrap rounded-full border border-white/20 bg-black/35 px-3 py-1 text-[11px] font-semibold tracking-[0.12em] text-white/90 backdrop-blur-md">
            {isAr ? city.ar : city.en}
          </span>
        </Html>
      ) : null}
    </group>
  );
}

function Dust({ dot, count }: { dot: THREE.Texture; count: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    let s = 11;
    const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) a.set([(r() - 0.5) * 30, r() * 6, (r() - 0.5) * 20], i * 3);
    return a;
  }, [count]);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.012;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#ffd9a0"
        map={dot}
        alphaMap={dot}
        size={0.1}
        transparent
        opacity={0.5}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

function Rig({ children, still }: { children: React.ReactNode; still: boolean }) {
  const g = useRef<THREE.Group>(null);
  useFrame(({ pointer, clock, camera, size }) => {
    const aspect = size.width / Math.max(size.height, 1);
    const dist = Math.max(24, 34 / aspect);
    const t = still ? 0 : clock.elapsedTime;
    const enter = still ? 1 : Math.min(1, t / 2.8);
    const e = 1 - Math.pow(1 - enter, 3);
    const az = -0.28 + Math.sin(t * 0.12) * 0.1 + pointer.x * 0.12;
    const el = 0.72 - (1 - e) * 0.25 - pointer.y * 0.05;
    const d = dist * (1.35 - 0.35 * e);
    camera.position.set(
      1 + Math.sin(az) * Math.cos(el) * d,
      Math.sin(el) * d,
      0.2 + Math.cos(az) * Math.cos(el) * d,
    );
    camera.lookAt(-2.5, 0, 0.2);
    if (g.current) g.current.rotation.y = 0;
  });
  return <group ref={g}>{children}</group>;
}

export default function TransitScene({
  isAr = false,
  still = false,
}: {
  isAr?: boolean;
  still?: boolean;
}) {
  const dot = useDot();
  return (
    <Canvas
      frameloop={still ? 'demand' : 'always'}
      dpr={[1, 1.6]}
      camera={{ position: [1, 22, 15], fov: 40 }}
      gl={{ antialias: true, alpha: true }}
      aria-hidden="true"
    >
      <Rig still={still}>
        <Land dot={dot} />
        <Outline />
        <Nile />
        <Streams dot={dot} still={still} />
        {CITIES.map((c) => (
          <Node key={c.id} city={c} isAr={isAr} />
        ))}
        <Dust dot={dot} count={still ? 60 : 140} />
      </Rig>
    </Canvas>
  );
}
