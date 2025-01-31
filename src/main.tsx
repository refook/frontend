import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import CardRecipe from './components/card-recipe/CardRecipe.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CardRecipe />
  </StrictMode>,
)
