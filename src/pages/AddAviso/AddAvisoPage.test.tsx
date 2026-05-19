import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AddAvisoPage from './AddAvisoPage';

// Mock react-router-dom
const mockNavigate = vi.fn();
let mockParams = { id: 'new' };
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => mockParams
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

// Mock useAuth
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'user-uid-abc' }
  })
}));

// Mock Firestore hooks
const mockUseCollectionSnapshot = vi.fn();
const mockAddDocument = vi.fn();
const mockUpdateDocument = vi.fn();
const mockGetDocument = vi.fn();
const mockGetLastNumAviso = vi.fn();
const mockGetTecnicoId = vi.fn();
vi.mock('../../hooks/useFirestore', () => ({
  useCollectionSnapshot: (path: string, order: string) => mockUseCollectionSnapshot(path, order),
  addDocument: (...args: any[]) => mockAddDocument(...args),
  updateDocument: (...args: any[]) => mockUpdateDocument(...args),
  getDocument: (...args: any[]) => mockGetDocument(...args),
  getLastNumAviso: () => mockGetLastNumAviso(),
  getTecnicoId: (...args: any[]) => mockGetTecnicoId(...args)
}));

// Helper selector functions to select inputs via sibling elements since labels are not associated
const getTitleInput = () => screen.getByText('AVISOS.AVISO.TITLE').nextElementSibling as HTMLInputElement;
const getClienteSelect = () => {
  const sibling = screen.getByText('AVISOS.CLIENTES.CLIENTE').nextElementSibling;
  if (sibling && sibling.tagName === 'SELECT') {
    return sibling as HTMLSelectElement;
  }
  return sibling?.querySelector('select') as HTMLSelectElement;
};
const getFechaCitaInput = () => screen.getByText('AVISOS.AVISO.FECHA_CITA').nextElementSibling as HTMLInputElement;
const getDescripcionInput = () => screen.getByText('AVISOS.AVISO.DESCRIPCION').nextElementSibling as HTMLTextAreaElement;

describe('AddAvisoPage', () => {
  const mockClientes = [
    { id: 'c1', nombre: 'Client One', direccion: 'Addr One' },
    { id: 'c2', nombre: 'Client Two', direccion: 'Addr Two' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockParams = { id: 'new' };
    mockUseCollectionSnapshot.mockReturnValue({ data: mockClientes, loading: false });
    mockGetLastNumAviso.mockResolvedValue('AV-00005');
  });

  it('renders new aviso form with auto-incremented aviso number', async () => {
    render(<AddAvisoPage />);

    // Increments 'AV-00005' to 'AV-00006' (AVISOS_CONSTANTS.ENCABEZADO_AVISO is 'AV-')
    await waitFor(() => {
      expect(mockGetLastNumAviso).toHaveBeenCalledTimes(1);
      expect(getTitleInput().value).toBe('AV-00006');
    });

    expect(screen.getByText('AVISOS.AVISO.SUBTITLE')).toBeInTheDocument();
    expect(getClienteSelect()).toBeInTheDocument();
    expect(getFechaCitaInput()).toBeInTheDocument();
    expect(getDescripcionInput()).toBeInTheDocument();
  });

  it('defaults new aviso number suffix to 0001 if no prior aviso is found', async () => {
    mockGetLastNumAviso.mockResolvedValueOnce('');

    render(<AddAvisoPage />);

    await waitFor(() => {
      expect(getTitleInput().value).toBe('AV-0001');
    });
  });

  it('performs basic validations on fields when blurred', async () => {
    render(<AddAvisoPage />);

    const clientSelect = getClienteSelect();
    const descTextarea = getDescripcionInput();

    fireEvent.blur(clientSelect);
    await waitFor(() => {
      expect(screen.getByText('AVISOS.ERRORES.NO_CLIENTE')).toBeInTheDocument();
    });

    fireEvent.blur(descTextarea);
    await waitFor(() => {
      expect(screen.getByText('AVISOS.ERRORES.NO_DESCRIPTION')).toBeInTheDocument();
    });
  });

  it('submits a new aviso successfully with resolved technician id', async () => {
    mockGetTecnicoId.mockResolvedValueOnce('tecnico-111');
    mockAddDocument.mockResolvedValueOnce({ id: 'aviso-new' });

    render(<AddAvisoPage />);

    // Wait for the aviso number to generate
    await waitFor(() => {
      expect(getTitleInput().value).toBe('AV-00006');
    });

    // Populate fields
    fireEvent.change(getClienteSelect(), { target: { value: 'c2' } });
    fireEvent.change(getDescripcionInput(), { target: { value: 'Need repairs' } });
    fireEvent.change(getFechaCitaInput(), { target: { value: '2026-05-20T10:00' } });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'AVISOS.COMUN.ACEPTAR' }));

    await waitFor(() => {
      expect(mockGetTecnicoId).toHaveBeenCalledWith('user-uid-abc');
      expect(mockAddDocument).toHaveBeenCalledWith('avisos', expect.objectContaining({
        cliente: mockClientes[1],
        numAviso: 'AV-00006',
        descripcionAviso: 'Need repairs',
        tecnicoID: 'tecnico-111',
        cerrado: false
      }));
      expect(localStorage.getItem('tecnicoID')).toBe(JSON.stringify('tecnico-111'));
      expect(mockNavigate).toHaveBeenCalledWith('/avisos');
    });
  });

  it('uses cached technician id from localStorage on submit if present', async () => {
    localStorage.setItem('tecnicoID', JSON.stringify('cached-tecnico-222'));
    mockAddDocument.mockResolvedValueOnce({ id: 'aviso-new' });

    render(<AddAvisoPage />);

    await waitFor(() => {
      expect(getTitleInput().value).toBe('AV-00006');
    });

    fireEvent.change(getClienteSelect(), { target: { value: 'c1' } });
    fireEvent.change(getDescripcionInput(), { target: { value: 'Cached tech test' } });
    fireEvent.click(screen.getByRole('button', { name: 'AVISOS.COMUN.ACEPTAR' }));

    await waitFor(() => {
      expect(mockGetTecnicoId).not.toHaveBeenCalled();
      expect(mockAddDocument).toHaveBeenCalledWith('avisos', expect.objectContaining({
        tecnicoID: 'cached-tecnico-222'
      }));
    });
  });

  it('loads existing aviso data when in edit mode', async () => {
    mockParams = { id: 'aviso-999' };
    const dateVal = new Date('2026-05-19T17:00:00.000Z');
    mockGetDocument.mockResolvedValueOnce({
      id: 'aviso-999',
      numAviso: 'AV-00999',
      cliente: mockClientes[0],
      descripcionAviso: 'Replace filters',
      fechaCita: dateVal,
      tecnicoID: 'tech-007',
      cerrado: false
    });

    render(<AddAvisoPage />);

    // Wait for the data to populate
    await waitFor(() => {
      expect(mockGetDocument).toHaveBeenCalledWith('avisos', 'aviso-999');
      expect(getTitleInput().value).toBe('AV-00999');
      expect(getClienteSelect().value).toBe('c1');
      expect(getDescripcionInput().value).toBe('Replace filters');
    });

    // Make edit
    fireEvent.change(getDescripcionInput(), { target: { value: 'Replace filters + check pressure' } });
    fireEvent.click(screen.getByRole('button', { name: 'AVISOS.COMUN.ACEPTAR' }));

    await waitFor(() => {
      expect(mockUpdateDocument).toHaveBeenCalledWith('avisos', 'aviso-999', expect.objectContaining({
        descripcionAviso: 'Replace filters + check pressure'
      }));
      expect(mockNavigate).toHaveBeenCalledWith('/avisos');
    });
  });
});
