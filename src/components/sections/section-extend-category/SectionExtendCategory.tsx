import BlockCategory from '../../block-category/BlockCategory';
import styles from './SectionExtendCategory.module.scss';



function SectionExtendCategory() {
    return (
        <>
            <section className={styles.extend_category}>
                <div className={styles.extend_category__inner}>
                    <h2 className={styles.extend_category__title}>Больше</h2>
                    <div className={styles.extend_category__content}>
                        <BlockCategory />
                        <BlockCategory />
                        <BlockCategory />
                        <BlockCategory />
                        <BlockCategory />

                    </div>
                </div>
            </section>
        </>
    );
}

export default SectionExtendCategory;