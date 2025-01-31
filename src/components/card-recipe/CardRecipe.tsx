import styles from './CardRecipe.module.scss';

function CardRecipe() {
    return (
        <>
            <div className={styles.card_recipe}>
                <div className={styles.card_recipe__timecook}>45мин</div>
                <div className={styles.card_recipe__info}>
                    <div className={styles.card_recipe__rating}>
                        <div className={styles.card_recipe__rating_text}>4,78/5</div>
                    </div>
                    <div className={styles.card_recipe__author}></div>
                    <div className={styles.card_recipe__name}>
                        <h4 className={styles.testTxt}>Люля из человечины в пикантном соусе тартаррр пырпыр</h4>
                    </div>
                    <div className={styles.card_recipe__hashtags}>
                        <button className={styles.card_recipe__podborka}>Весенняя подборка</button>
                        <button className={styles.card_recipe__podborka2}>- 14</button>
                    </div>
                </div>

                <img className={styles.card_recipe__img} src="/card-img_1.png"/>
            </div>
        </>
    );
}

export default CardRecipe;