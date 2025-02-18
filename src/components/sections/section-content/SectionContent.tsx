import CardRecipe from '../../card-recipe/CardRecipe';
import styles from './SectionContent.module.scss';

function SectionContent() {
    return (
        <>
            <section className={styles.content}>
                <div className={styles.content__inner}>
                    <h2 className={styles.content__title}>Наши рекомендации</h2>
                    <div className={styles.content__content}>
                        <CardRecipe />
                        <CardRecipe />
                        <CardRecipe />
                        <CardRecipe />
                        <CardRecipe />
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

export default SectionContent;