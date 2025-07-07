import React from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store';
import { setTheme } from '../../store/slices/uiSlice';
import { SunIcon, MoonIcon, Bars3Icon } from '@heroicons/react/24/outline';
import styles from './Header.module.css';

const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const { theme } = useAppSelector((state) => state.ui);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const toggleTheme = () => {
    dispatch(setTheme(theme === 'light' ? 'dark' : 'light'));
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <span className={styles.logoText}>RecipeApp</span>
        </Link>

        {/* Navigation */}
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

          {/* User section */}
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
            aria-label="Открыть меню"
          >
            <Bars3Icon className={styles.icon} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header; 