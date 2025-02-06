import styles from './Header.module.scss';

function Header() {
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
                    <button className={styles.btn_header}>
                        <div className={styles.btn_header_img1}></div>
                        <div className={styles.btn_header_img2}></div>
                    </button>
                </div>
            </header>
        </>
    );
}

export default Header;