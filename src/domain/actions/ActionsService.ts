/**
 * Paso 02 · Servicio de acciones por celda (EP-05.1).
 * Implementa Command / Facade para ejecutar herramientas sobre la grilla.
 */
import type { TileNode } from '../grid';
import type { ActionResult, ActionsService, ToolId } from './index';

export class DefaultActionsService implements ActionsService {
  execute(
    tool: ToolId,
    target: TileNode,
    grid: readonly TileNode[],
    extra?: { cultivo?: string },
  ): ActionResult {
    const updated = grid.map((t) => ({ ...t, suelo: { ...t.suelo } }));
    const cell = updated.find((t) => t.id === target.id);
    if (!cell) return { ok: false, motivo: 'Celda no encontrada', tiles: [...grid] };

    switch (tool) {
      case 'arar': {
        if (cell.vegetacionId !== null) {
          return { ok: false, motivo: 'Coseche o remueva el cultivo antes de arar', tiles: [...grid] };
        }
        // Descompacta y airea el suelo
        cell.suelo.materiaOrganica = +(cell.suelo.materiaOrganica + 0.1).toFixed(1);
        return { ok: true, tiles: updated };
      }

      case 'abonar': {
        // Incrementa N-P-K y materia orgánica
        cell.suelo.n = Math.min(150, cell.suelo.n + 25);
        cell.suelo.p = Math.min(80, cell.suelo.p + 15);
        cell.suelo.k = Math.min(300, cell.suelo.k + 35);
        cell.suelo.materiaOrganica = +(cell.suelo.materiaOrganica + 0.5).toFixed(1);
        return { ok: true, tiles: updated };
      }

      case 'regar': {
        // Eleva la humedad al 90 % (cerca a Capacidad de Campo)
        cell.humedad = Math.min(100, Math.max(cell.humedad, 90));
        return { ok: true, tiles: updated };
      }

      case 'canal': {
        // Eleva humedad local y propaga humedad a vecinas
        cell.humedad = 100;
        const neighbors = updated.filter(
          (t) =>
            Math.abs(t.coords.x - cell.coords.x) + Math.abs(t.coords.z - cell.coords.z) === 1,
        );
        neighbors.forEach((n) => {
          n.humedad = Math.min(100, n.humedad + 20);
        });
        return { ok: true, tiles: updated };
      }

      case 'sembrar': {
        if (cell.vegetacionId !== null) {
          return { ok: false, motivo: 'La celda ya tiene un cultivo', tiles: [...grid] };
        }
        const cultivo = extra?.cultivo ?? 'Papa';
        cell.vegetacionId = cultivo;
        // La siembra consume ligera humedad inicial
        cell.humedad = Math.max(10, cell.humedad - 5);
        return { ok: true, tiles: updated };
      }

      case 'cosechar': {
        if (cell.vegetacionId === null) {
          return { ok: false, motivo: 'No hay cultivo para cosechar', tiles: [...grid] };
        }
        cell.vegetacionId = null;
        return { ok: true, tiles: updated };
      }

      case 'remover': {
        if (cell.vegetacionId === null) {
          return { ok: false, motivo: 'No hay vegetación para remover', tiles: [...grid] };
        }
        cell.vegetacionId = null;
        return { ok: true, tiles: updated };
      }

      default:
        return { ok: false, motivo: 'Herramienta no soportada', tiles: [...grid] };
    }
  }
}

export const actionsService = new DefaultActionsService();
