import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AvisosPage from './AvisosPage';

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

// Mock useFirestore
const mockUseCollectionSnapshot = vi.fn();
const mockDeleteDocument = vi.fn();
vi.mock('../../hooks/useFirestore', () => ({
  useCollectionSnapshot: (path: string, order: string) => mockUseCollectionSnapshot(path, order),
  deleteDocument: (path: string, id: string) => mockDeleteDocument(path, id)
}));

// Mock deletePdf from storage
const mockDeletePdf = vi.fn();
vi.mock('../../lib/storage', () => ({
  deletePdf: (num: string) => mockDeletePdf(num)
}));

// Mock useDatos from DatosContext
const mockSetAvisoElegido = vi.fn();
vi.mock('../../contexts/DatosContext', () => ({
  useDatos: () => ({
    setAvisoElegido: mockSetAvisoElegido
  })
}));

describe('AvisosPage', () => {
  const mockAvisos = [
    {
      id: 'a1',
      numAviso: 'AV-00001',
      cliente: { nombre: 'Client One', direccion: 'Address One' },
      fechaCita: '2026-05-19T10:00:00.000Z',
      cerrado: false,
      pdf: ''
    },
    {
      id: 'a2',
      numAviso: 'AV-00002',
      cliente: { nombre: 'Client Two', direccion: 'Address Two' },
      fechaCita: '2026-05-20T12:30:00.000Z',
      cerrado: true,
      pdf: 'https://pdf-url.com/a2.pdf'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCollectionSnapshot.mockReturnValue({
      data: mockAvisos,
      loading: false
    });
  });

  it('renders filter elements, search bar, and list items', () => {
    render(<AvisosPage />);

    expect(screen.getByPlaceholderText('AVISOS.COMUN.BUSCAR')).toBeInTheDocument();
    expect(screen.getByText('AVISOS.FILTRO.TITLE:')).toBeInTheDocument();
    
    // Shows only active avisos by default
    expect(screen.getByText('Client One')).toBeInTheDocument();
    expect(screen.getByText('Address One')).toBeInTheDocument();
    expect(screen.getByText('AV-00001')).toBeInTheDocument();
    expect(screen.getByText('19/05 12:00')).toBeInTheDocument(); // 19/05 12:00 in +02:00 zone (10:00 UTC)

    // Closed ones are not visible initially since default is 'activos'
    expect(screen.queryByText('Client Two')).not.toBeInTheDocument();
  });

  it('filters list by search bar input', () => {
    // Show all to test search properly
    render(<AvisosPage />);
    
    // Let's filter in the active ones
    const searchInput = screen.getByPlaceholderText('AVISOS.COMUN.BUSCAR');
    fireEvent.change(searchInput, { target: { value: 'One' } });
    expect(screen.getByText('Client One')).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'None' } });
    expect(screen.getByText('AVISOS.COMUN.NO_RESULTADOS')).toBeInTheDocument();
  });

  it('filters list by status dropdown', () => {
    render(<AvisosPage />);

    const select = screen.getByRole('combobox');
    
    // Change to cerrados
    fireEvent.change(select, { target: { value: 'cerrados' } });
    expect(screen.queryByText('Client One')).not.toBeInTheDocument();
    expect(screen.getByText('Client Two')).toBeInTheDocument();

    // Change to todos
    fireEvent.change(select, { target: { value: 'todos' } });
    expect(screen.getByText('Client One')).toBeInTheDocument();
    expect(screen.getByText('Client Two')).toBeInTheDocument();
  });

  it('navigates to details tab and sets selected aviso in context', () => {
    render(<AvisosPage />);

    fireEvent.click(screen.getByText('Client One'));
    
    expect(mockSetAvisoElegido).toHaveBeenCalledWith(mockAvisos[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/detalle');
  });

  it('shows edit button only for open (not cerrado) avisos', () => {
    mockUseCollectionSnapshot.mockReturnValue({
      data: mockAvisos,
      loading: false
    });
    
    render(<AvisosPage />);
    
    // Default is actives (contains mockAvisos[0] which is open)
    expect(screen.getByTitle('AVISOS.COMUN.EDITAR')).toBeInTheDocument();

    // Change to closed
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'cerrados' } });

    // No edit button should render for closed aviso
    expect(screen.queryByTitle('AVISOS.COMUN.EDITAR')).not.toBeInTheDocument();
  });

  it('navigates to edit screen on clicking edit button', () => {
    render(<AvisosPage />);

    fireEvent.click(screen.getByTitle('AVISOS.COMUN.EDITAR'));
    expect(mockNavigate).toHaveBeenCalledWith('/add-aviso/a1');
  });

  it('navigates to new aviso screen on clicking fab button', () => {
    render(<AvisosPage />);

    fireEvent.click(screen.getByRole('button', { name: '+' }));
    expect(mockNavigate).toHaveBeenCalledWith('/add-aviso/new');
  });

  it('shows delete modal and triggers database/pdf deletion on confirmation', async () => {
    // Show all so we can delete a closed one with PDF
    render(<AvisosPage />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'todos' } });

    // Delete AV-00002 which has a pdf
    const deleteButtons = screen.getAllByTitle('AVISOS.COMUN.BORRAR');
    fireEvent.click(deleteButtons[1]); // Delete target = item 2

    expect(screen.getByText('AVISOS.COMUN.BORRAR_MSG')).toBeInTheDocument();

    // Click cancel
    fireEvent.click(screen.getByRole('button', { name: 'AVISOS.COMUN.NO' }));
    expect(mockDeleteDocument).not.toHaveBeenCalled();

    // Open again
    fireEvent.click(deleteButtons[1]);
    
    // Confirm delete
    fireEvent.click(screen.getByRole('button', { name: 'AVISOS.COMUN.SI' }));

    await waitFor(() => {
      expect(mockDeleteDocument).toHaveBeenCalledWith('avisos', 'a2');
      expect(mockDeletePdf).toHaveBeenCalledWith('AV-00002');
      expect(screen.queryByText('AVISOS.COMUN.BORRAR_MSG')).not.toBeInTheDocument();
    });
  });
});
