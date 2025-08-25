import React from 'react';
import styles from './RecipeTags.module.css';

interface RecipeTagsProps {
  tags: string[];
  title?: string;
}

export const RecipeTags: React.FC<RecipeTagsProps> = ({ tags, title = 'Теги' }) => {
  const hasTags = Array.isArray(tags) && tags.length > 0;

  return (
    <div className={styles.section}>
      <h3 className={styles.title}>{title}</h3>
      {hasTags ? (
        <div className={styles.container}>
          {tags.map((tag, index) => (
            <span key={`${tag}-${index}`} className={styles.chip}>
              {tag}
            </span>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>Теги отсутствуют</div>
      )}
    </div>
  );
};

export default RecipeTags;


