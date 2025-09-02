import React, { useEffect, useRef, useState } from 'react';
import styles from './Dropdown.module.css';

interface DropdownProps {
  triggerAriaLabel?: string;
  triggerContent?: React.ReactNode;
  children: React.ReactNode;
}

export const Dropdown: React.FC<DropdownProps> & {
  Item: React.FC<DropdownItemProps>;
} = ({ triggerAriaLabel = 'Menu', triggerContent, children }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!ref.current?.contains(target)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => { document.removeEventListener('click', onDocClick); document.removeEventListener('keydown', onEsc); };
  }, [open]);

  return (
    <div className={styles.wrapper} ref={ref}>
      <button className={styles.trigger} aria-label={triggerAriaLabel} onClick={() => setOpen(v => !v)}>
        {triggerContent ?? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <circle cx="5" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
          </svg>
        )}
      </button>
      {open && (
        <div className={styles.menu} role="menu">
          {children}
        </div>
      )}
    </div>
  );
};

interface DropdownItemProps {
  onClick?: () => void;
  children: React.ReactNode;
  danger?: boolean;
}

const Item: React.FC<DropdownItemProps> = ({ onClick, children, danger }) => (
  <button role="menuitem" className={`${styles.item} ${danger ? styles.danger : ''}`} onClick={onClick}>
    {children}
  </button>
);

Dropdown.Item = Item;

export default Dropdown;


