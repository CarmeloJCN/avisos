import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AddClient from './AddClient';

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
    t: (key: string, options?: any) => {
      if (options && typeof options === 'object') {
        return `${key} ${JSON.stringify(options)}`;
      }
      return key;
    }
  })
}));

// Mock Firestore hooks
const mockAddDocument = vi.fn();
const mockUpdateDocument = vi.fn();
const mockGetDocument = vi.fn();
vi.mock('../hooks/useFirestore', () => ({
  addDocument: (...args: any[]) => mockAddDocument(...args),
  updateDocument: (...args: any[]) => mockUpdateDocument(...args),
  getDocument: (...args: any[]) => mockGetDocument(...args)
}));

// Sibling helper methods to access inputs since labels aren't associated with htmlFor
const getNombreInput = () => screen.getByText('AVISOS.CLIENTES.NOMBRE').nextElementSibling as HTMLInputElement;
const getDireccionInput = () => screen.getByText('AVISOS.CLIENTES.DIRECCION').nextElementSibling as HTMLInputElement;
const getCifInput = () => screen.getByText('AVISOS.CLIENTES.CIF_NIF').nextElementSibling as HTMLInputElement;
const getEmailInput = () => screen.getByText('AVISOS.CLIENTES.EMAIL').nextElementSibling as HTMLInputElement;
const getPhoneInput = (num: number) => {
  const el = screen.getByText(`AVISOS.CLIENTES.TELEFONO {"num":${num}}`).nextElementSibling;
  return (el?.tagName === 'INPUT' ? el : el?.querySelector('input')) as HTMLInputElement;
};

describe('AddClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockParams = { id: 'new' };
  });

  it('renders creation form when creating a new client', () => {
    render(<AddClient />);

    expect(screen.getByText('AVISOS.CLIENTES.SUBTITLE')).toBeInTheDocument();
    expect(getNombreInput()).toBeInTheDocument();
    expect(getDireccionInput()).toBeInTheDocument();
    expect(getCifInput()).toBeInTheDocument();
    expect(getEmailInput()).toBeInTheDocument();
    // Phone 1 is always present initially
    expect(getPhoneInput(1)).toBeInTheDocument();
  });

  it('performs basic field validation on blur', async () => {
    render(<AddClient />);

    const nombreInput = getNombreInput();
    const emailInput = getEmailInput();
    const cifInput = getCifInput();

    // Blank obligatories validation
    fireEvent.blur(nombreInput);
    await waitFor(() => {
      expect(screen.getAllByText('AVISOS.ERRORES.OBLIGATORIO')).toHaveLength(2);
    });

    // Invalid email validation
    fireEvent.change(emailInput, { target: { value: 'bad-email' } });
    fireEvent.blur(emailInput);
    await waitFor(() => {
      expect(screen.getByText('AVISOS.ERRORES.FORMATO_EMAIL')).toBeInTheDocument();
    });

    // Invalid CIF validation
    fireEvent.change(cifInput, { target: { value: '123' } });
    // In AddClient, touched is set to true on first input validation check
    fireEvent.blur(nombreInput); // trigger rerender with touch validation active
    await waitFor(() => {
      expect(screen.getByText('AVISOS.ERRORES.FORMATO_CIF_NIF')).toBeInTheDocument();
    });
  });

  it('allows adding and removing secondary phone inputs', () => {
    render(<AddClient />);

    const addPhoneBtn = screen.getByRole('button', { name: '+' });
    fireEvent.click(addPhoneBtn);

    // Should render Phone 2
    expect(getPhoneInput(2)).toBeInTheDocument();

    // The add button should hide because we limit to < 2 length additions (max length 2)
    expect(screen.queryByRole('button', { name: '+' })).not.toBeInTheDocument();

    const removePhoneBtn = screen.getByRole('button', { name: '-' });
    fireEvent.click(removePhoneBtn);

    // Phone 2 should be gone
    expect(screen.queryByText('AVISOS.CLIENTES.TELEFONO {"num":2}')).not.toBeInTheDocument();
  });

  it('submits a new client successfully and triggers onComplete/navigate', async () => {
    const mockOnComplete = vi.fn();
    mockAddDocument.mockResolvedValueOnce({ id: 'new-id' });

    render(<AddClient onComplete={mockOnComplete} />);

    fireEvent.change(getNombreInput(), { target: { value: 'Client ABC' } });
    fireEvent.change(getDireccionInput(), { target: { value: 'Calle Falsa 123' } });
    fireEvent.change(getCifInput(), { target: { value: '12345678A' } });
    fireEvent.change(getEmailInput(), { target: { value: 'abc@domain.com' } });
    fireEvent.change(getPhoneInput(1), { target: { value: '666777888' } });

    fireEvent.click(screen.getByRole('button', { name: 'AVISOS.COMUN.ACEPTAR' }));

    await waitFor(() => {
      expect(mockAddDocument).toHaveBeenCalledWith('clientes', {
        nombre: 'Client ABC',
        direccion: 'Calle Falsa 123',
        cifNif: '12345678A',
        email: 'abc@domain.com',
        telefono: ['666777888']
      });
      expect(mockOnComplete).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/clientes');
    });
  });

  it('loads client detail and submits an update for an existing client', async () => {
    mockParams = { id: 'client-123' };
    mockGetDocument.mockResolvedValueOnce({
      id: 'client-123',
      nombre: 'Existing Client',
      direccion: 'Old Road 4',
      cifNif: '87654321B',
      email: 'exist@domain.com',
      telefono: ['999000111', '888777666']
    });

    render(<AddClient />);

    // Wait for the client data to load in useEffect
    await waitFor(() => {
      expect(mockGetDocument).toHaveBeenCalledWith('clientes', 'client-123');
      expect(getNombreInput().value).toBe('Existing Client');
    });

    // Make edits and save
    fireEvent.change(getNombreInput(), { target: { value: 'Updated Client' } });
    fireEvent.click(screen.getByRole('button', { name: 'AVISOS.COMUN.ACEPTAR' }));

    await waitFor(() => {
      expect(mockUpdateDocument).toHaveBeenCalledWith('clientes', 'client-123', {
        nombre: 'Updated Client',
        direccion: 'Old Road 4',
        cifNif: '87654321B',
        email: 'exist@domain.com',
        telefono: ['999000111', '888777666']
      });
      expect(mockNavigate).toHaveBeenCalledWith('/clientes');
    });
  });
});
