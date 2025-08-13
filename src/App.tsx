import {Routes, Route} from 'react-router-dom';


import Layout from './components/Layout/Layout';
import {HomePage, RecipesPage, CreateRecipePage, RecipeDetailPage, FridgePage, ProfilePage, FavoritesPage, AdvancedProfilePage} from './pages';
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
                    <Route path="/favorites" element={<FavoritesPage/>}/>
                    <Route path="/profile/advanced" element={<AdvancedProfilePage/>}/>
                </Routes>
            </Layout>
            <DevTools/>
        </>
    );
}

export default App;
