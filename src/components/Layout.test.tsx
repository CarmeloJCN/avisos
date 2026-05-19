import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Layout from './Layout';

// Mock react-router-dom
const mockNavigate = vi.fn();
const mockLocation = { pathname: '/avisos' };
vi.mock('react-router-dom', () => ({
  Outlet: () => <div data-testid="outlet">Outlet Content</div>,
  NavLink: ({ children, to, className, ...rest }: any) => {
    // Mock computed class based on hardcoded active state for testing
    const isActive = to === '/avisos';
    const computedClass = typeof className === 'function' ? className({ isActive }) : className;
    return (
      <a href={to} className={computedClass} data-testid={`nav-link-${to.slice(1)}`} {...rest}>
        {children}
      </a>
    );
  },
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

// Mock useAuth
const mockLogout = vi.fn();
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    logout: mockLogout
  })
}));

describe('Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.pathname = '/avisos';
  });

  it('renders Layout with header, navigation, and outlet', () => {
    render(<Layout />);

    expect(screen.getAllByText('AVISOS.TITLE')[0]).toBeInTheDocument();
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
    
    const avisosLink = screen.getByTestId('nav-link-avisos');
    const clientesLink = screen.getByTestId('nav-link-clientes');
    
    expect(avisosLink).toBeInTheDocument();
    expect(clientesLink).toBeInTheDocument();
    
    // Check that class computing functions worked
    expect(avisosLink.className).toContain('navBtnActive');
    expect(clientesLink.className).not.toContain('navBtnActive');
  });

  it('opens and closes side menu panel when hamburger and overlay are clicked', () => {
    render(<Layout />);

    // Initially menu is closed
    expect(screen.queryByText('AVISOS.COMUN.SALIR')).not.toBeInTheDocument();

    // Click hamburger button
    const menuBtn = screen.getByRole('button', { name: /open menu/i });
    fireEvent.click(menuBtn);

    // Menu should be open
    const salirBtn = screen.getByRole('button', { name: /SALIR/i });
    expect(salirBtn).toBeInTheDocument();

    // Click navigation menu link should close menu
    const menuAvisosLink = screen.getAllByRole('link', { name: /AVISOS\.TITLE/i })[1];
    fireEvent.click(menuAvisosLink);
    expect(screen.queryByText('AVISOS.COMUN.SALIR')).not.toBeInTheDocument();
  });

  it('triggers logout and navigates to /login when Salir is clicked', () => {
    render(<Layout />);

    // Open menu
    const menuBtn = screen.getByRole('button', { name: /open menu/i });
    fireEvent.click(menuBtn);

    // Click logout button
    const salirBtn = screen.getByRole('button', { name: /SALIR/i });
    fireEvent.click(salirBtn);

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
    // Menu should also close
    expect(screen.queryByText('AVISOS.COMUN.SALIR')).not.toBeInTheDocument();
  });

  it('updates title and shows back button on sub-pages', () => {
    mockLocation.pathname = '/detalle';
    render(<Layout />);
    
    // Title is 'AVISOS.AVISO.DETALLE.INFO.TITLE'
    expect(screen.getByText('AVISOS.AVISO.DETALLE.INFO.TITLE')).toBeInTheDocument();
    
    // Back button is rendered instead of menu button
    const backBtn = screen.getByRole('button', { name: 'Go back' });
    expect(backBtn).toBeInTheDocument();

    // Menu button is NOT rendered
    expect(screen.queryByRole('button', { name: /open menu/i })).not.toBeInTheDocument();

    // Navigation bar is hidden
    expect(screen.queryByTestId('nav-link-avisos')).not.toBeInTheDocument();

    // Click back button triggers navigation
    fireEvent.click(backBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/avisos');
  });

  it('updates title and navigation on client detail page', () => {
    mockLocation.pathname = '/cliente/new';
    render(<Layout />);
    
    expect(screen.getByText('AVISOS.CLIENTES.CLIENTE')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go back' })).toBeInTheDocument();
    expect(screen.queryByTestId('nav-link-clientes')).not.toBeInTheDocument();
  });
});
