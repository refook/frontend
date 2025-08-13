import React from 'react';
import styles from './Chip.module.css';

interface ChipProps {
  emoji: string;
  label: string;
  amount?: string;
}

/**
 * Компонент Chip — компактный бейдж, отображающий эмодзи, подпись и опциональное количество.
 * Подходит для вывода мета‑информации (тегов, статусов, краткой статистики).
 *
 * @param emoji Эмодзи‑значок, который отображается слева.
 * @param label Текстовая подпись чипа.
 * @param amount Необязательное числовое значение (например, количество), отображается справа.
 */
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


