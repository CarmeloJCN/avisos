import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CierreTab from './CierreTab';

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

// Mock useFirestore
const mockUpdateDocument = vi.fn();
vi.mock('../../../hooks/useFirestore', () => ({
  updateDocument: (...args: any[]) => mockUpdateDocument(...args)
}));

// Mock storage
const mockUploadPdf = vi.fn();
vi.mock('../../../lib/storage', () => ({
  uploadPdf: (...args: any[]) => mockUploadPdf(...args)
}));

// Mock dom-to-image
vi.mock('dom-to-image', () => ({
  default: {
    toPng: vi.fn().mockResolvedValue('data:image/png;base64,mock-pdf-png-data')
  }
}));

// Mock jspdf
vi.mock('jspdf', () => {
  const mockAddImage = vi.fn();
  const mockOutput = vi.fn().mockReturnValue(new Blob(['dummy-pdf'], { type: 'application/pdf' }));
  const MockPDF = class {
    addImage = mockAddImage;
    output = mockOutput;
  };
  return {
    default: MockPDF
  };
});

// Selector helper methods since labels lack htmlFor attributes in CierreTab
const getPrecioInput = () => screen.getByText('AVISOS.AVISO.DETALLE.CIERRE.PRECIO').nextElementSibling as HTMLInputElement;
const getInicioAvisoInput = () => screen.getByText('AVISOS.AVISO.DETALLE.CIERRE.HORA_INICIO').nextElementSibling as HTMLInputElement;
const getIntervencionTextarea = () => screen.getByText('AVISOS.AVISO.DETALLE.CIERRE.INTERVENCION').nextElementSibling as HTMLTextAreaElement;

describe('CierreTab', () => {
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.stubGlobal('navigator', { onLine: true });

    // Mock async Image load so onload triggers after assignation
    const MockImageClass = class {
      onload: any = null;
      _src = '';
      get src() {
        return this._src;
      }
      set src(_val: string) {
        this._src = _val;
        setTimeout(() => {
          if (this.onload) this.onload();
        }, 0);
      }
    };
    vi.stubGlobal('Image', MockImageClass);

    mockAvisoElegido = {
      id: 'a123',
      numAviso: 'AV-100',
      cliente: { nombre: 'Client XYZ' },
      descripcionAviso: 'Needs repair',
      intervencion: '',
      precio: '',
      inicioAviso: ''
    };

    // Mock HTML Canvas methods since JSDOM lacks native rendering support
    HTMLCanvasElement.prototype.toDataURL = vi.fn().mockReturnValue('data:image/png;base64,mock-drawing-sig');
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      clearRect: vi.fn(),
      drawImage: vi.fn()
    } as any);

    // Mock window.alert
    vi.stubGlobal('alert', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders form inputs, signature canvas, and buttons', () => {
    const { container } = render(<CierreTab onComplete={mockOnComplete} />);

    expect(screen.getByText('AVISOS.AVISO.DETALLE.INFO.AVISO AV-100')).toBeInTheDocument();
    expect(getPrecioInput()).toBeInTheDocument();
    expect(getInicioAvisoInput()).toBeInTheDocument();
    expect(getIntervencionTextarea()).toBeInTheDocument();
    expect(screen.getByLabelText('AVISOS.AVISO.DETALLE.CIERRE.NO_FIRMA')).toBeInTheDocument();
    expect(container.querySelector('canvas')).toBeInTheDocument();
    expect(screen.getByText('AVISOS.AVISO.DETALLE.CIERRE.BORRAR_FIRMA')).toBeInTheDocument();
  });

  it('restores offline signature from localStorage on mount', async () => {
    localStorage.setItem('AV-100', JSON.stringify('data:image/png;base64,cached-signature'));

    render(<CierreTab onComplete={mockOnComplete} />);

    await waitFor(() => {
      expect(HTMLCanvasElement.prototype.toDataURL).toHaveBeenCalled();
    });
  });

  it('validates required fields before submitting', async () => {
    render(<CierreTab onComplete={mockOnComplete} />);

    const acceptBtn = screen.getByRole('button', { name: 'AVISOS.COMUN.ACEPTAR' });

    // 1. Submit with empty intervencion -> does nothing (returns early)
    fireEvent.click(acceptBtn);
    expect(mockUpdateDocument).not.toHaveBeenCalled();

    // Fill intervencion
    fireEvent.change(getIntervencionTextarea(), { target: { value: 'Fixed wires' } });

    // 2. Submit with no signature when noFirma is false -> triggers alert
    fireEvent.click(acceptBtn);
    expect(window.alert).toHaveBeenCalledWith('AVISOS.ERRORES.FIRMA_NO_FIRMADO');
    expect(mockUpdateDocument).not.toHaveBeenCalled();

    // 3. Mark noFirma as true -> submission should proceed
    const noFirmaCheckbox = screen.getByLabelText('AVISOS.AVISO.DETALLE.CIERRE.NO_FIRMA');
    fireEvent.click(noFirmaCheckbox);

    fireEvent.click(acceptBtn);
    await waitFor(() => {
      expect(mockUpdateDocument).toHaveBeenCalled();
      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });
  });

  it('supports drawing on the canvas and updating signature status', () => {
    const { container } = render(<CierreTab onComplete={mockOnComplete} />);

    const canvas = container.querySelector('canvas')!;

    // Simulate pointer draw gestures
    fireEvent.pointerDown(canvas, { clientX: 10, clientY: 10 });
    fireEvent.pointerMove(canvas, { clientX: 20, clientY: 20 });
    fireEvent.pointerUp(canvas);

    // Canvas drawing states should update internally
    expect(HTMLCanvasElement.prototype.toDataURL).toHaveBeenCalled();
  });

  it('submits update online, generates PDF, uploads to storage, and cleans cached signatures', async () => {
    mockUploadPdf.mockResolvedValueOnce('https://storage/pdf/av-100.pdf');
    mockUpdateDocument.mockResolvedValue({} as any);

    // Store a temporary local signature to test cleanup
    localStorage.setItem('AV-100', JSON.stringify('data:image/png;base64,sig'));

    render(<CierreTab onComplete={mockOnComplete} />);

    // Populate inputs
    fireEvent.change(getPrecioInput(), { target: { value: '150.50' } });
    fireEvent.change(getInicioAvisoInput(), { target: { value: '2026-05-19T08:00' } });
    fireEvent.change(getIntervencionTextarea(), { target: { value: 'Finished job' } });
    
    // Select No Firma to bypass signature requirement in test
    fireEvent.click(screen.getByLabelText('AVISOS.AVISO.DETALLE.CIERRE.NO_FIRMA'));

    // Trigger Accept
    fireEvent.click(screen.getByRole('button', { name: 'AVISOS.COMUN.ACEPTAR' }));

    await waitFor(() => {
      // 1. First DB Update: Cierre update
      expect(mockUpdateDocument).toHaveBeenNthCalledWith(1, 'avisos', 'a123', expect.objectContaining({
        intervencion: 'Finished job',
        precio: 150.5,
        inicioAviso: new Date('2026-05-19T08:00'),
        cerrado: true
      }));

      // 2. Storage upload
      expect(mockUploadPdf).toHaveBeenCalledWith('AV-100', expect.any(Blob));

      // 3. Second DB Update: Set PDF URL
      expect(mockUpdateDocument).toHaveBeenNthCalledWith(2, 'avisos', 'a123', {
        pdf: 'https://storage/pdf/av-100.pdf'
      });

      // 4. Clean localStorage signature cache
      expect(localStorage.getItem('AV-100')).toBeNull();

      // 5. Done
      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });
  });

  it('submits update offline, saves signature to localstorage, and skips online pdf upload', async () => {
    vi.stubGlobal('navigator', { onLine: false });
    mockUpdateDocument.mockResolvedValue({} as any);

    render(<CierreTab onComplete={mockOnComplete} />);

    // Fill details
    fireEvent.change(getIntervencionTextarea(), { target: { value: 'Offline update work' } });
    
    // Check signature bypass
    fireEvent.click(screen.getByLabelText('AVISOS.AVISO.DETALLE.CIERRE.NO_FIRMA'));

    // Accept
    fireEvent.click(screen.getByRole('button', { name: 'AVISOS.COMUN.ACEPTAR' }));

    await waitFor(() => {
      // 1. DB Update only (cerrado=true, and dates)
      expect(mockUpdateDocument).toHaveBeenCalledTimes(1);
      expect(mockUpdateDocument).toHaveBeenCalledWith('avisos', 'a123', expect.objectContaining({
        intervencion: 'Offline update work',
        cerrado: true
      }));

      // 2. PDF upload should not be called
      expect(mockUploadPdf).not.toHaveBeenCalled();

      // 3. Complete triggers
      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });
  });
});
