import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './EditRecipePage.module.css';

const EditRecipePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div className={styles.editRecipePage}>
      <div className={styles.header}>
        <button 
          onClick={() => navigate(-1)}
          className={styles.backButton}
        >
          ← Назад
        </button>
        <h1>Редактировать рецепт</h1>
      </div>

      <div className={styles.notice}>
        <div className={styles.noticeIcon}>🚧</div>
        <div className={styles.noticeContent}>
          <h2>Функция в разработке</h2>
          <p>Редактирование рецептов временно недоступно, так как API еще не поддерживает эту функцию.</p>
          <p>Мы работаем над добавлением этой возможности в ближайшее время.</p>
          
          <div className={styles.actions}>
            <button 
              onClick={() => navigate('/recipes')}
              className={styles.recipesButton}
            >
              Посмотреть все рецепты
            </button>
            <button 
              onClick={() => navigate('/recipes/create')}
              className={styles.createButton}
            >
              Создать новый рецепт
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditRecipePage; 