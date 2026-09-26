/**
 * Resumen BREVE de una celda para el tooltip de hover (docs/01 · CRUD #7).
 *
 * Es una función PURA a propósito: sin React, sin Three y sin store, así que el
 * componente solo presenta y el texto se puede testear en Node (tileSummary.test.ts).
 *
 * El detalle completo (CC, PMP, agua útil, TEW) sigue en el Inspector, que se abre
 * con click. Aquí va lo mínimo para leer la celda sin apartar el mouse del terreno.
 */
import type { Terreno } from '@/data/types';
import type { TileNode } from './TileNode';

/** Una línea `etiqueta → valor` del tooltip. */
export interface SummaryRow {
  label: string;
  value: string;
}

export interface TileSummary {
  /** "Celda 3:7": coordenadas legibles, no el id interno */
  titulo: string;
  /** Clase de suelo tal cual figura en data/terrenos.json */
  clase: string;
  /** Nombre en inglés de la clase, si el terreno está en el catálogo */
  claseEn: string | null;
  rows: SummaryRow[];
}

/** Cuatro datos y ni uno más: el tooltip acompaña, el Inspector informa. */
export function summarizeTile(tile: TileNode, terreno?: Terreno): TileSummary {
  return {
    titulo: `Celda ${tile.coords.x}:${tile.coords.z}`,
    clase: tile.suelo.clase,
    claseEn: terreno?.clase_en ?? null,
    rows: [
      { label: 'Humedad', value: `${tile.humedad} %` },
      { label: 'pH', value: tile.suelo.ph.toFixed(1) },
      { label: 'N·P·K', value: `${tile.suelo.n}·${tile.suelo.p}·${tile.suelo.k}` },
      { label: 'Vegetación', value: tile.vegetacionId ?? 'sin cultivo' },
      { label: 'M. orgánica', value: `${tile.suelo.materiaOrganica} %` },
    ],
  };
}
