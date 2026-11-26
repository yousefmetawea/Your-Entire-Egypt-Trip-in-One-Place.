import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * DOM labels for 3D points, without drei's <Html>.
 * <Html> mounts a second React root and unmounts it inside a cleanup, which
 * makes React log "Attempted to synchronously unmount a root while React was
 * already rendering". Here the Canvas only writes projected screen positions
 * into a plain Map, and <LabelLayer> (a normal DOM overlay) reads them.
 */
export type LabelStore = Map<string, { x: number; y: number; visible: boolean }>;

const tmp = new THREE.Vector3();

export function LabelAnchor({
  id,
  store,
  offset = [0, 0.6, 0],
}: {
  id: string;
  store: LabelStore;
  offset?: [number, number, number];
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ camera, size }) => {
    const g = ref.current;
    if (!g) return;
    g.getWorldPosition(tmp);
    tmp.project(camera);
    store.set(id, {
      x: (tmp.x * 0.5 + 0.5) * size.width,
      y: (-tmp.y * 0.5 + 0.5) * size.height,
      visible: tmp.z < 1,
    });
  });
  useEffect(() => () => void store.delete(id), [id, store]);
  return <group ref={ref} position={offset} />;
}

export interface LabelItem {
  id: string;
  text: string;
  className: string;
}

export function LabelLayer({ store, labels }: { store: LabelStore; labels: LabelItem[] }) {
  const refs = useRef<Record<string, HTMLSpanElement | null>>({});
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      for (const l of labels) {
        const el = refs.current[l.id];
        const p = store.get(l.id);
        if (!el) continue;
        if (!p || !p.visible) {
          el.style.opacity = '0';
        } else {
          el.style.opacity = '1';
          el.style.transform = `translate3d(${p.x}px,${p.y}px,0) translate(-50%,-50%)`;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [labels, store]);
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {labels.map((l) => (
        <span
          key={l.id}
          ref={(el) => {
            refs.current[l.id] = el;
          }}
          className={l.className}
          style={{ position: 'absolute', left: 0, top: 0, opacity: 0 }}
        >
          {l.text}
        </span>
      ))}
    </div>
  );
}
