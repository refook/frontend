import { useCallback } from 'react';

/**
 * Хук для копирования текста в буфер обмена
 * @returns Функция для копирования текста в буфер обмена
 */
export function useCopyToClipboard() {
  return useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      console.error('Не удалось скопировать текст в буфер обмена');
    }
  }, []);
}

