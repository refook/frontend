import CardRecipe from '../../card-recipe/CardRecipe';
import styles from './SectionPopulary.module.scss';



function SectionPopulary() {
    return (
        <>
            <section className={styles.populary}>
                <div className={styles.populary__inner}>
                    <div className={styles.populary__titles}>
                        <h2 className={styles.populary__title}>Популярное сейчас</h2>
                        <p className={styles.populary__subtitle}>Самые популярные рецепты, которые в настоящее время готовят все желающие</p>
                    </div>
                    <div className={styles.populary__content}>
                        <CardRecipe />
                        <CardRecipe />
                        <CardRecipe />
                        <CardRecipe />
                    </div>
                </div>
            </section>
        </>
    );
}

export default SectionPopulary;