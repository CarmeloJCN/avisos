import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DetallePage from './DetallePage';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

// Mock tabs subcomponents
vi.mock('./Info/InfoTab', () => ({
  default: () => <div data-testid="mock-info-tab">Info Tab Content</div>
}));
vi.mock('./Cierre/CierreTab', () => ({
  default: ({ onComplete }: any) => (
    <div data-testid="mock-cierre-tab">
      Cierre Tab Content
      <button onClick={onComplete}>Complete Cierre</button>
    </div>
  )
}));
vi.mock('./Pdf/PdfTab', () => ({
  default: () => <div data-testid="mock-pdf-tab">Pdf Tab Content</div>
}));

// Mock useDatos context
let mockAvisoElegido: any = null;
const mockSetAvisoElegido = vi.fn();
vi.mock('../../contexts/DatosContext', () => ({
  useDatos: () => ({
    avisoElegido: mockAvisoElegido,
    setAvisoElegido: mockSetAvisoElegido
  })
}));

describe('DetallePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAvisoElegido = null;
  });

  it('redirects to /avisos and returns null if no aviso is selected', () => {
    mockAvisoElegido = null;
    const { container } = render(<DetallePage />);

    expect(container.firstChild).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/avisos', { replace: true });
  });

  it('renders Info and Cierre tabs for open (no pdf) aviso', () => {
    mockAvisoElegido = { id: 'a1', cerrado: false, pdf: '' };
    render(<DetallePage />);

    expect(screen.getByText('AVISOS.AVISO.DETALLE.INFO')).toBeInTheDocument();
    expect(screen.getByText('AVISOS.AVISO.DETALLE.FIRMAR')).toBeInTheDocument();
    expect(screen.queryByText('AVISOS.AVISO.DETALLE.PDF')).not.toBeInTheDocument();

    // Default active tab is Info
    expect(screen.getByTestId('mock-info-tab')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-cierre-tab')).not.toBeInTheDocument();

    // Switch to Cierre tab
    fireEvent.click(screen.getByText('AVISOS.AVISO.DETALLE.FIRMAR'));
    expect(screen.getByTestId('mock-cierre-tab')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-info-tab')).not.toBeInTheDocument();
  });

  it('renders Info and PDF tabs for closed (has pdf) aviso', () => {
    mockAvisoElegido = { id: 'a1', cerrado: true, pdf: 'http://xyz.pdf' };
    render(<DetallePage />);

    expect(screen.getByText('AVISOS.AVISO.DETALLE.INFO')).toBeInTheDocument();
    expect(screen.getByText('AVISOS.AVISO.DETALLE.PDF')).toBeInTheDocument();
    expect(screen.queryByText('AVISOS.AVISO.DETALLE.FIRMAR')).not.toBeInTheDocument();

    // Default active tab is Info
    expect(screen.getByTestId('mock-info-tab')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-pdf-tab')).not.toBeInTheDocument();

    // Switch to PDF tab
    fireEvent.click(screen.getByText('AVISOS.AVISO.DETALLE.PDF'));
    expect(screen.getByTestId('mock-pdf-tab')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-info-tab')).not.toBeInTheDocument();
  });

  it('navigates to /avisos when Cierre complete action triggers', () => {
    mockAvisoElegido = { id: 'a1', cerrado: false, pdf: '' };
    render(<DetallePage />);

    fireEvent.click(screen.getByText('AVISOS.AVISO.DETALLE.FIRMAR'));
    fireEvent.click(screen.getByText('Complete Cierre'));

    expect(mockNavigate).toHaveBeenCalledWith('/avisos');
  });
});
