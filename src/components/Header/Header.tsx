import React, {useContext, useEffect, useRef, useState} from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store';
import { setTheme } from '../../store/slices/uiSlice';
import { SunIcon, MoonIcon, Bars3Icon, XMarkIcon, UserCircleIcon, Cog6ToothIcon, UserIcon, ArrowRightOnRectangleIcon, ArrowLeftOnRectangleIcon, BookmarkIcon, SparklesIcon } from '@heroicons/react/24/outline';
import styles from './Header.module.css';
import {KeycloakContext} from "../../providers/KeycloakProvider.tsx";

const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const { theme } = useAppSelector((state) => state.ui);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  const context = useContext(KeycloakContext);

  if (context == null) {
    throw new Error('KeycloakContext must be used within a KeycloakProvider');
  }

  const { authenticated, user, login, logout, register, manageAccount } = context;

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
        setIsProfileMenuOpen(false);
      }
    };
    const handleResize = () => {
      if (window.innerWidth > 768) {
        closeMobileMenu();
      }
    };
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 2);
    };
    const handleClickOutside = (event: MouseEvent) => {
      if (!profileMenuRef.current) return;
      const target = event.target as Node;
      if (!profileMenuRef.current.contains(target)) {
        setIsProfileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mousedown', handleClickOutside);
    handleScroll();
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
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
    setIsProfileMenuOpen(false);
    login();
  };

  const handleRegister = () => {
    closeMobileMenu();
    setIsProfileMenuOpen(false);
    register();
  };

  const handleLogout = () => {
    closeMobileMenu();
    setIsProfileMenuOpen(false);
    logout();
  };

  const handleToggleTheme = () => {
    setIsProfileMenuOpen(false);
    dispatch(setTheme(theme === 'light' ? 'dark' : 'light'));
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen((prev) => !prev);
  };

  return (
    <header className={`${styles.header} ${isScrolled ? styles.headerScrolled : ''}`}>
      <div className={styles.container}>
        {/* Logo */}
        <Link to="/" className={styles.logo} onClick={closeMobileMenu}>
          <span className={styles.logoText}>Refook</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className={styles.nav}>
          <Link
            to="/recipes"
            className={`${styles.navLink} ${location.pathname.startsWith('/recipes') ? styles.navLinkActive : ''}`}
            aria-current={location.pathname.startsWith('/recipes') ? 'page' : undefined}
          >
            Рецепты
          </Link>
          <Link
            to="/fridge"
            className={`${styles.navLink} ${location.pathname.startsWith('/fridge') ? styles.navLinkActive : ''}`}
            aria-current={location.pathname.startsWith('/fridge') ? 'page' : undefined}
          >
            Холодильник
          </Link>
          <Link
            to="/discover"
            className={`${styles.navLink} ${location.pathname.startsWith('/discover') ? styles.navLinkActive : ''}`}
            aria-current={location.pathname.startsWith('/discover') ? 'page' : undefined}
          >
            Discover
          </Link>
          <Link
            to="/create-recipe"
            className={`${styles.navLink} ${location.pathname.startsWith('/create-recipe') ? styles.navLinkActive : ''}`}
            aria-current={location.pathname.startsWith('/create-recipe') ? 'page' : undefined}
          >
            Создать
          </Link>
        </nav>

        {/* Right section */}
        <div className={styles.rightSection}>
          {/* Profile / Auth */}
          {/* Favorites icon */}
          <Link to="/profile/advanced?tab=favorites" className={styles.iconButton} aria-label="Избранное">
            <BookmarkIcon className={styles.icon} />
          </Link>

          {authenticated ? (
            <div className={styles.profile} ref={profileMenuRef}>
              <button
                className={styles.avatarButton}
                onClick={toggleProfileMenu}
                aria-label="Открыть меню профиля"
                aria-expanded={isProfileMenuOpen}
                aria-haspopup="menu"
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className={styles.avatar} />
                ) : (
                  <UserCircleIcon className={styles.icon} />
                )}
              </button>

              <div
                className={`${styles.profileMenu} ${isProfileMenuOpen ? styles.profileMenuOpen : ''}`}
                role="menu"
                aria-label="Меню профиля"
              >
                <div className={styles.menuList}>
                  <Link to="/admin" className={styles.menuItem} role="menuitem" onClick={() => setIsProfileMenuOpen(false)}>
                    <SparklesIcon className={styles.menuIcon} />
                    <span className={styles.menuLabel}>Админ-панель</span>
                  </Link>
                  <Link to="/profile" className={styles.menuItem} role="menuitem" onClick={() => setIsProfileMenuOpen(false)}>
                    <UserIcon className={styles.menuIcon} />
                    <span className={styles.menuLabel}>Профиль</span>
                  </Link>
                  <Link to="/profile/advanced" className={styles.menuItem} role="menuitem" onClick={() => setIsProfileMenuOpen(false)}>
                    <SparklesIcon className={styles.menuIcon} />
                    <span className={styles.menuLabel}>Продвинутый профиль</span>
                  </Link>
                  <button className={styles.menuItem} role="menuitem" onClick={() => { setIsProfileMenuOpen(false); manageAccount(); }}>
                    <Cog6ToothIcon className={styles.menuIcon} />
                    <span className={styles.menuLabel}>Настройки</span>
                  </button>
                  <div className={styles.menuDivider} />
                  <button className={styles.menuItem} role="menuitem" onClick={handleToggleTheme}>
                    {theme === 'light' ? (
                      <MoonIcon className={styles.menuIcon} />
                    ) : (
                      <SunIcon className={styles.menuIcon} />
                    )}
                    <span className={styles.menuLabel}>{theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}</span>
                  </button>
                  <div className={styles.menuDivider} />
                  <button className={styles.menuItem} role="menuitem" onClick={handleLogout}>
                    <ArrowRightOnRectangleIcon className={styles.menuIcon} />
                    <span className={styles.menuLabel}>Выйти</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.authButtons}>
              <button onClick={handleLogin} className="ui-btn ui-btn--primary">Войти</button>
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