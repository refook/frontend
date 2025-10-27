import React from 'react';
import { CheckIcon, PencilIcon } from '@heroicons/react/24/outline';
import type { RecipePreviewActionsProps } from '../../RecipePreview.types';
import styles from './PreviewActions.module.css';

const PreviewActions: React.FC<RecipePreviewActionsProps> = ({ onEdit, onSubmit, isSubmitting }) => (
  <div className={styles.actions}>
    <button
      type="button"
      onClick={onEdit}
      className={`${styles.button} ${styles.editButton}`}
      disabled={isSubmitting}
    >
      <PencilIcon className={styles.icon} />
      Продолжить редактирование
    </button>

    <button
      type="button"
      onClick={onSubmit}
      className={`${styles.button} ${styles.submitButton}`}
      disabled={isSubmitting}
    >
      {isSubmitting ? (
        <>
          <span className={styles.spinner} />
          Создаем рецепт...
        </>
      ) : (
        <>
          <CheckIcon className={styles.icon} />
          Создать рецепт
        </>
      )}
    </button>
  </div>
);

export default PreviewActions;
