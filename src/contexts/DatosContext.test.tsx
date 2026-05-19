import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DatosProvider, useDatos } from './DatosContext';
import type { Aviso, Cliente } from '../types/models';

function TestConsumer() {
  const { avisoElegido, setAvisoElegido, clientes, setClientes } = useDatos();

  return (
    <div>
      <div data-testid="aviso-num">{avisoElegido ? avisoElegido.numAviso : 'none'}</div>
      <div data-testid="clientes-count">{clientes.length}</div>
      <button onClick={() => setAvisoElegido({ id: '1', numAviso: 'AV-001', descripcionAviso: 'Test' } as Aviso)}>
        Select Aviso
      </button>
      <button onClick={() => setClientes([{ id: 'c1', nombre: 'Client 1', direccion: 'Address 1' } as Cliente])}>
        Set Clientes
      </button>
    </div>
  );
}

describe('DatosContext', () => {
  it('provides default values of null and empty array', () => {
    render(
      <DatosProvider>
        <TestConsumer />
      </DatosProvider>
    );

    expect(screen.getByTestId('aviso-num').textContent).toBe('none');
    expect(screen.getByTestId('clientes-count').textContent).toBe('0');
  });

  it('updates state for avisoElegido and clientes', () => {
    render(
      <DatosProvider>
        <TestConsumer />
      </DatosProvider>
    );

    fireEvent.click(screen.getByText('Select Aviso'));
    expect(screen.getByTestId('aviso-num').textContent).toBe('AV-001');

    fireEvent.click(screen.getByText('Set Clientes'));
    expect(screen.getByTestId('clientes-count').textContent).toBe('1');
  });

  it('throws error when useDatos is used outside DatosProvider', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => render(<TestConsumer />)).toThrow('useDatos must be used within DatosProvider');
    
    consoleErrorSpy.mockRestore();
  });
});
