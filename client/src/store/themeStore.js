import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'system', // 'light', 'dark', 'system'
      
      setTheme: (theme) => {
        set({ theme });
        get().applyTheme();
      },
      
      applyTheme: () => {
        const { theme } = get();
        const root = document.documentElement;
        
        if (theme === 'system') {
          const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          if (systemPrefersDark) {
            root.classList.add('dark');
          } else {
            root.classList.remove('dark');
          }
        } else if (theme === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      },
      
      initTheme: () => {
        get().applyTheme();
        
        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', () => {
          if (get().theme === 'system') {
            get().applyTheme();
          }
        });
      },
      
      getCurrentTheme: () => {
        const { theme } = get();
        if (theme === 'system') {
          return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return theme;
      }
    }),
    {
      name: 'theme-storage',
    }
  )
);

export default useThemeStore;
