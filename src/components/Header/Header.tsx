import React, {useContext, useEffect, useRef, useState} from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store';
import { setTheme } from '../../store/slices/uiSlice';
import { createPortal } from 'react-dom';
import {
  SunIcon,
  MoonIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  BookmarkIcon,
  SparklesIcon,
  HomeModernIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';
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

  const mobileNavItems = [
    {
      to: '/recipes',
      label: 'Рецепты',
      description: 'Коллекция блюд и подборок',
      icon: Squares2X2Icon,
      isActive: location.pathname.startsWith('/recipes'),
    },
    {
      to: '/fridge',
      label: 'Холодильник',
      description: 'Отслеживайте остатки и срок годности',
      icon: HomeModernIcon,
      isActive: location.pathname.startsWith('/fridge'),
    },
    {
      to: '/discover',
      label: 'Discover',
      description: 'Идеи на основе ваших предпочтений',
      icon: SparklesIcon,
      isActive: location.pathname.startsWith('/discover'),
    },
    {
      to: '/profile/advanced?tab=favorites',
      label: 'Избранное',
      description: 'Сохранённые рецепты и подборки',
      icon: BookmarkIcon,
      isActive: location.pathname.startsWith('/profile/advanced'),
    },
  ];

  const mobileMenu = (
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
      <div className={styles.mobileMenuInner}>
        <div className={styles.mobileMenuTopRow}>
          <span className={styles.mobileMenuTitle}>Навигация</span>
          <button
            type="button"
            className={styles.mobileCloseButton}
            onClick={closeMobileMenu}
            aria-label="Закрыть мобильное меню"
          >
            <XMarkIcon className={styles.mobileCloseIcon} />
          </button>
        </div>

        <div className={styles.mobileHeaderBlock}>
          {authenticated ? (
            <div className={styles.mobileProfileCard}>
              <div className={styles.mobileProfileMain}>
                {user?.photoUrl ? (
                  <img src={user.photoUrl} alt="Avatar" className={styles.mobileAvatar}
                  />
                ) : (
                  <div className={styles.mobileAvatarFallback}>
                    <UserCircleIcon className={styles.mobileAvatarIcon} />
                  </div>
                )}
                <div className={styles.mobileProfileMeta}>
                  <span className={styles.mobileGreeting}>С возвращением</span>
                  <span className={styles.mobileUserName}>{user?.name}</span>
                </div>
              </div>
              <div className={styles.mobileProfileActions}>
                <Link
                  to="/profile/advanced"
                  className={styles.mobileProfileLink}
                  onClick={closeMobileMenu}
                >
                  <UserIcon className={styles.mobileProfileLinkIcon} />
                  Профиль
                </Link>
                <button onClick={handleLogout} className={styles.mobileLogoutButton}>
                  <ArrowRightOnRectangleIcon className={styles.mobileProfileLinkIcon} />
                  Выйти
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.mobileAuthCard}>
              <div className={styles.mobileAuthText}>
                <span className={styles.mobileGreeting}>Добро пожаловать</span>
                <span className={styles.mobileAuthHint}>Войдите, чтобы синхронизировать любимые рецепты</span>
              </div>
              <div className={styles.mobileAuthButtons}>
                <button onClick={handleLogin} className="ui-btn ui-btn--ghost">
                  Войти
                </button>
                <button onClick={handleRegister} className="ui-btn ui-btn--primary">
                  Регистрация
                </button>
              </div>
            </div>
          )}
        </div>

        <nav className={styles.mobileNav}>
          <ul className={styles.mobileNavList}>
            {mobileNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={closeMobileMenu}
                    className={`${styles.mobileNavCard} ${item.isActive ? styles.mobileNavCardActive : ''}`}
                  >
                    <div className={styles.mobileNavIconWrap}>
                      <Icon className={styles.mobileNavIcon} />
                    </div>
                    <div className={styles.mobileNavCopy}>
                      <span className={styles.mobileNavLabel}>{item.label}</span>
                      <span className={styles.mobileNavDescription}>{item.description}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={styles.mobileMenuFooter}>
          <span className={styles.mobileFooterLabel}>Быстрые действия</span>
          <div className={styles.mobileQuickActions}>
            <button
              className={styles.mobilePillButton}
              onClick={handleToggleTheme}
              type="button"
            >
              {theme === 'light' ? (
                <>
                  <MoonIcon className={styles.mobilePillIcon} />
                  Тёмная тема
                </>
              ) : (
                <>
                  <SunIcon className={styles.mobilePillIcon} />
                  Светлая тема
                </>
              )}
            </button>
            {authenticated ? (
              <button
                className={styles.mobilePillButton}
                onClick={() => {
                  closeMobileMenu();
                  manageAccount();
                }}
                type="button"
              >
                <Cog6ToothIcon className={styles.mobilePillIcon} />
                Управление аккаунтом
              </button>
            ) : (
              <button
                className={styles.mobilePillButton}
                onClick={handleRegister}
                type="button"
              >
                <SparklesIcon className={styles.mobilePillIcon} />
                Создать профиль
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <header className={`${styles.header} ${isScrolled ? styles.headerScrolled : ''}`}>
        <div className={styles.container}>
          {/* Logo */}
          <Link to="/" className={styles.logo} onClick={closeMobileMenu}>
            <img src="/logo.png" alt="Refook" width={28} height={28} style={{ marginRight: 8, borderRadius: 6 }} />
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
        </nav>

        {/* Right section */}
        <div className={styles.rightSection}>
          {/* Кнопка переключения темы (на месте старого "Избранное") */}
          <button
            type="button"
            className={styles.iconButton}
            aria-label={theme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему'}
            onClick={handleToggleTheme}
          >
            {theme === 'light' ? (
              <MoonIcon className={styles.icon} />
            ) : (
              <SunIcon className={styles.icon} />
            )}
          </button>

          {/* Profile / Auth */}

          {authenticated ? (
            <div className={styles.profile} ref={profileMenuRef}>
              <button
                className={styles.avatarButton}
                onClick={toggleProfileMenu}
                aria-label="Открыть меню профиля"
                aria-expanded={isProfileMenuOpen}
                aria-haspopup="menu"
              >
                {user?.photoUrl ? (
                  <img src={user.photoUrl} alt="Avatar" className={styles.avatar} />
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
                  <Link to="/profile/advanced" className={styles.menuItem} role="menuitem" onClick={() => setIsProfileMenuOpen(false)}>
                    <SparklesIcon className={styles.menuIcon} />
                    <span className={styles.menuLabel}>Профиль</span>
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

      </header>

      {createPortal(
        <>
          {mobileMenu}
          {isMobileMenuOpen && (
            <div className={styles.mobileMenuOverlay} onClick={closeMobileMenu} />
          )}
        </>,
        document.body
      )}
    </>
  );
};

export default Header; 
