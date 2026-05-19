import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { ArrowLeftIcon, MenuIcon, PencilIcon, UserIcon, ExitIcon } from './ui/Icons';
import styles from './Layout.module.css';

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { t } = useTranslation();

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/login');
  };

  const getRouteConfig = (pathname: string) => {
    if (pathname === '/avisos') {
      return {
        title: t('AVISOS.TITLE'),
        showMenu: true,
        backPath: null,
        showNav: true,
      };
    }
    if (pathname === '/clientes') {
      return {
        title: t('AVISOS.CLIENTES.TITLE'),
        showMenu: true,
        backPath: null,
        showNav: true,
      };
    }
    if (pathname.startsWith('/add-aviso/')) {
      return {
        title: t('AVISOS.AVISO.TITLE'),
        showMenu: false,
        backPath: '/avisos',
        showNav: false,
      };
    }
    if (pathname === '/detalle') {
      return {
        title: t('AVISOS.AVISO.DETALLE.INFO.TITLE'),
        showMenu: false,
        backPath: '/avisos',
        showNav: false,
      };
    }
    if (pathname.startsWith('/cliente/')) {
      return {
        title: t('AVISOS.CLIENTES.CLIENTE'),
        showMenu: false,
        backPath: '/clientes',
        showNav: false,
      };
    }
    return {
      title: t('AVISOS.TITLE'),
      showMenu: true,
      backPath: null,
      showNav: true,
    };
  };

  const config = getRouteConfig(location.pathname);

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        {config.backPath ? (
          <button className={styles.backBtn} onClick={() => navigate(config.backPath!)} aria-label="Go back">
            <ArrowLeftIcon size={24} />
          </button>
        ) : (
          <button className={styles.menuBtn} onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <MenuIcon size={24} />
          </button>
        )}
        <span className={styles.headerTitle}>{config.title}</span>
      </header>

      <main className={`${styles.main} ${config.showNav ? styles.mainWithNav : ''}`}>
        <Outlet />
      </main>

      {config.showNav && (
        <nav className={styles.nav}>
          <NavLink
            to="/avisos"
            className={({ isActive }) =>
              `${styles.navBtn} ${isActive ? styles.navBtnActive : ''}`
            }
          >
            <PencilIcon size={20} className={styles.navIcon} />
            <span>{t('AVISOS.TITLE')}</span>
          </NavLink>
          <NavLink
            to="/clientes"
            className={({ isActive }) =>
              `${styles.navBtn} ${isActive ? styles.navBtnActive : ''}`
            }
          >
            <UserIcon size={20} className={styles.navIcon} />
            <span>{t('AVISOS.CLIENTES.TITLE')}</span>
          </NavLink>
        </nav>
      )}

      {menuOpen && (
        <>
          <div className={styles.menuOverlay} onClick={() => setMenuOpen(false)} />
          <div className={styles.menuPanel}>
            <div className={styles.menuHeader}>{t('AVISOS.TITLE')}</div>
            <NavLink to="/avisos" className={styles.menuItem} onClick={() => setMenuOpen(false)}>
              <PencilIcon size={18} /> {t('AVISOS.TITLE')}
            </NavLink>
            <NavLink to="/clientes" className={styles.menuItem} onClick={() => setMenuOpen(false)}>
              <UserIcon size={18} /> {t('AVISOS.CLIENTES.TITLE')}
            </NavLink>
            <button className={styles.menuItem} onClick={handleLogout}>
              <ExitIcon size={18} /> {t('AVISOS.COMUN.SALIR')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
