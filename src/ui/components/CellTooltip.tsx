/**
 * Tooltip de hover: información BREVE de la celda bajo el cursor (docs/01 #7).
 *
 * Vive en la capa DOM sobre el canvas, no dentro de la escena: así el texto sale
 * nítido a cualquier resolución y no suma draw calls ni geometría. Se coloca con
 * un rAF que lee `pointer`, de modo que mover el mouse NO re-renderiza React
 * (el store solo cambia al cruzar de celda).
 */
import { useEffect, useLayoutEffect, useRef } from 'react';
import { SoilRepository } from '@/data';
import { summarizeTile } from '@/domain/grid';
import { pointer, useHoverStore } from '@/store/hoverStore';
import { useSimStore } from '@/store/useSimStore';
import { soilColor } from '@/theme/ramps';

/** Separación respecto al cursor y margen mínimo contra el borde de la ventana. */
const GAP = 14;
const EDGE = 8;

export function CellTooltip() {
  const id = useHoverStore((s) => s.id);
  const tile = useSimStore((s) => (id ? (s.tiles.find((t) => t.id === id) ?? null) : null));
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    };
    window.addEventListener('pointermove', handleMove, { passive: true });
    return () => window.removeEventListener('pointermove', handleMove);
  }, []);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!id || !el) return;
    // Se mide una vez por celda: leer offsetWidth en cada frame forzaría reflow.
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const place = () => {
      if (pointer.x === 0 && pointer.y === 0) {
        el.style.opacity = '0';
        return;
      }
      el.style.opacity = '1';
      // Cerca del borde se voltea para que el tooltip nunca quede cortado.
      const flipX = pointer.x + w + GAP > window.innerWidth - EDGE;
      const flipY = pointer.y + h + GAP > window.innerHeight - EDGE;
      const targetX = Math.max(EDGE, pointer.x + (flipX ? -w - GAP : GAP));
      const targetY = Math.max(EDGE, pointer.y + (flipY ? -h - GAP : GAP));
      el.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
    };
    place(); // antes del primer pintado: sin parpadeo en la esquina
    let frame = 0;
    const follow = () => {
      place();
      frame = requestAnimationFrame(follow);
    };
    frame = requestAnimationFrame(follow);
    return () => cancelAnimationFrame(frame);
  }, [id]);

  if (!tile) return null;
  const info = summarizeTile(tile, SoilRepository.byClass(tile.suelo.clase));

  return (
    <div
      id="cell-tooltip"
      role="tooltip"
      ref={ref}
      className="panel tooltip w-56 select-none p-3 shadow-lg transition-opacity duration-100"
    >
      <div className="flex items-center justify-between border-b border-ui-border pb-1.5">
        <span className="value text-2xs font-semibold text-ui-ink">{info.titulo}</span>
        {tile.elevacion > 0 && <span className="value text-2xs text-ui-ink-muted">+{tile.elevacion}m</span>}
      </div>

      <div className="mt-2 flex items-center gap-1.5">
        <span className="swatch" style={{ backgroundColor: soilColor(tile.suelo.clase) }} />
        <span className="text-xs font-medium text-ui-ink">{info.clase}</span>
        {info.claseEn && <span className="text-2xs text-ui-ink-muted">({info.claseEn})</span>}
      </div>

      <dl className="mt-2 space-y-1">
        {info.rows.map((row) => {
          const isCrop = row.label === 'Vegetación';
          const hasCrop = isCrop && tile.vegetacionId !== null;
          return (
            <div key={row.label} className="flex items-baseline justify-between gap-3 text-2xs">
              <dt className="text-ui-ink-muted">{row.label}</dt>
              <dd className={`value ${hasCrop ? 'font-semibold text-ui-accent' : 'text-ui-ink'}`}>
                {row.value}
              </dd>
            </div>
          );
        })}
      </dl>

      <div className="mt-2 border-t border-ui-border/70 pt-1.5 text-center">
        <span className="text-2xs text-ui-ink-muted opacity-75">Clic para ficha completa</span>
      </div>
    </div>
  );
}
