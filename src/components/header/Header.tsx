import { useRef, useState } from 'react';
import NavInfoBtn from '../nav-info-btn/NavInfoBtn';
import styles from './Header.module.scss';
import { CSSTransition } from 'react-transition-group';
import './fade.css';

function Header() {

    // Состояние для управления видимостью блока
    const [showTest, setShowTest] = useState(false);
    // Реф для хранения идентификатора таймаута
    const hideTimeoutRef = useRef<null | number>(null);
    const nodeRef = useRef(null);

    // Функция для показа блока: отменяем возможный таймаут и показываем блок
    const handleMouseEnter = () => {
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = null;
        }
        setShowTest(true);
    };

    // Функция для скрытия блока с задержкой
    const handleMouseLeave = () => {
        hideTimeoutRef.current = setTimeout(() => {
            setShowTest(false);
        }, 300); // задержка в 300 мс (можно настроить под ваши нужды)
    };

    // Аналогичные обработчики для самого блока "test"
    const handleTestMouseEnter = () => {
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = null;
        }
    };

    const handleTestMouseLeave = () => {
        hideTimeoutRef.current = setTimeout(() => {
            setShowTest(false);
        }, 300);
    };


    return (
        <>
            <header className={styles.header}>
                <div className={styles.header_nav}>
                    <div className={styles.logo_header}></div>
                    <nav>
                        <ul className={styles.nav_list}>
                            <li className={styles.nav_list__item}><a href="./intro.html">О НАС</a></li>
                            <li className={styles.nav_list__item}><a href="./index.html">ГЛАВНАЯ</a></li>
                            <li className={styles.nav_list__item}><a>РЕЦЕПТЫ</a></li>
                            <li className={styles.nav_list__item}><a>КЛАДОВАЯ</a></li>
                            <li className={styles.nav_list__item}><a>БОЛЬШЕ</a></li>
                        </ul>
                    </nav>
                    <button className={styles.btn_header}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        <div className={styles.btn_header_img1}></div>
                        <div className={styles.btn_header_img2}></div>
                        <CSSTransition
                            in={showTest}
                            timeout={300}
                            classNames="fade"
                            unmountOnExit
                            nodeRef={nodeRef}
                        >
                            <div
                                ref={nodeRef}
                                className="test"
                                style={{
                                    position: 'absolute',
                                    left: '-500px',
                                    marginTop: '420px',
                                    width: '600px',
                                    zIndex:999
                                }}
                                onMouseEnter={handleTestMouseEnter}
                                onMouseLeave={handleTestMouseLeave}
                            >
                                <NavInfoBtn />
                            </div>
                        </CSSTransition>


                    </button>
                </div>
            </header>
        </>
    );
}

export default Header;