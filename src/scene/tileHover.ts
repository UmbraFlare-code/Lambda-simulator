/**
 * Handlers de puntero de la grilla: hover → tooltip (docs/01 · CRUD #7).
 *
 * La celda se resuelve por `instanceId`, que es el índice con el que GridRoot
 * escribió la matriz: el orden del array del store y el de las instancias son
 * el mismo por construcción, sin necesidad de índices paralelos.
 */
import { useMemo } from 'react';
import { useThree, type ThreeEvent } from '@react-three/fiber';
import { pointer, useHoverStore } from '@/store/hoverStore';
import { useSimStore } from '@/store/useSimStore';

export function useTileHover() {
  const gl = useThree((s) => s.gl);
  const setId = useHoverStore((s) => s.setId);

  return useMemo(
    () => ({
      onPointerMove: (e: ThreeEvent<PointerEvent>) => {
        const tile = e.instanceId === undefined ? undefined : useSimStore.getState().tiles[e.instanceId];
        if (!tile) return;
        pointer.x = e.clientX ?? (e.nativeEvent as PointerEvent)?.clientX ?? 0;
        pointer.y = e.clientY ?? (e.nativeEvent as PointerEvent)?.clientY ?? 0;
        setId(tile.id);
      },
      onPointerOver: (e: ThreeEvent<PointerEvent>) => {
        gl.domElement.style.cursor = 'pointer';
        if (e.instanceId !== undefined) {
          const tile = useSimStore.getState().tiles[e.instanceId];
          if (tile) {
            pointer.x = e.clientX ?? (e.nativeEvent as PointerEvent)?.clientX ?? 0;
            pointer.y = e.clientY ?? (e.nativeEvent as PointerEvent)?.clientY ?? 0;
            setId(tile.id);
          }
        }
      },
      // R3F dispara Out/Leave en cuanto el rayo deja de golpear la malla,
      // incluido al salir del canvas: ahí se oculta el tooltip.
      onPointerOut: () => {
        gl.domElement.style.cursor = '';
        setId(null);
      },
    }),
    [gl, setId],
  );
}
