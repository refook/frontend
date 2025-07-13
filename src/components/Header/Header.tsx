import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store';
import { setTheme } from '../../store/slices/uiSlice';
import { SunIcon, MoonIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import styles from './Header.module.css';

const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const { theme } = useAppSelector((state) => state.ui);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
          <span className={styles.logoText}>RecipeApp</span>
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
          {isAuthenticated ? (
            <div className={styles.userSection}>
              <span className={styles.userName}>{user?.name}</span>
              {user?.avatar && (
                <img 
                  src={user.avatar} 
                  alt="Avatar" 
                  className={styles.avatar} 
                />
              )}
            </div>
          ) : (
            <div className={styles.authButtons}>
              <Link to="/login" className={styles.loginButton}>
                Войти
              </Link>
              <Link to="/register" className={styles.registerButton}>
                Регистрация
              </Link>
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
            </div>
          ) : (
            <div className={styles.mobileAuthButtons}>
              <Link to="/login" className={styles.mobileLoginButton} onClick={closeMobileMenu}>
                Войти
              </Link>
              <Link to="/register" className={styles.mobileRegisterButton} onClick={closeMobileMenu}>
                Регистрация
              </Link>
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