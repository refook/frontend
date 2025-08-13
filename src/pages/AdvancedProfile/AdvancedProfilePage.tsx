import React from 'react';
import styles from './AdvancedProfilePage.module.css';
import ProfileCard, { type AdvancedProfileUser } from './components/ProfileCard';
import ProfileTabs from './components/ProfileTabs/ProfileTabs';
import SectionHeader from './components/SectionHeader';
import FavoritesSection from './sections/Favorites/FavoritesSection';

const mockUser: AdvancedProfileUser = {
  name: 'Sarah Johnson',
  username: 'sarahcooks',
  avatarUrl: '',
  location: 'San Francisco, CA',
  joinedAt: '2022-03-01T00:00:00Z',
  bio: 'Home chef passionate about Mediterranean cuisine and healthy cooking. Always experimenting with new flavors!',
  stats: {
    recipes: 24,
    followers: 1248,
    following: 89,
    likes: 3942
  },
  badges: [
    { id: 'master', label: 'Master Chef', color: 'gold' },
    { id: 'creator', label: 'Recipe Creator', color: 'blue' },
    { id: 'hero', label: 'Community Hero', color: 'purple' }
  ]
};

const AdvancedProfilePage: React.FC = () => {
  const user = mockUser;

  return (
    <div className={styles.wrapper}>
      <ProfileCard user={user} />
      <ProfileTabs />
      <FavoritesSection />
    </div>
  );
};

export default AdvancedProfilePage;


