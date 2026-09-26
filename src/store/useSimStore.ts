/**
 * Store lógico (Zustand): ÚNICA fuente de verdad. La escena 3D solo lee de aquí (docs/01).
 * Nuevos slices por fase (clima, sandbox…) se agregan en este directorio.
 */
import { create } from 'zustand';
import { SoilRepository } from '@/data';
import { actionsService, type ToolId } from '@/domain/actions';
import { createGrid, GridConfigBuilder, type GridConfig, type TileNode } from '@/domain/grid';

/** Presentación dinámica (design.md §1) */
export type ViewMode = 'superficie' | 'corte' | 'sandbox';
/** Overlays temáticos sobre la cara superior */
export type Overlay = 'suelo' | 'humedad' | 'ph';

interface SimState {
  config: GridConfig;
  tiles: TileNode[];
  selectedId: string | null;
  viewMode: ViewMode;
  overlay: Overlay;
  activeTool: ToolId | null;
  activeCrop: string;
  actionMessage: string | null;
  regenerate: (config: GridConfig) => void;
  select: (id: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
  setOverlay: (overlay: Overlay) => void;
  setActiveTool: (tool: ToolId | null) => void;
  setActiveCrop: (crop: string) => void;
  applyTool: (id: string) => void;
  clearActionMessage: () => void;
}

const soilClasses = SoilRepository.all().map((t) => t.clase);
const initialConfig = new GridConfigBuilder().preset('demo').seed(2026).build();

export const useSimStore = create<SimState>()((set, get) => ({
  config: initialConfig,
  tiles: createGrid(initialConfig, soilClasses),
  selectedId: null,
  viewMode: 'superficie',
  overlay: 'suelo',
  activeTool: null,
  activeCrop: 'Papa',
  actionMessage: null,
  regenerate: (config) =>
    set({ config, tiles: createGrid(config, soilClasses), selectedId: null, actionMessage: null }),
  select: (selectedId) => set({ selectedId }),
  setViewMode: (viewMode) => set({ viewMode }),
  setOverlay: (overlay) => set({ overlay }),
  setActiveTool: (activeTool) => set({ activeTool }),
  setActiveCrop: (activeCrop) => set({ activeCrop }),
  clearActionMessage: () => set({ actionMessage: null }),
  applyTool: (id) => {
    const { activeTool, activeCrop, tiles } = get();
    if (!activeTool) {
      set({ selectedId: id });
      return;
    }
    const target = tiles.find((t) => t.id === id);
    if (!target) return;
    const result = actionsService.execute(activeTool, target, tiles, { cultivo: activeCrop });
    if (result.ok) {
      set({ tiles: result.tiles, actionMessage: `¡Acción "${activeTool}" aplicada a ${id}!` });
    } else {
      set({ actionMessage: result.motivo ?? 'No se pudo realizar la acción' });
    }
  },
}));

export const useSelectedTile = () =>
  useSimStore((s) => (s.selectedId ? (s.tiles.find((t) => t.id === s.selectedId) ?? null) : null));
