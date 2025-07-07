import React from 'react';
import type { ComponentWithChildren, ComponentWithClassName } from '../../types';
import styles from './Card.module.css';

interface CardProps extends ComponentWithChildren, ComponentWithClassName {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  padding = 'medium',
  onClick,
  ...rest
}) => {
  const cardClasses = [
    styles.card,
    styles[variant],
    styles[`padding-${padding}`],
    onClick ? styles.clickable : '',
    className,
  ].filter(Boolean).join(' ');

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      className={cardClasses}
      onClick={onClick}
      {...rest}
    >
      {children}
    </Component>
  );
};

export default Card; 