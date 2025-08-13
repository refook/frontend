import React from 'react';
import styles from './ProfileCard.module.css';
import { MapPinIcon, CalendarDaysIcon, Cog6ToothIcon, StarIcon } from '@heroicons/react/24/outline';

export type Badge = { id: string; label: string; color: 'gold' | 'blue' | 'purple' };

export type AdvancedProfileUser = {
  name: string;
  username: string;
  avatarUrl?: string;
  location?: string;
  joinedAt: string;
  bio?: string;
  stats: { recipes: number; followers: number; following: number; likes: number };
  badges: Badge[];
};

function formatJoined(dateIso: string): string {
  const date = new Date(dateIso);
  const formatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });
  return `Joined ${formatter.format(date)}`;
}

interface ProfileCardProps {
  user: AdvancedProfileUser;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user }) => {
  return (
    <div className={styles.card}>
      <div className={styles.settingsTopRight}>
        <button className={`ui-btn`} aria-label="Настройки">
          <Cog6ToothIcon className={styles.settingsIcon} />
          <span className={styles.settingsLabel}>Settings</span>
        </button>
      </div>
      <div className={styles.layout}>
        <div className={styles.leftCol}>
          <div className={styles.leftHeader}>
            <div className={styles.avatar} aria-label={user.name}>
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className={styles.avatarImg} />
              ) : (
                <span className={styles.avatarFallback}>{user.name.split(' ').map(p => p[0]).slice(0, 2).join('')}</span>
              )}
            </div>

            <div className={styles.mainInfo}>
              <h1 className={styles.name}>{user.name}</h1>
              <div className={styles.handle}>@{user.username}</div>
              <div className={styles.meta}>
                {user.location && (
                  <span className={styles.metaItem}>
                    <MapPinIcon className={styles.metaIcon} />
                    {user.location}
                  </span>
                )}
                <span className={styles.metaItem}>
                  <CalendarDaysIcon className={styles.metaIcon} />
                  {formatJoined(user.joinedAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.rightCol}>
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{user.stats.recipes}</div>
              <div className={styles.statLabel}>Recipes</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{user.stats.followers}</div>
              <div className={styles.statLabel}>Followers</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{user.stats.following}</div>
              <div className={styles.statLabel}>Following</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{user.stats.likes}</div>
              <div className={styles.statLabel}>Likes</div>
            </div>
          </div>

          {user.bio && <p className={styles.bio}>{user.bio}</p>}

          <div className={styles.badgesRow}>
            {user.badges.map(badge => (
              <span key={badge.id} className={`${styles.badge} ${styles[`badge_${badge.color}`]}`}>
                <StarIcon className={styles.badgeIcon} />
                {badge.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;


