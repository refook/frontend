import React from 'react';
import styles from './Chip.module.css';

interface ChipProps {
  emoji: string;
  label: string;
  amount?: string;
}

const Chip: React.FC<ChipProps> = ({ emoji, label, amount }) => {
  return (
    <span className={styles.chip}>
      <span className={styles.emojiWrap}>{emoji}</span>
      <span className={styles.label}>{label}</span>
      {amount && <span className={styles.amount}>{amount}</span>}
    </span>
  );
};

export default Chip;


