import { describe, expect, it } from 'vitest';
import { SoilRepository } from '@/data';
import type { TileNode } from './TileNode';
import { summarizeTile } from './tileSummary';

const tile: TileNode = {
  id: '2:3',
  coords: { x: 2, z: 3 },
  elevacion: 0,
  suelo: { clase: 'Arcilla', ph: 6.3, n: 42, p: 28, k: 190, materiaOrganica: 2.1 },
  humedad: 45,
  vegetacionId: null,
};

const valor = (label: string): string | undefined =>
  summarizeTile(tile).rows.find((r) => r.label === label)?.value;

describe('summarizeTile', () => {
  it('titula con coordenadas, no con el id interno', () => {
    expect(summarizeTile(tile).titulo).toBe('Celda 2:3');
  });

  it('formatea pH con un decimal y la terna N·P·K', () => {
    expect(valor('pH')).toBe('6.3');
    expect(valor('N·P·K')).toBe('42·28·190');
  });

  it('toma el nombre en inglés del catálogo cuando la clase existe', () => {
    expect(summarizeTile(tile, SoilRepository.byClass('Arcilla')).claseEn).toBe('Clay');
    expect(summarizeTile(tile).claseEn).toBeNull();
  });

  it('distingue celda vacía de celda sembrada e incluye materia orgánica', () => {
    expect(valor('Vegetación')).toBe('sin cultivo');
    expect(summarizeTile({ ...tile, vegetacionId: 'Papa' }).rows[3].value).toBe('Papa');
    expect(valor('M. orgánica')).toBe('2.1 %');
  });
});
