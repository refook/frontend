import React from 'react';
import { Link } from 'react-router-dom';
import { KeycloakContext } from '../providers/KeycloakProvider.tsx';
import styles from './HomePage.module.css';

// Новый экспрессивный лендинг (Material 3 inspired, использует токены из styles/)
const HomePage: React.FC = () => {
  const ctx = React.useContext(KeycloakContext);
  if (!ctx) throw new Error('KeycloakContext must be used within a KeycloakProvider');
  const { authenticated, login, logout, register } = ctx;

  const FeatureIcon = ({ path, color }: { path: string; color: string }) => (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true" style={{ color }}>
      <path d={path} fill="currentColor" />
    </svg>
  );

  const features = [
    {
      title: 'Умный Discover',
      description: 'Swipe-лента подсказывает рецепты по вашим продуктам и предпочтениям',
      iconPath: 'M12 2a10 10 0 1010 10A10.011 10.011 0 0012 2zm1 14H7l6-8h6z',
      color: '#2563eb'
    },
    {
      title: 'Холодильник',
      description: 'Учёт продуктов, сроки годности, предупреждения и списки покупок',
      iconPath: 'M7 2h10a2 2 0 012 2v16a2 2 0 01-2 2H7a2 2 0 01-2-2V4a2 2 0 012-2zm0 6h10M9 6v4',
      color: '#10b981'
    },
    {
      title: 'Рецепты',
      description: 'Большая база с пошаговыми фото, макросами и подбором по ингредиентам',
      iconPath: 'M4 6h16v2H4zm2 4h12v8H6z',
      color: '#f59e0b'
    },
    {
      title: 'Создание',
      description: 'Конструктор рецептов с загрузкой фото и публикацией',
      iconPath: 'M12 2v8l6 3-6 3v8l10-6V8z',
      color: '#ef4444'
    }
  ];

  return (
    <div className={styles.page}>
      <div className={`container ${styles.container}`}>
        {/* HERO */}
        <section className={styles.hero}>
          <div className={styles.heroGrid}>
            <div>
              <h1 className={styles.heroTitle}>Refook — ваш кулинарный помощник</h1>
              <p className={styles.heroSubtitle}>
                Планируйте, готовьте и вдохновляйтесь: рецепты, холодильник и Discover — в одном месте.
              </p>
              <div className={styles.heroButtons}>
                <Link to="/discover" className="ui-btn ui-btn--primary">Открыть Discover</Link>
                <Link to="/fridge" className="ui-btn">Перейти в Холодильник</Link>
              </div>
            </div>
            {/* Иллюстрация-«волна» */}
            <div aria-hidden className={styles.waveWrap}>
              <svg viewBox="0 0 400 220" width="100%" height="100%">
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.55"/>
                    <stop offset="50%" stopColor="#34d399" stopOpacity="0.55"/>
                    <stop offset="100%" stopColor="#f472b6" stopOpacity="0.55"/>
                  </linearGradient>
                </defs>
                <path d="M0,120 C80,40 160,200 240,120 C300,70 360,110 400,90 L400,220 L0,220 Z" fill="url(#g1)">
                  <animate attributeName="d" dur="6s" repeatCount="indefinite"
                    values="M0,120 C80,40 160,200 240,120 C300,70 360,110 400,90 L400,220 L0,220 Z;
                            M0,110 C80,60 160,140 240,130 C300,90 360,130 400,100 L400,220 L0,220 Z;
                            M0,120 C80,40 160,200 240,120 C300,70 360,110 400,90 L400,220 L0,220 Z"/>
                </path>
              </svg>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className={styles.features}>
          <h2 className={styles.sectionTitle}>Главные фишки</h2>
          <div className={styles.featuresGrid}>
            {features.map((f) => (
              <div key={f.title} className={styles.featureCard}>
                <div className={styles.featureHeader}>
                  <div className={styles.featureIconChip}>
                    <FeatureIcon path={f.iconPath} color={f.color} />
                  </div>
                  <div className={styles.featureTitle}>{f.title}</div>
                </div>
                <div className={styles.featureDesc}>{f.description}</div>
              </div>
            ))}
          </div>
        </section>

        {/* INTERACTIVE: Быстрый подбор идеи ужина */}
        <section className={styles.interact}>
          <div className={styles.interactHead}>
            <h2 className={styles.sectionTitle}>Подберите идею ужина</h2>
            <p className={styles.interactHint}>Выберите пару условий — мы подскажем, что приготовить</p>
          </div>
          <InteractiveSuggest />
        </section>

        {/* CTA */}
        <section className={styles.cta}>
          <div className={styles.ctaCard}>
            <h3 className={styles.ctaTitle}>Готовы попробовать?</h3>
            <p className={styles.ctaDesc}>Соберите первую корзину продуктов и получите персональные рекомендации рецептов.</p>
            <div className={styles.ctaButtons}>
              <Link to="/fridge" className="ui-btn ui-btn--primary">Открыть Холодильник</Link>
              <Link to="/recipes" className="ui-btn">Каталог рецептов</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;

// ---------------------- Вспомогательные интерактивные элементы ----------------------

const TAGS = [
  { id: 'quick', label: '≤ 20 минут' },
  { id: 'vegan', label: 'Веган' },
  { id: 'lowcarb', label: 'Низкоуглеводно' },
  { id: 'chicken', label: 'Курица' },
  { id: 'pasta', label: 'Паста' },
  { id: 'salad', label: 'Салат' }
];

const MOCK_RECIPES = [
  { id: 'r1', title: 'Салат с нутом и авокадо', tags: ['vegan', 'salad', 'quick'], kkal: 410 },
  { id: 'r2', title: 'Паста с курицей и песто', tags: ['pasta', 'chicken'], kkal: 620 },
  { id: 'r3', title: 'Курица с овощами из духовки', tags: ['chicken', 'lowcarb'], kkal: 520 },
  { id: 'r4', title: 'Тёплый салат с киноа', tags: ['vegan', 'salad'], kkal: 450 },
  { id: 'r5', title: 'Паста а-ля примавера', tags: ['pasta', 'quick'], kkal: 560 }
];

const InteractiveSuggest: React.FC = () => {
  const [selected, setSelected] = React.useState<string[]>(['quick']);
  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const candidates = React.useMemo(() => {
    if (selected.length === 0) return MOCK_RECIPES;
    return MOCK_RECIPES.filter((r) => selected.every((t) => r.tags.includes(t)) || selected.some((t) => r.tags.includes(t)));
  }, [selected]);

  const [index, setIndex] = React.useState(0);
  React.useEffect(() => { setIndex(0); }, [selected]);

  const next = () => setIndex((i) => (i + 1) % Math.max(1, candidates.length));

  const active = candidates[index] || MOCK_RECIPES[0];

  return (
    <div className={styles.interactGrid}>
      <div className={styles.chips}>
        {TAGS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`${styles.chip} ${selected.includes(t.id) ? styles.chipActive : ''}`}
            onClick={() => toggle(t.id)}
            aria-pressed={selected.includes(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className={styles.previewCard}>
        <div className={styles.previewHeader}>
          <div className={styles.previewIcon}>🍽️</div>
          <div className={styles.previewText}>
            <div className={styles.previewTitle}>{active.title}</div>
            <div className={styles.previewMeta}>{active.kkal} ккал • {active.tags.join(' / ')}</div>
          </div>
        </div>
        <div className={styles.previewActions}>
          <Link to={`/recipes`} className="ui-btn ui-btn--primary">Открыть рецепты</Link>
          <button className="ui-btn" onClick={next} aria-label="Показать другую идею">Другой вариант</button>
        </div>
      </div>
    </div>
  );
};