import { useEffect } from 'react';

export function useInitializeTheme() {
  useEffect(() => {
    const saved = (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
  }, []);
}


