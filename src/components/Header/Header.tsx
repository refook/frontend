import React, {useContext, useState} from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store';
import { setTheme } from '../../store/slices/uiSlice';
import { SunIcon, MoonIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import styles from './Header.module.css';
import {KeycloakContext} from "../../providers/KeycloakProvider.tsx";

const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const { theme } = useAppSelector((state) => state.ui);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const context = useContext(KeycloakContext);

  if (context == null) {
    throw new Error('KeycloakContext must be used within a KeycloakProvider');
  }

  const {authenticated, user, login, logout, register, keycloak} = context;

  const toggleTheme = () => {
    dispatch(setTheme(theme === 'light' ? 'dark' : 'light'));
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
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
              <div onClick={logout} className={styles.loginButton}>
                Выйти
              </div>
            </div>
          ) : (

            <div className={styles.authButtons}>
              <div onClick={login} className={styles.loginButton}>
                Войти
              </div>
              <div onClick={register} className={styles.registerButton}>
                Регистрация
              </div>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            className={styles.mobileMenuButton}
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
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
      <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
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
          {isAuthenticated ? (
            <div className={styles.mobileUserInfo}>
              <span className={styles.mobileUserName}>{user?.name}</span>
              {user?.avatar && (
                <img
                  src={user.avatar}
                  alt="Avatar"
                  className={styles.mobileAvatar}
                />
              )}
              <div onClick={logout} className={styles.loginButton}>
                Выйти
              </div>
            </div>
          ) : (
              <div className={styles.authButtons}>
                <div onClick={login} className={styles.loginButton}>
                  Войти
                </div>
                <div onClick={register} className={styles.registerButton}>
                  Регистрация
                </div>
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