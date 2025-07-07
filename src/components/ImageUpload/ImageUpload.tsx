import React, { useRef, useState } from 'react';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import styles from './ImageUpload.module.css';

interface ImageUploadProps {
  image?: File;
  onImageChange: (image: File | undefined) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ image, onImageChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(
    image ? URL.createObjectURL(image) : undefined
  );

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      // Создаем превью
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      onImageChange(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleRemoveImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(undefined);
    onImageChange(undefined);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={styles.imageUpload}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className={styles.hiddenInput}
      />
      
      {preview ? (
        <div className={styles.previewContainer}>
          <img 
            src={preview} 
            alt="Preview" 
            className={styles.previewImage}
          />
          <div className={styles.overlay}>
            <button
              type="button"
              onClick={handleRemoveImage}
              className={styles.removeButton}
              title="Удалить изображение"
            >
              <XMarkIcon className={styles.removeIcon} />
            </button>
            <button
              type="button"
              onClick={handleClick}
              className={styles.changeButton}
              title="Изменить изображение"
            >
              <PhotoIcon className={styles.changeIcon} />
              Изменить
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`${styles.uploadArea} ${dragOver ? styles.dragOver : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          <PhotoIcon className={styles.uploadIcon} />
          <h3 className={styles.uploadTitle}>Добавить фотографию</h3>
          <p className={styles.uploadText}>
            Перетащите изображение сюда или нажмите для выбора
          </p>
          <p className={styles.uploadHint}>
            PNG, JPG, GIF до 10MB
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload; 