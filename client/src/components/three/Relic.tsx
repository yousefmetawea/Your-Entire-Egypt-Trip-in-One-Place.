import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

/** A slim gold obelisk drawn as fine lines, with a few specks of dust drifting around it. */
function Obelisk() {
  const group = useRef<THREE.Group>(null);
  const dust = useRef<THREE.Points>(null);

  const lines = useMemo(() => {
    const shaft = new THREE.CylinderGeometry(0.42, 0.7, 5, 4, 6, true);
    const tip = new THREE.ConeGeometry(0.42, 0.8, 4, 1, true);
    tip.translate(0, 2.9, 0);
    const a = new THREE.EdgesGeometry(shaft, 1);
    const b = new THREE.EdgesGeometry(tip, 1);
    return { a, b };
  }, []);

  const dustPositions = useMemo(() => {
    const arr = new Float32Array(90 * 3);
    let seed = 11;
    const r = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (let i = 0; i < 90; i++) {
      const ang = r() * Math.PI * 2;
      const rad = 1.3 + r() * 1.6;
      arr.set([Math.cos(ang) * rad, (r() - 0.5) * 6, Math.sin(ang) * rad], i * 3);
    }
    return arr;
  }, []);

  useFrame(({ clock, pointer }, delta) => {
    const g = group.current;
    if (g) {
      g.rotation.y += delta * 0.25;
      g.rotation.x += (-pointer.y * 0.18 - g.rotation.x) * 0.05;
      g.rotation.z += (pointer.x * 0.12 - g.rotation.z) * 0.05;
      g.position.y = Math.sin(clock.elapsedTime * 0.6) * 0.12;
    }
    if (dust.current) dust.current.rotation.y -= delta * 0.12;
  });

  return (
    <group ref={group} rotation={[0, 0.5, 0]}>
      <lineSegments geometry={lines.a}>
        <lineBasicMaterial color="#b8791f" transparent opacity={0.9} />
      </lineSegments>
      <lineSegments geometry={lines.b}>
        <lineBasicMaterial color="#d99a2b" transparent opacity={1} />
      </lineSegments>
      <mesh>
        <cylinderGeometry args={[0.42, 0.7, 5, 4, 1]} />
        <meshBasicMaterial color="#e8c58a" transparent opacity={0.1} depthWrite={false} />
      </mesh>
      <points ref={dust}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dustPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#c8841f" size={0.05} transparent opacity={0.8} />
      </points>
    </group>
  );
}

export default function Relic() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.4, 12.5], fov: 32 }}
      gl={{ alpha: true, antialias: true }}
      aria-hidden="true"
    >
      <Obelisk />
    </Canvas>
  );
}
