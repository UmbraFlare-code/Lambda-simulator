/**
 * Paso 01 · Grilla de cubos 1 m³ con instancing (design.md §2).
 * Solo LEE el store: la selección se despacha como acción, nunca se muta la malla como estado.
 */
import { useLayoutEffect, useMemo, useRef } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useHoverStore } from '@/store/hoverStore';
import { useSimStore } from '@/store/useSimStore';
import { getMaterial } from './factories/materialFactory';
import { tileColor } from './tileVisual';
import { useTileHover } from './tileHover';

const box = new THREE.BoxGeometry(1, 1, 1);
const dummy = new THREE.Object3D();
const color = new THREE.Color();

export function GridRoot() {
  const tiles = useSimStore((s) => s.tiles);
  const config = useSimStore((s) => s.config);
  const overlay = useSimStore((s) => s.overlay);
  const selectedId = useSimStore((s) => s.selectedId);
  const select = useSimStore((s) => s.select);
  const hoveredId = useHoverStore((s) => s.id);
  const ref = useRef<THREE.InstancedMesh>(null);
  const hover = useTileHover();

  // Centro de la grilla en el origen
  const offset = useMemo(() => ({ x: (config.cols - 1) / 2, z: (config.rows - 1) / 2 }), [config]);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    tiles.forEach((tile, i) => {
      // Gap mínimo entre bloques para leer la grilla a 1600 celdas
      dummy.position.set(tile.coords.x - offset.x, tile.elevacion + 0.5, tile.coords.z - offset.z);
      dummy.scale.set(0.96, 1, 0.96);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, color.set(tileColor(tile, overlay)));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingBox();
    mesh.computeBoundingSphere();
  }, [tiles, overlay, offset]);

  const selected = tiles.find((t) => t.id === selectedId);
  const hovered = hoveredId && hoveredId !== selectedId ? tiles.find((t) => t.id === hoveredId) : null;
  const applyTool = useSimStore((s) => s.applyTool);

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.instanceId !== undefined) applyTool(tiles[e.instanceId].id);
  };

  return (
    <group>
      <instancedMesh
        key={tiles.length}
        ref={ref}
        args={[box, getMaterial('terreno'), tiles.length]}
        onClick={onClick}
        onPointerMissed={() => select(null)}
        {...hover}
      />
      {hovered && (
        <mesh
          geometry={box}
          material={getMaterial('hover')}
          position={[hovered.coords.x - offset.x, hovered.elevacion + 0.5, hovered.coords.z - offset.z]}
          scale={1.01}
          raycast={() => null}
        />
      )}
      {selected && (
        <mesh
          geometry={box}
          material={getMaterial('seleccion')}
          position={[selected.coords.x - offset.x, selected.elevacion + 0.5, selected.coords.z - offset.z]}
          scale={1.02}
          raycast={() => null}
        />
      )}
    </group>
  );
}
