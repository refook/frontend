import {Routes, Route} from 'react-router-dom';


import Layout from './components/Layout/Layout';
import {HomePage, RecipesPage, CreateRecipePage, RecipeDetailPage, FridgePage, ProfilePage, AdvancedProfilePage} from './pages';
import AdminPage from './pages/Admin/AdminPage';
import EditRecipePage from './pages/EditRecipePage';
import DiscoverPage from './pages/DiscoverPage';
import {DevTools} from './components/DevTools';
import { useInitializeTheme } from './hooks/useInitializeTheme';
import CookieConsent from './components/CookieConsent';
import Roadmap from "./pages/Roadmap/Roadmap.tsx";

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
                    {false && <Route path="/favorites" element={<div />}/>}
                    <Route path="/profile/advanced" element={<AdvancedProfilePage/>}/>
                    <Route path="/admin" element={<AdminPage/>}/>
                    <Route path="/roadmap" element={<Roadmap/>}/>
                </Routes>
            </Layout>
            <DevTools/>
            <CookieConsent/>
        </>
    );
}

export default App;
