import SectionContent from "../../components/sections/section-content/SectionContent";
import SectionExtendCategory from "../../components/sections/section-extend-category/SectionExtendCategory";
import SectionPopulary from "../../components/sections/section-populary/SectionPopulary";
import SectionTop from "../../components/sections/section-top/SectionTop";

import styles from './MainPage.module.scss';

function MainPage() {
    return (
        <>  
        <div className={styles.mainPage_container}>
        <SectionTop />
            <SectionPopulary />
            <SectionExtendCategory />
            <SectionContent />
        </div>
            
        </>
    );
}

export default MainPage;