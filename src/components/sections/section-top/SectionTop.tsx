import styles from './SectionTop.module.scss';

function SectionTop() {
    return (
        <>
            <section className={styles.top}>
                <div className={styles.top__inner}>

                    <div className={styles.top__content}>
                        <button className={styles.top__hashtag}>ЕЖЕНЕДЕЛЬНОЕ ВДОХНОВЕНИЕ</button>
                        <p className={styles.top__title}>Хеллоуин во Вкусе: свежие
                            рецепты, которые украсят
                            ваш стол!</p>
                        <button className={styles.top__btn}>СМОТРЕТЬ</button>
                    </div>

                    <div className={styles.top__img_l}></div>

                </div>
            </section>
        </>
    );
}

export default SectionTop;