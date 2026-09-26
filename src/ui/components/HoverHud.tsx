/**
 * HUD inferior: muestra breve información de la celda activa bajo el cursor.
 * Siempre visible y complementario al CellTooltip flotante.
 */
import { SoilRepository } from '@/data';
import { summarizeTile } from '@/domain/grid';
import { useHoverStore } from '@/store/hoverStore';
import { useSimStore } from '@/store/useSimStore';
import { soilColor } from '@/theme/ramps';

export function HoverHud() {
  const id = useHoverStore((s) => s.id);
  const tile = useSimStore((s) => (id ? (s.tiles.find((t) => t.id === id) ?? null) : null));

  if (!tile) {
    return (
      <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 z-hud hidden md:flex items-center gap-2 rounded-full border border-ui-border/70 bg-ui-panel/85 px-4 py-1.5 shadow-sm text-2xs text-ui-ink-muted backdrop-blur-xs">
        <span>Pasa el mouse sobre cualquier celda para ver su información</span>
      </div>
    );
  }

  const info = summarizeTile(tile, SoilRepository.byClass(tile.suelo.clase));

  return (
    <div
      role="status"
      className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 z-hud flex items-center gap-3 rounded-full border border-ui-border bg-ui-panel/95 px-4 py-1.5 shadow-md text-2xs text-ui-ink backdrop-blur-sm transition-all"
    >
      <div className="flex items-center gap-1.5 border-r border-ui-border pr-3 font-semibold">
        <span className="swatch" style={{ backgroundColor: soilColor(tile.suelo.clase) }} />
        <span>{info.titulo}</span>
        <span className="text-ui-ink-muted">({info.clase})</span>
      </div>

      <div className="flex items-center gap-3">
        <span>
          <strong className="text-ui-ink-muted">Humedad:</strong> {tile.humedad}%
        </span>
        <span>
          <strong className="text-ui-ink-muted">pH:</strong> {tile.suelo.ph.toFixed(1)}
        </span>
        <span>
          <strong className="text-ui-ink-muted">NPK:</strong> {tile.suelo.n}·{tile.suelo.p}·{tile.suelo.k}
        </span>
        <span>
          <strong className="text-ui-ink-muted">Cultivo:</strong>{' '}
          <span className={tile.vegetacionId ? 'font-semibold text-ui-accent' : 'text-ui-ink-muted'}>
            {tile.vegetacionId ?? 'Baldío'}
          </span>
        </span>
      </div>
    </div>
  );
}
