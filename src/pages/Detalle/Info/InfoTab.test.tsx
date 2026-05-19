import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import InfoTab from './InfoTab';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

// Mock useDatos context
let mockAvisoElegido: any = null;
vi.mock('../../../contexts/DatosContext', () => ({
  useDatos: () => ({
    avisoElegido: mockAvisoElegido
  })
}));

describe('InfoTab', () => {
  it('returns null if no aviso is selected', () => {
    mockAvisoElegido = null;
    const { container } = render(<InfoTab />);
    expect(container.firstChild).toBeNull();
  });

  it('renders all aviso and client information with formatted dates', () => {
    mockAvisoElegido = {
      id: 'a1',
      numAviso: 'AV-1002',
      descripcionAviso: 'Test description detail',
      fechaEntrada: '2026-05-19T08:30:00.000Z',
      fechaCita: '2026-05-20T14:45:00.000Z',
      cliente: {
        nombre: 'John Doe Ltd',
        cifNif: 'A12345678',
        direccion: 'Av. Diagonal 44',
        email: 'john@doe.com',
        telefono: ['600100200', '933221100']
      }
    };

    render(<InfoTab />);

    // Numbers & simple values
    expect(screen.getByText('AVISOS.AVISO.DETALLE.INFO.AVISO AV-1002')).toBeInTheDocument();
    expect(screen.getByText('John Doe Ltd')).toBeInTheDocument();
    expect(screen.getByText('A12345678')).toBeInTheDocument();
    expect(screen.getByText('Av. Diagonal 44')).toBeInTheDocument();
    expect(screen.getByText('john@doe.com')).toBeInTheDocument();
    expect(screen.getByText('600100200, 933221100')).toBeInTheDocument();
    expect(screen.getByText('Test description detail')).toBeInTheDocument();

    // Date assertions (assumes locale is parsed correctly)
    // 2026-05-19T08:30:00.000Z formatted by InfoTab:
    // formatDate: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(2)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    const expectedEntradaDate = new Date('2026-05-19T08:30:00.000Z');
    const expectedEntradaStr = `${String(expectedEntradaDate.getDate()).padStart(2, '0')}/${String(expectedEntradaDate.getMonth() + 1).padStart(2, '0')}/${String(expectedEntradaDate.getFullYear()).slice(2)} ${String(expectedEntradaDate.getHours()).padStart(2, '0')}:${String(expectedEntradaDate.getMinutes()).padStart(2, '0')}`;
    
    expect(screen.getByText(expectedEntradaStr)).toBeInTheDocument();

    const expectedCitaDate = new Date('2026-05-20T14:45:00.000Z');
    const expectedCitaStr = `${String(expectedCitaDate.getDate()).padStart(2, '0')}/${String(expectedCitaDate.getMonth() + 1).padStart(2, '0')}/${String(expectedCitaDate.getFullYear()).slice(2)} ${String(expectedCitaDate.getHours()).padStart(2, '0')}:${String(expectedCitaDate.getMinutes()).padStart(2, '0')}`;
    
    expect(screen.getByText(expectedCitaStr)).toBeInTheDocument();
  });
});
