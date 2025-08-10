import React, {useContext} from 'react';
import {Link} from 'react-router-dom';
import styles from './HomePage.module.css';
import {KeycloakContext} from "../providers/KeycloakProvider.tsx";

const HomePage: React.FC = () => {

    const context = useContext(KeycloakContext);

    if (context == null) {
        throw new Error('KeycloakContext must be used within a KeycloakProvider');
    }

    const {authenticated, user, logout, register, login} = context;

    return (
        <div className={styles.homePage}>
            <div className="container">
                <section className={styles.hero}>
                    <div className={styles.heroContent}>
                        <h1 className={styles.heroTitle}>
                            Добро пожаловать в <span className={styles.brandName}>Refook</span>
                        </h1>
                        <p className={styles.heroSubtitle}>
                            Откройте для себя новые рецепты, управляйте холодильником и создавайте кулинарные шедевры
                        </p>
                        <div className={styles.heroButtons}>
                            <Link to="/discover" className={styles.primaryButton}>
                                Найти рецепты
                            </Link>
                            <Link to="/create-recipe" className={styles.secondaryButton}>
                                Создать рецепт
                            </Link>
                        </div>
                    </div>
                    <div className={styles.heroImage}>
                        <div className={styles.placeholderImage}>
                            🍳
                        </div>
                    </div>
                </section>

                <section className={styles.features}>
                    <h2 className={styles.sectionTitle}>Возможности приложения</h2>
                    <div className={styles.featureGrid}>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>📖</div>
                            <h3 className={styles.featureTitle}>Рецепты</h3>
                            <p className={styles.featureDescription}>
                                Большая коллекция рецептов с подробными инструкциями и фотографиями
                            </p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>🧊</div>
                            <h3 className={styles.featureTitle}>Холодильник</h3>
                            <p className={styles.featureDescription}>
                                Отслеживайте продукты, сроки годности и планируйте покупки
                            </p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>✨</div>
                            <h3 className={styles.featureTitle}>Discover</h3>
                            <p className={styles.featureDescription}>
                                Swipe-лента для поиска новых рецептов под ваши продукты
                            </p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>👨‍🍳</div>
                            <h3 className={styles.featureTitle}>Создание</h3>
                            <p className={styles.featureDescription}>
                                Создавайте и делитесь своими уникальными рецептами
                            </p>
                        </div>
                    </div>
                </section>

                <section className={styles.cta}>
                    <div className={styles.ctaContent}>
                        <h2 className={styles.ctaTitle}>Начните готовить уже сегодня!</h2>
                        <p className={styles.ctaDescription}>
                            Зарегистрируйтесь и получите доступ ко всем возможностям приложения
                        </p>
                        <div className={styles.ctaButtons}>
                            {authenticated ? <div onClick={logout} className={styles.secondaryButton}>
                                Выйти
                            </div> : <>
                                <div onClick={register} className={styles.primaryButton}>
                                    Зарегистрироваться
                                </div>
                                <div onClick={login} className={styles.secondaryButton}>
                                    Войти
                                </div>
                            </>}

                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default HomePage; 