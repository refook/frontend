import React from 'react';
import type { ComponentWithChildren } from '../../types';
import Header from '../Header/Header';
import styles from './Layout.module.css';

interface LayoutProps extends ComponentWithChildren {
  showHeader?: boolean;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  showHeader = true,
  className = '' 
}) => {
  return (
    <div className={`${styles.layout} ${className}`}>
      {showHeader && <Header />}
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
};

export default Layout; 