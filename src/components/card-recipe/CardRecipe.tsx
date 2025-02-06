
import { useState } from 'react';
import styles from './CardRecipe.module.scss';

function CardRecipe() {

    const [isExpanded, setIsExpanded] = useState(false);

    const handleClick = () => {
        setIsExpanded((prev) => !prev);
    };

    return (
        <>
            <div className={styles.card_recipe}>
                <div className={styles.card_recipe__timecook}>45 мин</div>
                <div className={styles.card_recipe__info} style={{
                    top: isExpanded ? '100px' : '245px',
                    transition: 'top 0.3s ease'
                }} onClick={handleClick}>

                    <div className={styles.card_recipe__rating}>
                        <div className={styles.card_recipe__rating_text}>4,78</div>
                    </div>
                    <div className={styles.card_recipe__author}></div>
                    <div className={styles.card_recipe__container_info}>
                        <div className={styles.card_recipe__name} style={{
                            WebkitLineClamp: isExpanded ? 3 : 2,
                            height: isExpanded ? '70px' : '40px',
                        }}>
                            <h4 className={styles.testTxt}>Люля из человечины в пикантном соусе тартаррр пырпыр</h4>
                        </div>
                        <div className={styles.card_recipe__extend_info} style={{
                                opacity: isExpanded ? '1' : '0',
                                transition: 'opacity .5s ease'
                            }}>
                            <div className={styles.card_recipe__temp}></div>
                            <div className={styles.card_recipe__info_extend} style={{
                                opacity: isExpanded ? '1' : '0',
                                transition: 'opacity .5s ease'
                            }}>
                                Lorem ipsum dolor sit amet consectetur adtatem rita voluam voluptatem quaerat, atque sunt esse omnis sint.
                            </div>
                        </div>



                    </div>


                </div>
                <div className={styles.card_recipe__hashtags}>
                    <button className={styles.card_recipe__podborka}>Весенняя подборка</button>
                    <button className={styles.card_recipe__podborka2}>- 14</button>
                </div>
                <img className={styles.card_recipe__img} src="/card-img_1.png" />
            </div>
        </>
    );
}

export default CardRecipe;


