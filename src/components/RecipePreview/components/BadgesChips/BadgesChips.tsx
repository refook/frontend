import React from 'react';
import type { RecipeMainSectionsProps } from '../../RecipePreview.types';
import { getBadgeInitial, rarityColors, resolveBadgeIcon } from '../../RecipePreview.utils';
import styles from './BadgesChips.module.css';

type BadgesChipsProps = Pick<RecipeMainSectionsProps, 'badges'>;

const BadgesChips: React.FC<BadgesChipsProps> = ({ badges }) => {
  if (!badges.length) return null;

  return (
    <section className={styles.section}>
      <h3 className={styles.title}>Бейджи</h3>
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
    </section>
  );
};

export default BadgesChips;
