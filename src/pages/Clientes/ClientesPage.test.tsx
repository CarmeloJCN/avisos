import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ClientesPage from './ClientesPage';

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

describe('ClientesPage', () => {
  const mockClientes = [
    { id: '1', nombre: 'Alice Smith', direccion: '123 Pine St', telefono: ['555-0100'] },
    { id: '2', nombre: 'Bob Jones', direccion: '456 Elm St', telefono: ['555-0200'] }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCollectionSnapshot.mockReturnValue({
      data: mockClientes,
      loading: false
    });
  });

  it('renders search bar and list of clients', () => {
    render(<ClientesPage />);

    expect(screen.getByPlaceholderText('AVISOS.COMUN.BUSCAR')).toBeInTheDocument();
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('123 Pine St')).toBeInTheDocument();
    expect(screen.getByText('555-0100')).toBeInTheDocument();

    expect(screen.getByText('Bob Jones')).toBeInTheDocument();
    expect(screen.getByText('456 Elm St')).toBeInTheDocument();
    expect(screen.getByText('555-0200')).toBeInTheDocument();
  });

  it('filters clients list based on search bar input', () => {
    render(<ClientesPage />);

    const searchInput = screen.getByPlaceholderText('AVISOS.COMUN.BUSCAR');
    fireEvent.change(searchInput, { target: { value: 'Alice' } });

    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.queryByText('Bob Jones')).not.toBeInTheDocument();
  });

  it('shows no results message when filter has no matches', () => {
    render(<ClientesPage />);

    const searchInput = screen.getByPlaceholderText('AVISOS.COMUN.BUSCAR');
    fireEvent.change(searchInput, { target: { value: 'Nobody' } });

    expect(screen.getByText('AVISOS.COMUN.NO_RESULTADOS')).toBeInTheDocument();
    expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument();
  });

  it('navigates to edit client page when clicking item content', () => {
    render(<ClientesPage />);

    // Click Alice Smith item
    fireEvent.click(screen.getByText('Alice Smith'));
    expect(mockNavigate).toHaveBeenCalledWith('/cliente/1');
  });

  it('navigates to edit client page when clicking item phone number', () => {
    render(<ClientesPage />);

    // Click Phone number
    fireEvent.click(screen.getByText('555-0100'));
    expect(mockNavigate).toHaveBeenCalledWith('/cliente/1');
  });

  it('navigates to new client page when clicking fab button', () => {
    render(<ClientesPage />);

    fireEvent.click(screen.getByRole('button', { name: '+' }));
    expect(mockNavigate).toHaveBeenCalledWith('/cliente/new');
  });

  it('shows delete modal and triggers deletion on confirmation', async () => {
    render(<ClientesPage />);

    // Find delete button for Alice Smith
    const deleteButtons = screen.getAllByTitle('AVISOS.COMUN.BORRAR');
    fireEvent.click(deleteButtons[0]);

    // Modal should show
    expect(screen.getByText('AVISOS.COMUN.BORRAR_MSG')).toBeInTheDocument();

    // Click 'No' closes the modal
    fireEvent.click(screen.getByRole('button', { name: 'AVISOS.COMUN.NO' }));
    expect(screen.queryByText('AVISOS.COMUN.BORRAR_MSG')).not.toBeInTheDocument();
    expect(mockDeleteDocument).not.toHaveBeenCalled();

    // Open modal again
    fireEvent.click(deleteButtons[0]);

    // Click 'Si' triggers deletion
    fireEvent.click(screen.getByRole('button', { name: 'AVISOS.COMUN.SI' }));
    await waitFor(() => {
      expect(mockDeleteDocument).toHaveBeenCalledWith('clientes', '1');
      expect(screen.queryByText('AVISOS.COMUN.BORRAR_MSG')).not.toBeInTheDocument();
    });
  });
});
