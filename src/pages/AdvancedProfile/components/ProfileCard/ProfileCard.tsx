import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ProfileCard.module.css';
import { MapPinIcon, CalendarDaysIcon, Cog6ToothIcon, StarIcon } from '@heroicons/react/24/outline';

export type Badge = { id: string; label: string; color: 'gold' | 'blue' | 'purple' };

/**
 * Расширенная модель пользователя для страницы профиля.
 * @property name Отображаемое имя
 * @property username Уникальный ник без символа @
 * @property avatarUrl URL аватара (опционально)
 * @property location Город/страна пользователя (опционально)
 * @property joinedAt Дата регистрации в ISO‑формате
 * @property bio Описание/био (опционально)
 * @property stats Сводка числовых показателей
 * @property stats.recipes Кол-во рецептов
 * @property stats.followers Кол-во подписчиков
 * @property stats.following Кол-во подписок
 * @property stats.likes Суммарные лайки
 * @property badges Список значков пользователя
 */
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

/**
 * Свойства карточки профиля пользователя.
 * @param user Объект пользователя `AdvancedProfileUser`
 */
interface ProfileCardProps { user: AdvancedProfileUser; }

/**
 * Верхняя карточка профиля с ключевой информацией о пользователе.
 * Включает настройки, аватар, имя/ник, локацию, дату регистрации,
 * статблок, био и бейджи.
 *
 * @param props Параметры
 * @param props.user Объект пользователя
 */
const ProfileCard: React.FC<ProfileCardProps> = ({ user }) => {
  return (
    <div className={styles.card}>
      <div className={styles.settingsTopRight}>
        <Link to="/profile" className={`ui-btn`} aria-label="Профиль">
          <Cog6ToothIcon className={styles.settingsIcon} />
          <span className={styles.settingsLabel}>Settings</span>
        </Link>
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


