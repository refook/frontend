import React from 'react';
import type { BadgeResponseDto } from '../../../../types';
import { getBadgeInitial, rarityColors, resolveBadgeIcon } from '../../RecipePreview.utils';
import styles from './BadgesChips.module.css';

type BadgesChipsProps = {
  badges: BadgeResponseDto[];
  title?: string | null;
  wrapAs?: 'section' | 'div';
  className?: string;
};

/**
 * Отображает бейджи рецепта в виде компактных чипов.
 * Показывает иконку/инициал бейджа, название и описание, окрашивая фон по редкости.
 */
const BadgesChips: React.FC<BadgesChipsProps> = ({
  badges,
  title = 'Бейджи',
  wrapAs = 'section',
  className,
}) => {
  if (!badges.length) return null;

  const Wrapper = wrapAs === 'div' ? 'div' : 'section';
  const resolvedTitle = title ?? 'Бейджи';
  const wrapperClassName = [styles.section, className].filter(Boolean).join(' ');

  return (
    <Wrapper className={wrapperClassName}>
      {title !== null && <h3 className={styles.title}>{resolvedTitle}</h3>}
      <div className={styles.list}>
        {badges.map((badge) => {
          const icon = resolveBadgeIcon(badge.icon);
          const rarityColor = rarityColors[badge.rarity] || 'var(--color-primary)';
          return (
            <div
              key={badge.id}
              className={styles.chip}
              style={{
                borderColor: rarityColor,
                background: `color-mix(in oklab, ${rarityColor} 14%, transparent)`,
              }}
            >
              <span
                className={styles.chipIcon}
                style={{ background: `color-mix(in oklab, ${rarityColor} 24%, transparent)` }}
              >
                {icon.url ? <img src={icon.url} alt={badge.title} loading="lazy" /> : icon.text || getBadgeInitial(badge.title)}
              </span>
              <span className={styles.chipContent}>
                <span className={styles.chipTitle}>{badge.title}</span>
                <span className={styles.chipDescription}>{badge.description}</span>
              </span>
            </div>
          );
        })}
      </div>
    </Wrapper>
  );
};

export default BadgesChips;
