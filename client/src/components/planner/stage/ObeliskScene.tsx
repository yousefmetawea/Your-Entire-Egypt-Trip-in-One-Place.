import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

const LIME = '#bde85c';

/** Faint carved columns on the shaft. Abstract marks only, not real hieroglyphs. */
function carvingTexture(): THREE.CanvasTexture {
  const w = 256;
  const h = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext('2d');
  if (g) {
    g.fillStyle = '#eadfbd';
    g.fillRect(0, 0, w, h);
    const grain = g.createLinearGradient(0, 0, w, 0);
    grain.addColorStop(0, 'rgba(120,96,50,0.22)');
    grain.addColorStop(0.5, 'rgba(255,245,210,0.08)');
    grain.addColorStop(1, 'rgba(120,96,50,0.22)');
    g.fillStyle = grain;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(112,86,40,0.55)';
    g.fillStyle = 'rgba(112,86,40,0.55)';
    g.lineWidth = 3;
    let seed = 11;
    const rnd = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    // One central column of marks with a thin frame line on each side.
    g.beginPath();
    g.moveTo(w * 0.2, 40);
    g.lineTo(w * 0.2, h - 120);
    g.moveTo(w * 0.8, 40);
    g.lineTo(w * 0.8, h - 120);
    g.stroke();
    for (let y = 70; y < h - 140; y += 52) {
      const kind = Math.floor(rnd() * 5);
      const cx = w / 2;
      g.beginPath();
      if (kind === 0) g.arc(cx, y, 9, 0, Math.PI * 2);
      else if (kind === 1) g.rect(cx - 12, y - 8, 24, 16);
      else if (kind === 2) {
        g.moveTo(cx - 14, y + 8);
        g.lineTo(cx, y - 10);
        g.lineTo(cx + 14, y + 8);
      } else if (kind === 3) {
        g.moveTo(cx - 12, y);
        g.bezierCurveTo(cx - 6, y - 14, cx + 6, y + 14, cx + 12, y);
      } else {
        g.moveTo(cx, y - 11);
        g.lineTo(cx, y + 11);
        g.moveTo(cx - 9, y);
        g.lineTo(cx + 9, y);
      }
      g.stroke();
    }
  }
  const texture = new THREE.CanvasTexture(g ? canvas : document.createElement('canvas'));
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.repeat.set(4, 1);
  texture.anisotropy = 4;
  return texture;
}

function glowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const g = canvas.getContext('2d');
  if (g) {
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(189,232,92,0.55)');
    grad.addColorStop(0.45, 'rgba(189,232,92,0.14)');
    grad.addColorStop(1, 'rgba(189,232,92,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
  }
  return new THREE.CanvasTexture(canvas);
}

function Obelisk({ stepIndex }: { stepIndex: number }) {
  const group = useRef<THREE.Group>(null);
  const key = useRef<THREE.DirectionalLight>(null);
  const yaw = useRef(0.5);
  const invalidate = useThree((s) => s.invalidate);
  const carving = useMemo(() => carvingTexture(), []);
  const glow = useMemo(() => glowTexture(), []);
  const shaft = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.34, 0.5, 3.6, 4, 1);
    geo.rotateY(Math.PI / 4);
    return geo;
  }, []);
  const tip = useMemo(() => {
    const geo = new THREE.ConeGeometry(0.34, 0.5, 4, 1);
    geo.rotateY(Math.PI / 4);
    return geo;
  }, []);

  useEffect(() => {
    invalidate();
  }, [stepIndex, invalidate]);

  useFrame(({ pointer }, delta) => {
    const g = group.current;
    if (!g) return;
    // Resting angle turns a little with each step. The pointer adds a small offset.
    const targetYaw = 0.5 + stepIndex * 0.22 + pointer.x * 0.35;
    const targetPitch = -pointer.y * 0.06;
    const k = 1 - Math.exp(-delta * 3.2);
    const dYaw = targetYaw - yaw.current;
    yaw.current += dYaw * k;
    const dPitch = targetPitch - g.rotation.x;
    g.rotation.x += dPitch * k;
    g.rotation.y = yaw.current;
    if (key.current) {
      key.current.position.x += (-3 + pointer.x * 3 - key.current.position.x) * k;
      key.current.position.y += (4 + pointer.y * 2 - key.current.position.y) * k;
    }
    if (Math.abs(dYaw) > 0.0008 || Math.abs(dPitch) > 0.0004) invalidate();
  });

  return (
    <>
      <ambientLight intensity={0.55} color="#9db0a2" />
      <directionalLight ref={key} position={[-3, 4, 5]} intensity={2.6} color="#fff6e0" />
      <pointLight position={[3.2, 1.5, -3]} intensity={70} distance={14} color={LIME} />
      <pointLight position={[-2.5, -1, -2.5]} intensity={9} distance={10} color="#1f6b3f" />

      <group ref={group} position={[0, -1.25, 0]}>
        <mesh position={[0, 0.06, 0]}>
          <boxGeometry args={[1.5, 0.12, 1.5]} />
          <meshStandardMaterial color="#b9a574" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.17, 0]}>
          <boxGeometry args={[1.12, 0.1, 1.12]} />
          <meshStandardMaterial color="#cdb985" roughness={0.88} />
        </mesh>
        <mesh geometry={shaft} position={[0, 2.12, 0]}>
          <meshStandardMaterial
            map={carving}
            color="#ffffff"
            roughness={0.85}
            metalness={0}
            flatShading
          />
        </mesh>
        <mesh geometry={tip} position={[0, 4.17, 0]}>
          <meshStandardMaterial color="#f3e6bd" roughness={0.5} metalness={0.2} flatShading />
        </mesh>
      </group>

      <mesh position={[0, -1.24, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.4, 3.4]} />
        <meshBasicMaterial
          map={glow}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </>
  );
}

export default function ObeliskScene({
  stepIndex,
  onReady,
}: {
  stepIndex: number;
  onReady: () => void;
}) {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.7, 11.6], fov: 30 }}
      gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
      style={{ background: 'transparent' }}
      onCreated={({ camera }) => {
        camera.lookAt(0, 0.75, 0);
        onReady();
      }}
    >
      <Obelisk stepIndex={stepIndex} />
    </Canvas>
  );
}
