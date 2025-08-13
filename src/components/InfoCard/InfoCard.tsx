import React from 'react';
import styles from './InfoCard.module.css';

interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

/**
 * Компонент InfoCard — небольшая карточка с иконкой, подписью и значением.
 * Подходит для отображения ключевых показателей/метаданных (время, калории, рейтинг и т.п.).
 *
 * @param icon Узел с иконкой/эмодзи, отображается слева в плашке.
 * @param label Текстовая подпись показателя (короткий заголовок).
 * @param value Основное значение/контент показателя (число, строка или React-узел).
 */
const InfoCard: React.FC<InfoCardProps> = ({ icon, label, value }) => {
  return (
    <div className={styles.card}>
      <div className={styles.iconWrap}><span className={styles.icon}>{icon}</span></div>
      <div className={styles.content}>
        <div className={styles.label}>{label}</div>
        <div className={styles.value}>{value}</div>
      </div>
    </div>
  );
};

export default InfoCard;


