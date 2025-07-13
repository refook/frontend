
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Layout from './components/Layout/Layout';
import { HomePage, RecipesPage, CreateRecipePage, RecipeDetailPage, FridgePage } from './pages';
import EditRecipePage from './pages/EditRecipePage';
import { DevTools } from './components/DevTools';

// Pages (пока заглушки, создадим позже)
const DiscoverPage = () => <div className="container"><h1>Discover</h1></div>;
const LoginPage = () => <div className="container"><h1>Вход</h1></div>;
const RegisterPage = () => <div className="container"><h1>Регистрация</h1></div>;

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/recipes" element={<RecipesPage />} />
            <Route path="/recipe/:id" element={<RecipeDetailPage />} />
            <Route path="/recipe/:id/edit" element={<EditRecipePage />} />
            <Route path="/fridge" element={<FridgePage />} />
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/create-recipe" element={<CreateRecipePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </Layout>
        <DevTools />
      </Router>
    </Provider>
  );
}

export default App;
