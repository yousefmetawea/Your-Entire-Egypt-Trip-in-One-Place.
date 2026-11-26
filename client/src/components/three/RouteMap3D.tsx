import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { LabelAnchor, LabelLayer, type LabelItem, type LabelStore } from './ProjectedLabels';

interface City {
  id: string;
  en: string;
  ar: string;
  lat: number;
  lon: number;
}

const CITIES: City[] = [
  { id: 'alex', en: 'Alexandria', ar: 'الإسكندرية', lat: 31.2, lon: 29.92 },
  { id: 'cairo', en: 'Cairo & Giza', ar: 'القاهرة والجيزة', lat: 30.04, lon: 31.24 },
  { id: 'siwa', en: 'Siwa', ar: 'سيوة', lat: 29.2, lon: 25.52 },
  { id: 'sharm', en: 'Sharm El Sheikh', ar: 'شرم الشيخ', lat: 27.91, lon: 34.33 },
  { id: 'hurghada', en: 'Hurghada', ar: 'الغردقة', lat: 27.26, lon: 33.81 },
  { id: 'luxor', en: 'Luxor', ar: 'الأقصر', lat: 25.7, lon: 32.64 },
  { id: 'aswan', en: 'Aswan', ar: 'أسوان', lat: 24.09, lon: 32.9 },
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
];

/** Rough outline of Egypt (lat, lon) used only to scatter the dot-matrix land. */
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
function project(lat: number, lon: number, y = 0): THREE.Vector3 {
  return new THREE.Vector3((lon - 30.5) * K, y, -(lat - 27) * K);
}

function inside(lat: number, lon: number): boolean {
  let c = false;
  for (let i = 0, j = OUTLINE.length - 1; i < OUTLINE.length; j = i++) {
    const [yi, xi] = OUTLINE[i];
    const [yj, xj] = OUTLINE[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

function dotTexture(): THREE.Texture {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  if (g) {
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.5, 'rgba(255,255,255,0.5)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
  }
  return new THREE.CanvasTexture(c);
}

function Land({ dot }: { dot: THREE.Texture }) {
  const positions = useMemo(() => {
    const pts: number[] = [];
    for (let lat = 22; lat <= 31.7; lat += 0.2) {
      for (let lon = 25; lon <= 37; lon += 0.2) {
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
        color="#c9b49a"
        map={dot}
        alphaMap={dot}
        size={0.24}
        transparent
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

function Nile() {
  const geo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(NILE.map(([la, lo]) => project(la, lo, 0.02)));
    return new THREE.TubeGeometry(curve, 120, 0.045, 6, false);
  }, []);
  return (
    <mesh geometry={geo}>
      <meshBasicMaterial color="#35b9d8" toneMapped={false} transparent opacity={0.85} />
    </mesh>
  );
}

function Route({ a, b, index }: { a: City; b: City; index: number }) {
  const pulse = useRef<THREE.Mesh>(null);
  const curve = useMemo(() => {
    const p0 = project(a.lat, a.lon, 0.1);
    const p1 = project(b.lat, b.lon, 0.1);
    const mid = p0.clone().lerp(p1, 0.5);
    mid.y = 0.6 + p0.distanceTo(p1) * 0.25;
    return new THREE.QuadraticBezierCurve3(p0, mid, p1);
  }, [a, b]);
  const geo = useMemo(() => new THREE.TubeGeometry(curve, 48, 0.02, 5, false), [curve]);
  useFrame(({ clock }) => {
    const m = pulse.current;
    if (!m) return;
    const t = (clock.elapsedTime * 0.22 + index * 0.17) % 1;
    m.position.copy(curve.getPoint(t));
  });
  return (
    <group>
      <mesh geometry={geo}>
        <meshBasicMaterial color="#B6CE67" transparent opacity={0.55} toneMapped={false} />
      </mesh>
      <mesh ref={pulse}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshBasicMaterial color="#fff2d6" toneMapped={false} />
      </mesh>
    </group>
  );
}

function CityNode({
  city,
  store,
  active,
  onHover,
}: {
  city: City;
  store: LabelStore;
  active: boolean;
  onHover: (id: string | null) => void;
}) {
  const ring = useRef<THREE.Mesh>(null);
  const pos = useMemo(() => project(city.lat, city.lon, 0.1), [city]);
  useFrame(({ clock }) => {
    const m = ring.current;
    if (!m) return;
    const s = 1 + ((clock.elapsedTime * 0.8 + city.lat) % 1) * 2.2;
    m.scale.setScalar(s);
    (m.material as THREE.MeshBasicMaterial).opacity = (1 - (s - 1) / 2.2) * 0.6;
  });
  return (
    <group position={pos}>
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(city.id);
        }}
        onPointerOut={() => onHover(null)}
      >
        <sphereGeometry args={[active ? 0.26 : 0.19, 20, 20]} />
        <meshBasicMaterial color={active ? '#ffffff' : '#B6CE67'} toneMapped={false} />
      </mesh>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.26, 40]} />
        <meshBasicMaterial color="#B6CE67" transparent toneMapped={false} depthWrite={false} />
      </mesh>
      <LabelAnchor id={city.id} store={store} offset={[0, 0.7, 0]} />
    </group>
  );
}

/** Pulls the camera back on narrow screens so the whole map stays in frame. */
function Fit() {
  useFrame(({ camera, size }) => {
    const aspect = size.width / Math.max(size.height, 1);
    const dist = Math.max(26.6, 36 / aspect);
    const dir = new THREE.Vector3(0, 22, 15).normalize().multiplyScalar(dist);
    camera.position.set(1 + dir.x, dir.y, 0.2 + dir.z);
    camera.lookAt(1, 0, 0.2);
  });
  return null;
}

function Rig({ children }: { children: React.ReactNode }) {
  const g = useRef<THREE.Group>(null);
  useFrame(({ pointer, clock }) => {
    const m = g.current;
    if (!m) return;
    const ty = pointer.x * 0.35 + Math.sin(clock.elapsedTime * 0.2) * 0.08;
    const tx = -0.05 - pointer.y * 0.18;
    m.rotation.y += (ty - m.rotation.y) * 0.05;
    m.rotation.x += (tx - m.rotation.x) * 0.05;
  });
  return <group ref={g}>{children}</group>;
}

export default function RouteMap3D({
  isAr = false,
  still = false,
}: {
  isAr?: boolean;
  still?: boolean;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const dot = useMemo(() => dotTexture(), []);
  const byId = useMemo(() => new Map(CITIES.map((c) => [c.id, c])), []);
  const store = useMemo<LabelStore>(() => new Map(), []);
  const labels: LabelItem[] = CITIES.map((c) => ({
    id: c.id,
    text: isAr ? c.ar : c.en,
    className: `whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold tracking-wide backdrop-blur-md transition-colors duration-300 ${
      hover === c.id
        ? 'border-white bg-white text-black'
        : 'border-white/25 bg-black/40 text-white/90'
    }`,
  }));
  return (
    <div className="relative h-full w-full">
      <Canvas
        frameloop={still ? 'demand' : 'always'}
        dpr={[1, 1.6]}
        camera={{ position: [1, 22, 15], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ camera }) => camera.lookAt(1, 0, 0.2)}
        aria-hidden="true"
      >
        <Fit />
        <Rig>
          <Land dot={dot} />
          <Nile />
          {ROUTES.map(([a, b], i) => {
            const ca = byId.get(a);
            const cb = byId.get(b);
            return ca && cb ? <Route key={`${a}-${b}`} a={ca} b={cb} index={i} /> : null;
          })}
          {CITIES.map((c) => (
            <CityNode
              key={c.id}
              city={c}
              store={store}
              active={hover === c.id}
              onHover={setHover}
            />
          ))}
        </Rig>
      </Canvas>
      <LabelLayer store={store} labels={labels} />
    </div>
  );
}
