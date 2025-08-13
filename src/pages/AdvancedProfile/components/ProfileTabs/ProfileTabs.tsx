import React, { useState } from 'react';
import styles from './ProfileTabs.module.css';
import { HeartIcon, ClockIcon, UserGroupIcon, BookOpenIcon, ChatBubbleLeftRightIcon, StarIcon } from '@heroicons/react/24/outline';

type TabId = 'favorites' | 'history' | 'following' | 'recipes' | 'comments' | 'activity';

export interface ProfileTabsProps {
  initial?: TabId;
  onChange?: (tab: TabId) => void;
}

const tabs: Array<{ id: TabId; label: string; Icon: React.ComponentType<any> }> = [
  { id: 'favorites', label: 'Favorites', Icon: HeartIcon },
  { id: 'history', label: 'History', Icon: ClockIcon },
  { id: 'following', label: 'Following', Icon: UserGroupIcon },
  { id: 'recipes', label: 'Recipes', Icon: BookOpenIcon },
  { id: 'comments', label: 'Comments', Icon: ChatBubbleLeftRightIcon },
  { id: 'activity', label: 'Activity', Icon: StarIcon },
];

const ProfileTabs: React.FC<ProfileTabsProps> = ({ initial = 'favorites', onChange }) => {
  const [active, setActive] = useState<TabId>(initial);

  const handleSelect = (id: TabId) => {
    setActive(id);
    onChange?.(id);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.bar} role="tablist" aria-label="Profile sections">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={active === id}
            className={`${styles.tab} ${active === id ? styles.tabActive : ''}`}
            onClick={() => handleSelect(id)}
          >
            <Icon className={styles.icon} />
            <span className={styles.label}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProfileTabs;


