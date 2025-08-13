import {Routes, Route} from 'react-router-dom';


import Layout from './components/Layout/Layout';
<<<<<<< HEAD
import {HomePage, RecipesPage, CreateRecipePage, RecipeDetailPage, FridgePage, ProfilePage, FavoritesPage} from './pages';
=======
import {HomePage, RecipesPage, CreateRecipePage, RecipeDetailPage, FridgePage, ProfilePage} from './pages';
>>>>>>> 1655af2 (feat(profile): страница профиля без API (редактирование имени, аватара и настроек))
import EditRecipePage from './pages/EditRecipePage';
import DiscoverPage from './pages/DiscoverPage';
import {DevTools} from './components/DevTools';
import { useInitializeTheme } from './hooks/useInitializeTheme';

function App() {
    useInitializeTheme();
    return (
        <>
            <Layout>
                <Routes>
                    <Route path="/" element={<HomePage/>}/>
                    <Route path="/recipes" element={<RecipesPage/>}/>
                    <Route path="/recipe/:id" element={<RecipeDetailPage/>}/>
                    <Route path="/recipe/:id/edit" element={<EditRecipePage/>}/>
                    <Route path="/fridge" element={<FridgePage/>}/>
                    <Route path="/discover" element={<DiscoverPage/>}/>
                    <Route path="/create-recipe" element={<CreateRecipePage/>}/>
                    <Route path="/profile" element={<ProfilePage/>}/>
<<<<<<< HEAD
                    <Route path="/favorites" element={<FavoritesPage/>}/>
=======
>>>>>>> 1655af2 (feat(profile): страница профиля без API (редактирование имени, аватара и настроек))
                </Routes>
            </Layout>
            <DevTools/>
        </>
    );
}

export default App;
