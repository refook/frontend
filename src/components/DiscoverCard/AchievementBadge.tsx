import React from 'react';
import { TrophyIcon, StarIcon, FireIcon } from '@heroicons/react/24/solid';
import styles from './AchievementBadge.module.css';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: 'trophy' | 'star' | 'fire';
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

interface AchievementBadgeProps {
  achievements: Achievement[];
  visible: boolean;
  onClose: () => void;
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievements,
  visible,
  onClose
}) => {
  if (!visible) return null;

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);

  const getIcon = (icon: string) => {
    switch (icon) {
      case 'trophy':
        return <TrophyIcon className={styles.achievementIcon} />;
      case 'star':
        return <StarIcon className={styles.achievementIcon} />;
      case 'fire':
        return <FireIcon className={styles.achievementIcon} />;
      default:
        return <StarIcon className={styles.achievementIcon} />;
    }
  };

  return (
    <div className={styles.achievementContainer}>
      <div className={styles.achievementContent}>
        <div className={styles.achievementHeader}>
          <h3>Достижения</h3>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className={styles.achievementList}>
          {unlockedAchievements.map((achievement) => (
            <div key={achievement.id} className={styles.achievementItem}>
              <div className={styles.achievementIconContainer}>
                {getIcon(achievement.icon)}
              </div>
              <div className={styles.achievementInfo}>
                <span className={styles.achievementTitle}>{achievement.title}</span>
                <span className={styles.achievementDescription}>{achievement.description}</span>
              </div>
              <div className={styles.achievementStatus}>
                <span className={styles.unlockedText}>✓</span>
              </div>
            </div>
          ))}
          
          {lockedAchievements.map((achievement) => (
            <div key={achievement.id} className={`${styles.achievementItem} ${styles.locked}`}>
              <div className={styles.achievementIconContainer}>
                {getIcon(achievement.icon)}
              </div>
              <div className={styles.achievementInfo}>
                <span className={styles.achievementTitle}>{achievement.title}</span>
                <span className={styles.achievementDescription}>{achievement.description}</span>
                {achievement.progress && achievement.maxProgress && (
                  <div className={styles.progressContainer}>
                    <div className={styles.progressBar}>
                      <div 
                        className={styles.progressFill}
                        style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                      />
                    </div>
                    <span className={styles.progressText}>
                      {achievement.progress}/{achievement.maxProgress}
                    </span>
                  </div>
                )}
              </div>
              <div className={styles.achievementStatus}>
                <span className={styles.lockedText}>🔒</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AchievementBadge; 