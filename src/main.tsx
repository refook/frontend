import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.scss'

// import CardRecipe from './components/card-recipe/CardRecipe.tsx'
import Header from './components/header/Header.tsx'
import IntroPage from './pages/intro/IntroPage.tsx'

import MainPage from './pages/main/MainPage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>

    <Header />
    <div className="container">
      <IntroPage />
      <MainPage />
    </div>



  </StrictMode>,
)
