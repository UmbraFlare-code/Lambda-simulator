import { SceneCanvas } from '@/scene/SceneCanvas';
import { CellTooltip } from '@/ui/components/CellTooltip';
import { HoverHud } from '@/ui/components/HoverHud';
import { Inspector } from '@/ui/components/Inspector';
import { Legend } from '@/ui/components/Legend';
import { AppShell } from '@/ui/layout/AppShell';

export function App() {
  return (
    <AppShell>
      <SceneCanvas />
      <Legend />
      <Inspector />
      <HoverHud />
      <CellTooltip />
    </AppShell>
  );
}
