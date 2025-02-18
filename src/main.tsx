import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.scss'

// import CardRecipe from './components/card-recipe/CardRecipe.tsx'
import Header from './components/header/Header.tsx'
import IntroPage from './pages/intro/IntroPage.tsx'
import NavInfoBtn from './components/nav-info-btn/NavInfoBtn.tsx'
import SectionTop from './components/sections/section-top/SectionTop.tsx'
import SectionExtendCategory from './components/sections/section-extend-category/SectionExtendCategory.tsx'
import SectionPopulary from './components/sections/section-populary/SectionPopulary.tsx'
import SectionContent from './components/sections/section-content/SectionContent.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>

    <Header />
    <div className="container">

      {/* <IntroPage /> */}
      {/* <NavInfoBtn/> */}
      <SectionTop/>
      <SectionPopulary />
      <SectionExtendCategory/>
      <SectionContent />
    </div>



  </StrictMode>,
)
