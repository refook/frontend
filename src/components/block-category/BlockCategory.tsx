import styles from './BlockCategory.module.scss';




function BlockCategory() {
    return (
        <>

                <div className={styles.category}>
                    <div className={styles.category__title}>Закуски</div>
                    <img src="./circle_category.svg" className={styles.category__img}></img>
                </div>


        </>
    );
}

export default BlockCategory;