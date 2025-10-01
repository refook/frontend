import React, {useContext} from 'react';
import {useSearchParams} from 'react-router-dom';
import styles from './AdvancedProfilePage.module.css';
import ProfileCard, {type AdvancedProfileUser} from './components/ProfileCard';
import Tabs, {type TabId} from '../../components/Tabs/Tabs';
import SectionHeader from './components/SectionHeader';
import {
    HeartIcon,
    ClockIcon,
    UserGroupIcon,
    BookOpenIcon,
    ChatBubbleLeftRightIcon,
    StarIcon
} from '@heroicons/react/24/outline';
import FavoritesSection from './sections/Favorites/FavoritesSection';
import HistorySection from './sections/History/HistorySection';
import FollowingSection from './sections/Following/FollowingSection';
import RecipesSection from './sections/Recipes/RecipesSection';
import CommentsSection from './sections/Comments/CommentsSection';
import ActivitySection from './sections/Activity/ActivitySection';
import CreateRecipePage from '../CreateRecipePage';
import {KeycloakContext} from "../../providers/KeycloakProvider.tsx";

/**
 * Демонстрационные данные пользователя для «Advanced Profile».
 * Соответствуют типу `AdvancedProfileUser`.
 *
 * Структура `AdvancedProfileUser`:
 * @property {string} name Отображаемое имя пользователя
 * @property {string} username Никнейм без символа `@`
 * @property {string} [avatarUrl] URL аватарки (опционально)
 * @property {string} [location] Локация пользователя (опционально)
 * @property {string} joinedAt Дата регистрации в ISO 8601
 * @property {string} [bio] Короткое описание/био (опционально)
 * @property {{recipes: number; followers: number; following: number; likes: number}} stats Статистика профиля
 * @property {{id: string; label: string; color: ('gold'|'blue'|'purple')}[]} badges Значки/награды пользователя
 */
const mockUser: AdvancedProfileUser = {
    name: 'Сара Джонсон',
    username: 'sarahcooks',
    avatarUrl: '',
    location: 'Сан-Франциско, США',
    joinedAt: '2022-03-01T00:00:00Z',
    bio: 'Домашний шеф, увлечённая средиземноморской кухней и здоровыми блюдами. Постоянно экспериментирую с новыми вкусами!',
    stats: {
        recipes: 24,
        followers: 1248,
        following: 89,
        likes: 3942
    },
    badges: [
        {id: 'master', label: 'Мастер-шеф', color: 'gold'},
        {id: 'creator', label: 'Создатель рецептов', color: 'blue'},
        {id: 'hero', label: 'Герой сообщества', color: 'purple'}
    ]
};

const profileTabs = [
    {id: 'favorites', label: 'Избранное', Icon: HeartIcon},
    {id: 'history', label: 'История', Icon: ClockIcon},
    {id: 'following', label: 'Подписки', Icon: UserGroupIcon},
    {id: 'recipes', label: 'Рецепты', Icon: BookOpenIcon},
    {id: 'comments', label: 'Комментарии', Icon: ChatBubbleLeftRightIcon},
    {id: 'activity', label: 'Активность', Icon: StarIcon},
];

/**
 * Страница расширенного профиля пользователя.
 * Состоит из карточки профиля, вкладок и контента выбранной вкладки:
 * избранное, история, подписки, мои рецепты, комментарии, активность.
 *
 * @param {{}} props Параметры компонента (входные свойства не требуются)
 * @returns {JSX.Element} Разметка страницы расширенного профиля
 */
const AdvancedProfilePage: React.FC = () => {
    const context = useContext(KeycloakContext);
    if (context == null) {
        throw new Error('KeycloakContext must be used within a KeycloakProvider');
    }
    const {user} = context;
    const profileUser = {
        ...mockUser,
        name: user?.name ?? mockUser.name,
        avatarUrl: user?.photoUrl ?? mockUser.avatarUrl,
        username: user?.username ?? mockUser.username
    } as AdvancedProfileUser;


    const [activeTab, setActiveTab] = React.useState<TabId>('favorites');
    const [searchParams, setSearchParams] = useSearchParams();
    const isCreateMode = searchParams.get('mode') === 'create' && (searchParams.get('tab') === 'recipes' || activeTab === 'recipes');

    React.useEffect(() => {
        const tabParam = searchParams.get('tab');
        const allowed = ['favorites', 'history', 'following', 'recipes', 'comments', 'activity'] as const;
        if (tabParam && (allowed as readonly string[]).includes(tabParam)) {
            setActiveTab(tabParam as TabId);
        }
    }, [searchParams]);

    React.useEffect(() => {
        if (searchParams.get('tab') !== activeTab) {
            const next = new URLSearchParams(searchParams);
            next.set('tab', activeTab);
            setSearchParams(next, {replace: true});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    if (isCreateMode) {
        return (
            <div className={styles.wrapperWide}>
                <div style={{marginBottom: 16}}>
                    <button
                        className="ui-btn ui-btn--ghost"
                        onClick={() => {
                            const next = new URLSearchParams(searchParams);
                            next.delete('mode');
                            next.set('tab', 'recipes');
                            setSearchParams(next, {replace: true});
                        }}
                    >
                        ← Назад к рецептам
                    </button>
                </div>
                <CreateRecipePage fullWidth/>
            </div>
        );
    }

    return (
        <div className={styles.wrapper}>
            <ProfileCard user={profileUser}/>
            <Tabs
                initial={activeTab}
                onChange={setActiveTab}
                tabs={profileTabs}
                ariaLabel="Разделы профиля"
            />
            {activeTab === 'favorites' && <FavoritesSection/>}
            {activeTab === 'history' && <HistorySection/>}
            {activeTab === 'following' && <FollowingSection/>}
            {activeTab === 'recipes' && <RecipesSection/>}
            {activeTab === 'comments' && <CommentsSection/>}
            {activeTab === 'activity' && <ActivitySection/>}
        </div>
    );
};

export default AdvancedProfilePage;


