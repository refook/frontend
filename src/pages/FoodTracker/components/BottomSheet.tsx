import React, { useCallback, useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import styles from '../../FoodTrackerPage.module.css';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, title, subtitle, children }) => {
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);

  const handleClose = useCallback(() => {
    setDragOffset(0);
    setDragStart(null);
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [handleClose]);

  const onStart = (y: number) => {
    setDragStart(y);
  };

  const onMove = (y: number) => {
    if (dragStart == null) return;
    const diff = y - dragStart;
    setDragOffset(Math.max(0, diff));
  };

  const onEnd = () => {
    if (dragOffset > 80) {
      handleClose();
    } else {
      setDragOffset(0);
    }
    setDragStart(null);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.sheetOverlay} role="dialog" aria-modal="true">
      <div
        className={styles.sheetBackdrop}
        onClick={handleClose}
        aria-hidden="true"
      />
      <div
        className={styles.sheet}
        style={{ transform: `translateY(${dragOffset}px)` }}
        onMouseDown={(e) => onStart(e.clientY)}
        onMouseMove={(e) => dragStart != null && onMove(e.clientY)}
        onMouseUp={onEnd}
        onMouseLeave={dragStart != null ? onEnd : undefined}
        onTouchStart={(e) => onStart(e.touches[0].clientY)}
        onTouchMove={(e) => onMove(e.touches[0].clientY)}
        onTouchEnd={onEnd}
      >
        <div className={styles.sheetHandle} />
        <div className={styles.sheetHeader}>
          <div>
            <p className={styles.hint}>{subtitle}</p>
            <h2 className={styles.modalTitle}>{title}</h2>
          </div>
          <button className={styles.closeButton} onClick={handleClose} aria-label="Закрыть">
            <XMarkIcon width={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default BottomSheet;
