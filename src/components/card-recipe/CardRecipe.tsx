
import { useEffect, useRef, useState } from 'react';
import styles from './CardRecipe.module.scss';

function CardRecipe() {

    const [isExpanded, setIsExpanded] = useState(false);
    const [topPosition, setTopPosition] = useState(245);
    const [style, setStyle] = useState({});
    const cardRef = useRef(null);
    const isDragging = useRef(false);
    const startY = useRef(0);
    const startTop = useRef(0);
    const wasDragged = useRef(false);

    useEffect(() => {
        setStyle({
            top: `${topPosition}px`,
            transition: isDragging.current ? 'none' : 'top 0.3s ease',
            cursor: isExpanded ? 'grab' : 'pointer',
        });
    }, [topPosition, isDragging.current, isExpanded]);

    const handleClick = () => {
        if (wasDragged.current) {
            wasDragged.current = false;
            return;
        }
        setIsExpanded((prev) => !prev);
        if (!isExpanded) {
            setTopPosition(100); // Открытие карточки
        } else {
            setTopPosition(245); // Закрытие карточки
        }
        //setTopPosition((prev) => (prev === 245 ? 30 : 245));
    };

    const handleMouseDown = (e: { clientY: number; }) => {
        if (!isExpanded) return;
        isDragging.current = true;
        startY.current = e.clientY;
        startTop.current = topPosition;
        wasDragged.current = false;
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e: { clientY: number; }) => {
        if (!isDragging.current) return;
        let newTop = startTop.current + (e.clientY - startY.current);
        newTop = Math.max(30, Math.min(245, newTop)); // Ограничение значений
        setTopPosition(newTop);
        wasDragged.current = true;
        
    };

    const handleMouseUp = () => {
        isDragging.current = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    return (
        <>
            <div className={styles.card_recipe}>
                <div className={styles.card_recipe__timecook}>45 мин</div>
                <div className={styles.card_recipe__info} ref={cardRef} 
                    style={style}
                    onClick={handleClick}
                    onMouseDown={handleMouseDown}
                >

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
                            transition: 'opacity .5s ease',
                            maxHeight: `${220 - topPosition}px`,
                            overflowY: 'scroll'
                        }}>
                            <div className={styles.card_recipe__temp}></div>
                            <div className={styles.card_recipe__info_extend} style={{
                                opacity: isExpanded ? '1' : '0',
                                transition: 'opacity .5s ease'
                            }}>
                                Lorem ipsum sit amet rita voluam sit amet rita voluam sit amet rita voluam sit amet rita voluam  dolor sit amet rita voluam rita sit amet rita voluam voluam rita voluam rita voluam rita voluam rita voluam rita voluam rita voluam rita voluam rita voluam rita voluam consectetur adtatem rita voluam voluptatem quaerat, atque sunt esse omnis sint.
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


