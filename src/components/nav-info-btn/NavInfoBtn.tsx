import { useEffect, useState } from "react";
import styles from "./NavInfoBtn.module.scss";

function NavInfoBtn() {

    // Храним индекс выбранного пункта (или null, если ничто не выделено).
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const handleMouseEnter = (index: number) => {
        setActiveIndex(index);
    };

    useEffect(() => {
        handleMouseEnter(0);
      }, []);



    return (
        <>
            <div className={styles.container}>
                {/* Левая часть: условно отображаем нужное «изображение» */}
                <div className={styles.leftBlock}>
                    {activeIndex === 0 && (
                        <div className={styles.imageOne}>
                            {/* Тут может быть <img src="..." alt="..." /> или просто фон */}
                        </div>
                    )}
                    {activeIndex === 1 && (
                        <div className={styles.imageTwo}></div>
                    )}
                    {activeIndex === 2 && (
                        <div className={styles.imageThree}></div>
                    )}
                </div>

                {/* Правая часть: три пункта в столбик */}
                <div className={styles.rightBlock}>
                    <div
                        className={styles.menuItem}
                        onMouseEnter={() => handleMouseEnter(0)}
                    >
                        Поэтапное приготовление
                        <div className={styles.subText}>Отдельный таймер на&nbsp;каждый процесс готовки</div>
                    </div>

                  
                    <div
                        className={styles.menuItem}
                        onMouseEnter={() => handleMouseEnter(1)}
                    >
                        Кладовая
                        <div className={styles.subText}>Формируй рецепты на&nbsp;основе продуктов</div>
                    </div>

                    <div
                        className={styles.menuItem}
                        onMouseEnter={() => handleMouseEnter(2)}
                    >
                        Рецепты
                        <div className={styles.subText}>Дохера рецептов от&nbsp;авторов</div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default NavInfoBtn;