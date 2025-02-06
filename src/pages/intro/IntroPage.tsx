import CardItem from "../../components/card-item/CardItem"
import CardRecipe from "../../components/card-recipe/CardRecipe";
import styles from './IntroPage.module.scss';


function IntroPage() {
    return (
        <>
            <section className={styles.intro_top}>
                <div className={styles.intro_top__inner}>
                    <div className={styles.intro_top__titles}>
                        <h1 className={styles.intro_top__title}>Готовим вместе <br></br>с вами</h1>
                        <span className={styles.intro_top__subtitle}>
                            <span>Находим</span> рецепты по вашим предпочтениям, интерактивно <span>готовим</span>
                            в нашем тренажере
                            <br></br>и <span>делимся</span> эмоциями
                            <br></br>во время готовки!</span>
                        <div className={styles.intro_top__btns}>
                            <button className={styles.intro_top__btn1}>ГОТОВЯТ СЕЙЧАС</button>
                            <button className={styles.intro_top__btn2}>МАРАФОН</button>
                        </div>

                    </div>
                    <div className={styles.intro_top__cards}>
                        <div className={styles.intro_top__card1}>
                            <CardRecipe />
                        </div>
                        <div className={styles.intro_top__card2}>
                            <CardRecipe />
                        </div>
                        <div className={styles.intro_top__card2}>
                            <CardRecipe />
                        </div>
                        <div className={styles.intro_top__stars}></div>
                    </div>
                </div>
            </section>

            <section className={styles.intro_section1}>
                <div className={[styles['container'], styles['intro_section1__inner']].join()}>
                    <div className={styles.intro_section1__titles}>
                        <div className={styles.intro_section1__title}><span>Проверьте</span> что уже <br /> можете приготовить</div>
                        <div className={styles.intro_section1__arrow}></div>
                    </div>
                    <div className={styles.intro_section1__cards}>
                        <CardItem />
                        <CardItem />
                        <CardItem />
                        <div className={styles.intro_card__content}>
                            <div className={styles['intro_card__item--add']}>
                                <div className={styles.intro_card__txt}><span>+</span><br /> ADD</div>
                            </div>
                            <div className={styles['intro_card__item--add_2']}>
                                <div className={styles.intro_card__txt}><span>+</span><br /> ADD</div>
                            </div>
                            <div className={styles['intro_card__item--add_3']}>
                                <div className={styles.intro_card__txt}><span>+</span><br /> ADD</div>
                            </div>

                        </div>
                        <div className={styles.intro_section1__btn}></div>
                    </div>
                </div>
            </section>

        </>
    );
}

export default IntroPage;