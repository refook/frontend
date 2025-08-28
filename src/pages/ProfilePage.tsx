import React, { useContext, useEffect, useMemo, useState } from 'react';
import styles from './ProfilePage.module.css';
import ImageUpload from '../components/ImageUpload/ImageUpload';
import { KeycloakContext } from '../providers/KeycloakProvider';
import { useNotification } from '../hooks/useNotification';
import Notification from '../components/Notification/Notification';

/**
 * Тип локального драфта профиля, который редактируется на странице.
 * Значения сохраняются в localStorage как заглушка вместо API.
 *
 * @property name Имя пользователя
 * @property email Email пользователя
 * @property bio Короткое описание «О себе»
 * @property location Город/страна
 * @property website Ссылка на сайт/соцсеть
 * @property language Язык интерфейса (ru | en)
 * @property notifications Настройки уведомлений (email/push)
 * @property avatarUrl Необязательный URL превью аватара (blob URL)
 */
type ProfileDraft = {
  name: string;
  email: string;
  bio: string;
  location: string;
  website: string;
  language: 'ru' | 'en';
  notifications: { email: boolean; push: boolean };
  avatarUrl?: string; // preview url
};

const STORAGE_KEY = 'refook_user_profile_draft';

/**
 * Страница ProfilePage — редактирование профиля пользователя.
 * Реализована как заглушка без бэкенда: состояние хранится и восстанавливается из localStorage.
 * Поддерживает загрузку аватара (через ImageUpload), основные поля и пользовательские настройки.
 * Показ уведомлений осуществляется через хук useNotification.
 */
const ProfilePage: React.FC = () => {
  const context = useContext(KeycloakContext);
  const { notification, showSuccess, showError, hideNotification } = useNotification();

  const initial: ProfileDraft = useMemo(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved) as ProfileDraft;
      } catch {}
    }
    return {
      name: context?.user?.name || '',
      email: context?.user?.email || '',
      bio: '',
      location: '',
      website: '',
      language: 'ru',
      notifications: { email: true, push: false },
      avatarUrl: context?.user?.photoUrl || undefined,
    };
  }, [context?.user]);

  const [draft, setDraft] = useState<ProfileDraft>(initial);
  const [avatarFile, setAvatarFile] = useState<File | undefined>(undefined);

  useEffect(() => {
    // autosave
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft]);

  const handleChange = (field: keyof ProfileDraft, value: any) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleNotifChange = (key: 'email' | 'push', value: boolean) => {
    setDraft((prev) => ({ ...prev, notifications: { ...prev.notifications, [key]: value } }));
  };

  const handleAvatarChange = (file: File | undefined) => {
    setAvatarFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      handleChange('avatarUrl', url);
    } else {
      handleChange('avatarUrl', undefined);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Заглушка сохранения
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      showSuccess('Профиль сохранён', 'Изменения успешно сохранены');
    } catch (err) {
      showError('Ошибка', 'Не удалось сохранить профиль');
    }
  };

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>Профиль</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>Фото профиля</h2>
          <ImageUpload image={draft.avatarUrl} onImageChange={handleAvatarChange} />
        </section>

        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>Основная информация</h2>
          <div className={styles.grid2}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="name">Имя</label>
              <input
                id="name"
                className="ui-input"
                value={draft.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Ваше имя"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">Email</label>
              <input
                id="email"
                className="ui-input"
                value={draft.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="you@example.com"
                type="email"
              />
            </div>
            <div className={styles.fieldFull}>
              <label className={styles.label} htmlFor="bio">О себе</label>
              <textarea
                id="bio"
                className={styles.textarea}
                value={draft.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Коротко о себе"
                rows={4}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="location">Местоположение</label>
              <input
                id="location"
                className="ui-input"
                value={draft.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="Город, страна"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="website">Сайт</label>
              <input
                id="website"
                className="ui-input"
                value={draft.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://"
                type="url"
              />
            </div>
          </div>
        </section>

        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>Настройки</h2>
          <div className={styles.grid2}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="language">Язык</label>
              <select
                id="language"
                className={styles.select}
                value={draft.language}
                onChange={(e) => handleChange('language', e.target.value as 'ru' | 'en')}
              >
                <option value="ru">Русский</option>
                <option value="en">English</option>
              </select>
            </div>
            <div className={styles.field}>
              <span className={styles.label}>Уведомления</span>
              <div className={styles.switchRow}>
                <label className={styles.switchLabel}>
                  <input
                    type="checkbox"
                    checked={draft.notifications.email}
                    onChange={(e) => handleNotifChange('email', e.target.checked)}
                  />
                  Email-уведомления
                </label>
                <label className={styles.switchLabel}>
                  <input
                    type="checkbox"
                    checked={draft.notifications.push}
                    onChange={(e) => handleNotifChange('push', e.target.checked)}
                  />
                  Push-уведомления
                </label>
              </div>
            </div>
          </div>
        </section>

        <div className={styles.actions}>
          <button type="submit" className="ui-btn ui-btn--primary">Сохранить изменения</button>
          <button
            type="button"
            className="ui-btn ui-btn--ghost"
            onClick={() => setDraft(initial)}
          >
            Сбросить
          </button>
        </div>
      </form>

      {notification.show && (
        <div className={styles.notificationWrap}>
          <Notification
            type={notification.type}
            title={notification.title}
            message={notification.message}
            onClose={hideNotification}
            show={notification.show}
          />
        </div>
      )}
    </div>
  );
};

export default ProfilePage;


