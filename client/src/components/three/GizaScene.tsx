import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

export interface GizaSceneProps {
  /** 'hero' = camera dollies with page scroll. 'ambient' = slow orbit only. */
  mode?: 'hero' | 'ambient';
  /** Lower particle counts for phones / weak GPUs. */
  lowPower?: boolean;
}

const SAND = '#c98b4a';
const SAND_DARK = '#3a2412';

/** Procedural sky: deep indigo night at the top melting into amber at the horizon. */
function Sky() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: {},
        vertexShader: `varying vec3 vPos; void main(){ vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `
          varying vec3 vPos;
          void main(){
            float h = normalize(vPos).y;
            vec3 top = vec3(0.015, 0.02, 0.09);
            vec3 mid = vec3(0.23, 0.10, 0.20);
            vec3 low = vec3(1.0, 0.52, 0.18);
            vec3 c = mix(low, mid, smoothstep(0.0, 0.22, h));
            c = mix(c, top, smoothstep(0.18, 0.75, h));
            gl_FragColor = vec4(c, 1.0);
          }`,
      }),
    [],
  );
  return (
    <mesh material={material} renderOrder={-10}>
      <sphereGeometry args={[400, 32, 24]} />
    </mesh>
  );
}

function Sun() {
  const glow = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (glow.current) {
      const s = 1 + Math.sin(clock.elapsedTime * 0.8) * 0.03;
      glow.current.scale.setScalar(s);
    }
  });
  return (
    <group position={[30, 14, -170]}>
      <mesh>
        <circleGeometry args={[7, 64]} />
        <meshBasicMaterial color="#ffd39a" toneMapped={false} />
      </mesh>
      <mesh ref={glow}>
        <circleGeometry args={[26, 64]} />
        <meshBasicMaterial
          color="#ff8a3d"
          transparent
          opacity={0.22}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/** Rolling dunes: a plane displaced by layered sines, tinted by height. */
function Dunes() {
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(320, 240, 160, 120);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const lo = new THREE.Color(SAND_DARK);
    const hi = new THREE.Color(SAND);
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      // flat plateau in the middle so the pyramids sit on solid ground
      const plateau = THREE.MathUtils.smoothstep(Math.hypot(x * 0.8, (z + 40) * 1.2), 38, 90);
      const h =
        (Math.sin(x * 0.045 + z * 0.02) * 3.2 +
          Math.sin(x * 0.11 - z * 0.07) * 1.1 +
          Math.cos(z * 0.06 + x * 0.015) * 2.2 +
          Math.sin(x * 0.3 + z * 0.22) * 0.18) *
        plateau;
      pos.setY(i, h);
      const t = THREE.MathUtils.clamp((h + 3) / 8, 0, 1);
      c.copy(lo).lerp(hi, t * 0.85);
      colors.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <mesh geometry={geometry} position={[0, -2, -40]} receiveShadow>
      <meshStandardMaterial vertexColors roughness={1} metalness={0} />
    </mesh>
  );
}

interface PyramidProps {
  position: [number, number, number];
  size: number;
  rotation?: number;
}

function Pyramid({ position, size, rotation = 0 }: PyramidProps) {
  const height = size * 0.64;
  const body = useMemo(() => new THREE.ConeGeometry(size * 0.72, height, 4, 1), [size, height]);
  const edges = useMemo(() => new THREE.EdgesGeometry(body), [body]);
  return (
    <group position={position} rotation={[0, Math.PI / 4 + rotation, 0]}>
      <mesh geometry={body} position={[0, height / 2, 0]} castShadow>
        <meshStandardMaterial
          color="#d9a766"
          roughness={0.95}
          emissive="#3b1c08"
          emissiveIntensity={0.7}
          flatShading
        />
      </mesh>
      <lineSegments geometry={edges} position={[0, height / 2, 0]}>
        <lineBasicMaterial color="#ffcf8a" transparent opacity={0.35} toneMapped={false} />
      </lineSegments>
    </group>
  );
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function useDotTexture(): THREE.Texture {
  return useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d');
    if (g) {
      const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.4, 'rgba(255,255,255,0.45)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grad;
      g.fillRect(0, 0, 64, 64);
    }
    return new THREE.CanvasTexture(c);
  }, []);
}

/** Wind-blown sand: additive points that drift and wrap. */
function SandDrift({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const dot = useDotTexture();
  const { positions, speeds } = useMemo(() => {
    const rand = mulberry32(7);
    const p = new Float32Array(count * 3);
    const s = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (rand() - 0.5) * 120;
      p[i * 3 + 1] = rand() * 22 - 1;
      p[i * 3 + 2] = rand() * -110 + 20;
      s[i] = 0.4 + rand() * 1.6;
    }
    return { positions: p, speeds: s };
  }, [count]);
  useFrame(({ clock }, delta) => {
    const pts = ref.current;
    if (!pts) return;
    const arr = pts.geometry.attributes.position.array as Float32Array;
    const t = clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      arr[i * 3] += speeds[i] * delta * 3.2;
      arr[i * 3 + 1] += Math.sin(t * 0.7 + i) * delta * 0.25;
      if (arr[i * 3] > 60) arr[i * 3] = -60;
    }
    pts.geometry.attributes.position.needsUpdate = true;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#ffcf9a"
        map={dot}
        alphaMap={dot}
        size={0.35}
        sizeAttenuation
        transparent
        opacity={0.75}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}

/** Pointer parallax + scroll-driven dolly. */
function CameraRig({ mode }: { mode: 'hero' | 'ambient' }) {
  const target = useMemo(() => new THREE.Vector3(0, 6, -30), []);
  useFrame(({ clock, camera, pointer }) => {
    const vh = window.innerHeight || 1;
    const p = mode === 'hero' ? THREE.MathUtils.clamp(window.scrollY / vh, 0, 1.4) : 0;
    const t = clock.elapsedTime;
    const orbit = mode === 'ambient' ? Math.sin(t * 0.12) * 10 : 0;
    const wantX = pointer.x * 3.2 + orbit + Math.sin(t * 0.15) * 0.8;
    const wantY = 5.5 + pointer.y * 1.4 - p * 1.5 + Math.sin(t * 0.2) * 0.25;
    const wantZ = 22 - p * 34;
    camera.position.x += (wantX - camera.position.x) * 0.045;
    camera.position.y += (wantY - camera.position.y) * 0.045;
    camera.position.z += (wantZ - camera.position.z) * 0.06;
    target.set(pointer.x * 1.5, 6.5 + p * 4, -34);
    camera.lookAt(target);
  });
  return null;
}

export default function GizaScene({ mode = 'hero', lowPower = false }: GizaSceneProps) {
  return (
    <Canvas
      dpr={lowPower ? [1, 1.25] : [1, 1.75]}
      camera={{ position: [0, 5.5, 22], fov: 52, near: 0.1, far: 800 }}
      gl={{ antialias: !lowPower, alpha: false, powerPreference: 'high-performance' }}
      aria-hidden="true"
    >
      <color attach="background" args={['#05060f']} />
      <fog attach="fog" args={['#8a4a2a', 60, 230]} />
      <Sky />
      <Stars radius={300} depth={60} count={lowPower ? 1200 : 3500} factor={5} fade speed={0.6} />
      <Sun />
      <ambientLight intensity={0.45} color="#7c6aa8" />
      <directionalLight position={[-30, 14, -60]} intensity={2.6} color="#ff9a4d" />
      <directionalLight position={[40, 12, 50]} intensity={0.9} color="#ffb877" />
      <hemisphereLight args={['#2a2a5a', '#5a3318', 0.5]} />
      <Dunes />
      <Pyramid position={[0, -2, -62]} size={52} />
      <Pyramid position={[-46, -2, -50]} size={42} rotation={0.05} />
      <Pyramid position={[40, -2, -34]} size={20} rotation={-0.04} />
      <Pyramid position={[62, -2, -42]} size={14} rotation={0.02} />
      <SandDrift count={lowPower ? 450 : 1400} />
      <CameraRig mode={mode} />
    </Canvas>
  );
}
