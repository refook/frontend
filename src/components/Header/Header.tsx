import React, {useContext, useEffect, useState} from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store';
import { setTheme } from '../../store/slices/uiSlice';
import { SunIcon, MoonIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import styles from './Header.module.css';
import {KeycloakContext} from "../../providers/KeycloakProvider.tsx";

const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const { theme } = useAppSelector((state) => state.ui);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const context = useContext(KeycloakContext);

  if (context == null) {
    throw new Error('KeycloakContext must be used within a KeycloakProvider');
  }

  const { authenticated, user, login, logout, register } = context;

  const toggleTheme = () => {
    dispatch(setTheme(theme === 'light' ? 'dark' : 'light'));
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Close on route change, ESC, and on desktop resize; lock body scroll when open
  const location = useLocation();
  useEffect(() => {
    closeMobileMenu();
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMobileMenu();
      }
    };
    const handleResize = () => {
      if (window.innerWidth > 768) {
        closeMobileMenu();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const body = document.body;
    if (isMobileMenuOpen) {
      const previousOverflow = body.style.overflow;
      body.style.overflow = 'hidden';
      return () => {
        body.style.overflow = previousOverflow;
      };
    }
    return;
  }, [isMobileMenuOpen]);

  const handleLogin = () => {
    closeMobileMenu();
    login();
  };

  const handleRegister = () => {
    closeMobileMenu();
    register();
  };

  const handleLogout = () => {
    closeMobileMenu();
    logout();
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo */}
        <Link to="/" className={styles.logo} onClick={closeMobileMenu}>
          <span className={styles.logoText}>Refook</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className={styles.nav}>
          <Link to="/recipes" className={styles.navLink}>
            Рецепты
          </Link>
          <Link to="/fridge" className={styles.navLink}>
            Холодильник
          </Link>
          <Link to="/discover" className={styles.navLink}>
            Discover
          </Link>
          <Link to="/create-recipe" className={styles.navLink}>
            Создать
          </Link>
        </nav>

        {/* Right section */}
        <div className={styles.rightSection}>
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className={styles.themeToggle}
            aria-label="Переключить тему"
          >
            {theme === 'light' ? (
              <MoonIcon className={styles.icon} />
            ) : (
              <SunIcon className={styles.icon} />
            )}
          </button>

          {/* Desktop User section */}
          {authenticated ? (
            <div className={styles.userSection}>
              <span className={styles.userName}>{user?.name}</span>
              {user?.avatar && (
                <img
                  src={user.avatar}
                  alt="Avatar"
                  className={styles.avatar}
                />
              )}
              <button onClick={handleLogout} className="ui-btn ui-btn--ghost">
                Выйти
              </button>
            </div>
          ) : (

            <div className={styles.authButtons}>
              <button onClick={handleLogin} className="ui-btn ui-btn--ghost">
                Войти
              </button>
              <button onClick={handleRegister} className="ui-btn ui-btn--primary">
                Регистрация
              </button>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            className={styles.mobileMenuButton}
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobileMenu"
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className={styles.icon} />
            ) : (
              <Bars3Icon className={styles.icon} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div
        id="mobileMenu"
        className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Мобильное меню навигации"
        onKeyDown={(e) => {
          if (e.key === 'Escape') closeMobileMenu();
        }}
      >
        <nav className={styles.mobileNav}>
          <Link to="/recipes" className={styles.mobileNavLink} onClick={closeMobileMenu}>
            Рецепты
          </Link>
          <Link to="/fridge" className={styles.mobileNavLink} onClick={closeMobileMenu}>
            Холодильник
          </Link>
          <Link to="/discover" className={styles.mobileNavLink} onClick={closeMobileMenu}>
            Discover
          </Link>
          <Link to="/create-recipe" className={styles.mobileNavLink} onClick={closeMobileMenu}>
            Создать
          </Link>
        </nav>

        {/* Mobile User section */}
        <div className={styles.mobileUserSection}>
          {authenticated ? (
            <div className={styles.mobileUserInfo}>
              <span className={styles.mobileUserName}>{user?.name}</span>
              {user?.avatar && (
                <img
                  src={user.avatar}
                  alt="Avatar"
                  className={styles.mobileAvatar}
                />
              )}
              <button onClick={handleLogout} className="ui-btn ui-btn--ghost">
                Выйти
              </button>
            </div>
          ) : (
            <div className={styles.mobileAuthButtons}>
              <button onClick={handleLogin} className="ui-btn ui-btn--ghost">
                Войти
              </button>
              <button onClick={handleRegister} className="ui-btn ui-btn--primary">
                Регистрация
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className={styles.mobileMenuOverlay} onClick={closeMobileMenu} />
      )}
    </header>
  );
};

export default Header; 