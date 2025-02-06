import styles from './CardItem.module.scss';

function CardItem() {
    return (<div className={styles.card_item}>
        <button className={styles['card_item__btn--close']}>Х</button>
        <div className={styles.card_item__img}></div>
        <div className={styles.card_item__info}>
            <div className={styles.card_item__title}>Курочка</div>
        </div>
    </div>);
}

export default CardItem;