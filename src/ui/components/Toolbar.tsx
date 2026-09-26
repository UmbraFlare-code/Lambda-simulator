import { CropRepository } from '@/data';
import type { ToolId } from '@/domain/actions';
import { GridConfigBuilder, SIZE_PRESETS, type SizePreset } from '@/domain/grid';
import { useSimStore, type Overlay } from '@/store/useSimStore';

const overlays: { id: Overlay; label: string }[] = [
  { id: 'suelo', label: 'Suelo' },
  { id: 'humedad', label: 'Humedad' },
  { id: 'ph', label: 'pH' },
];

const tools: { id: ToolId | null; label: string; icon: string }[] = [
  { id: null, label: 'Inspeccionar', icon: '🔍' },
  { id: 'arar', label: 'Arar', icon: '⛏️' },
  { id: 'sembrar', label: 'Sembrar', icon: '🌱' },
  { id: 'regar', label: 'Regar', icon: '💧' },
  { id: 'abonar', label: 'Abonar', icon: '🧪' },
  { id: 'canal', label: 'Canal', icon: '🌊' },
  { id: 'cosechar', label: 'Cosechar', icon: '🌾' },
];

const sizes: { id: SizePreset; label: string }[] = [
  { id: 'demo', label: 'Demo' },
  { id: 'parcela', label: 'Parcela' },
  { id: 'microcuenca', label: 'Microcuenca' },
];

export function Toolbar() {
  const overlay = useSimStore((s) => s.overlay);
  const setOverlay = useSimStore((s) => s.setOverlay);
  const activeTool = useSimStore((s) => s.activeTool);
  const setActiveTool = useSimStore((s) => s.setActiveTool);
  const activeCrop = useSimStore((s) => s.activeCrop);
  const setActiveCrop = useSimStore((s) => s.setActiveCrop);
  const actionMessage = useSimStore((s) => s.actionMessage);
  const clearActionMessage = useSimStore((s) => s.clearActionMessage);
  const config = useSimStore((s) => s.config);
  const regenerate = useSimStore((s) => s.regenerate);

  const crops = CropRepository.all().map((c) => c.nombre);

  return (
    <header className="z-toolbar relative flex h-toolbar flex-wrap items-center gap-3 border-b border-ui-border bg-ui-panel px-4">
      <h1 className="text-sm font-semibold tracking-tight">
        Lambda <span className="text-ui-ink-muted">Simulator</span>
      </h1>

      <div role="group" aria-label="Herramientas" className="flex items-center gap-1 border-r border-ui-border pr-3">
        {tools.map((t) => (
          <button
            key={t.label}
            className={`btn ${activeTool === t.id ? 'btn-active' : ''}`}
            aria-pressed={activeTool === t.id}
            title={t.label}
            onClick={() => setActiveTool(t.id)}
          >
            <span>{t.icon}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {activeTool === 'sembrar' && (
        <div className="flex items-center gap-1.5 border-r border-ui-border pr-3 text-xs">
          <label htmlFor="crop-select" className="text-ui-ink-muted">
            Cultivo:
          </label>
          <select
            id="crop-select"
            value={activeCrop}
            onChange={(e) => setActiveCrop(e.target.value)}
            className="rounded border border-ui-border bg-ui-panel px-2 py-1 text-xs text-ui-ink"
          >
            {crops.map((crop) => (
              <option key={crop} value={crop}>
                {crop}
              </option>
            ))}
          </select>
        </div>
      )}

      <div role="group" aria-label="Overlay" className="flex gap-1 border-r border-ui-border pr-3">
        {overlays.map((o) => (
          <button
            key={o.id}
            className={`btn ${overlay === o.id ? 'btn-active' : ''}`}
            aria-pressed={overlay === o.id}
            onClick={() => setOverlay(o.id)}
          >
            {o.label}
          </button>
        ))}
      </div>

      <div role="group" aria-label="Tamaño de grilla" className="ml-auto flex items-center gap-1">
        {sizes.map((s) => {
          const active = config.rows === SIZE_PRESETS[s.id].rows && config.cols === SIZE_PRESETS[s.id].cols;
          return (
            <button
              key={s.id}
              className={`btn ${active ? 'btn-active' : ''}`}
              aria-pressed={active}
              onClick={() => regenerate(new GridConfigBuilder().preset(s.id).seed(config.seed).build())}
            >
              {s.label}
              <span className="value opacity-70">
                {SIZE_PRESETS[s.id].rows}×{SIZE_PRESETS[s.id].cols}
              </span>
            </button>
          );
        })}
      </div>

      {actionMessage && (
        <div
          role="status"
          className="absolute bottom--9 left-1/2 -translate-x-1/2 z-hud flex items-center gap-2 rounded-md border border-ui-border bg-ui-panel px-3 py-1 shadow-md text-xs text-ui-ink"
        >
          <span>{actionMessage}</span>
          <button
            className="ml-1 text-ui-ink-muted hover:text-ui-ink"
            onClick={clearActionMessage}
            aria-label="Cerrar notificación"
          >
            ✕
          </button>
        </div>
      )}
    </header>
  );
}
