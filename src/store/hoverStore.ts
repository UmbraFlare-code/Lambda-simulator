/**
 * Estado de hover de la grilla. Es UI, no simulación: va aparte de useSimStore
 * para que la escena 3D no se suscriba a él (único suscriptor: el tooltip).
 *
 * La POSICIÓN del cursor se mantiene en un objeto mutable y NO en el store:
 * escribirla en Zustand dispararía un render por cada mousemove. La escena la
 * escribe y el tooltip la lee dentro de un rAF, directo sobre el DOM.
 */
import { create } from 'zustand';

interface HoverState {
  /** id de la celda bajo el cursor; null si el puntero no está sobre la grilla */
  id: string | null;
  setId: (id: string | null) => void;
}

export const useHoverStore = create<HoverState>()((set) => ({
  id: null,
  // Misma celda → se devuelve el estado actual y Zustand no notifica a nadie.
  setId: (id) => set((s) => (s.id === id ? s : { id })),
}));

/** Cursor en px de viewport. Lo escribe la escena, lo lee el tooltip. */
export const pointer = { x: 0, y: 0 };
