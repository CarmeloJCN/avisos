import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PdfTab from './PdfTab';

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

describe('PdfTab', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', { onLine: true });
    mockAvisoElegido = { id: 'a1', pdf: 'http://test-pdf.com/file.pdf' };
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders null if no aviso is selected', () => {
    mockAvisoElegido = null;
    const { container } = render(<PdfTab />);
    expect(container.firstChild).toBeNull();
  });

  it('renders PDF object when online', () => {
    render(<PdfTab />);

    // Should display PDF frame/object
    const iframe = screen.getByTitle('PDF');
    expect(iframe).toBeInTheDocument();
    expect(iframe.getAttribute('src')).toBe('http://test-pdf.com/file.pdf');
    expect(screen.queryByText('AVISOS.PDF.NO_ONLINE')).not.toBeInTheDocument();
  });

  it('renders offline message when offline', () => {
    vi.stubGlobal('navigator', { onLine: false });
    render(<PdfTab />);

    expect(screen.getByText('AVISOS.PDF.NO_ONLINE')).toBeInTheDocument();
    expect(screen.queryByTitle('PDF')).not.toBeInTheDocument();
  });

  it('updates rendering dynamically on window online/offline events', () => {
    render(<PdfTab />);

    // Starts online
    expect(screen.getByTitle('PDF')).toBeInTheDocument();

    // Trigger offline event
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    expect(screen.getByText('AVISOS.PDF.NO_ONLINE')).toBeInTheDocument();
    expect(screen.queryByTitle('PDF')).not.toBeInTheDocument();

    // Trigger online event
    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    expect(screen.getByTitle('PDF')).toBeInTheDocument();
    expect(screen.queryByText('AVISOS.PDF.NO_ONLINE')).not.toBeInTheDocument();
  });
});
