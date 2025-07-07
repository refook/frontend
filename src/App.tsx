import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Layout from './components/Layout/Layout';

// Pages (пока заглушки, создадим позже)
const HomePage = () => <div className="container"><h1>Главная страница</h1></div>;
const RecipesPage = () => <div className="container"><h1>Все рецепты</h1></div>;
const FridgePage = () => <div className="container"><h1>Холодильник</h1></div>;
const DiscoverPage = () => <div className="container"><h1>Discover</h1></div>;
const CreateRecipePage = () => <div className="container"><h1>Создать рецепт</h1></div>;
const RecipeDetailPage = () => <div className="container"><h1>Детали рецепта</h1></div>;
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
            <Route path="/fridge" element={<FridgePage />} />
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/create-recipe" element={<CreateRecipePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </Layout>
      </Router>
    </Provider>
  );
}

export default App;
