import { describe, it, expect } from 'vitest';
import { filterItems, filterByEstado } from './filter';

interface TestItem {
  id: number;
  nombre: string;
  cerrado?: boolean;
  telefono?: string[];
  detalles?: {
    categoria: string;
  };
}

describe('filterItems', () => {
  const mockItems: TestItem[] = [
    {
      id: 1,
      nombre: 'Juan Pérez',
      cerrado: false,
      telefono: ['123456789', '987654321'],
      detalles: { categoria: 'A' }
    },
    {
      id: 2,
      nombre: 'María López',
      cerrado: true,
      telefono: ['111222333'],
      detalles: { categoria: 'B' }
    },
    {
      id: 3,
      nombre: 'Pedro Martínez',
      cerrado: false,
      detalles: { categoria: 'A' }
    }
  ];

  it('should return an empty array if items is null or undefined', () => {
    expect(filterItems(null as unknown as TestItem[], 'Juan', ['nombre'])).toEqual([]);
    expect(filterItems(undefined as unknown as TestItem[], 'Juan', ['nombre'])).toEqual([]);
  });

  it('should return all items if search value is empty or undefined', () => {
    expect(filterItems(mockItems, '', ['nombre'])).toEqual(mockItems);
    expect(filterItems(mockItems, null as unknown as string, ['nombre'])).toEqual(mockItems);
  });

  it('should filter items by a simple property (case-insensitive)', () => {
    const result = filterItems(mockItems, 'pedro', ['nombre']);
    expect(result).toHaveLength(1);
    expect(result[0].nombre).toBe('Pedro Martínez');
  });

  it('should filter items by a nested property', () => {
    const result = filterItems(mockItems, 'B', ['detalles.categoria']);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  it('should filter items by a value within an array property', () => {
    const result = filterItems(mockItems, '111222', ['telefono']);
    expect(result).toHaveLength(1);
    expect(result[0].nombre).toBe('María López');
  });

  it('should check multiple properties and return if matched in any', () => {
    const result2 = filterItems(mockItems, 'Martínez', ['nombre', 'detalles.categoria']);
    expect(result2).toHaveLength(1);
    expect(result2[0].id).toBe(3);
  });
});

describe('filterByEstado', () => {
  const mockItems = [
    { id: 1, cerrado: false },
    { id: 2, cerrado: true },
    { id: 3, cerrado: undefined },
    { id: 4 }
  ];

  it('should return empty array if items is null or undefined', () => {
    expect(filterByEstado(null as unknown as { cerrado?: boolean }[], 'activos')).toEqual([]);
  });

  it('should return all items if value is empty', () => {
    expect(filterByEstado(mockItems, '')).toEqual(mockItems);
  });

  it('should filter by activos (cerrado is false, undefined, or missing)', () => {
    const result = filterByEstado(mockItems, 'activos');
    expect(result).toHaveLength(3);
    expect(result.map(i => i.id)).toEqual([1, 3, 4]);
  });

  it('should filter by cerrados (cerrado is true)', () => {
    const result = filterByEstado(mockItems, 'cerrados');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  it('should return all items when filtering by todos or default', () => {
    expect(filterByEstado(mockItems, 'todos')).toEqual(mockItems);
    expect(filterByEstado(mockItems, 'invalid-status')).toEqual(mockItems);
  });
});
