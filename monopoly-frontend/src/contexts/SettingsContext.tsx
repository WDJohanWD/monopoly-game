import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import i18n from '../i18n/config';

type Language = 'es' | 'en';
type Theme = 'light' | 'dark';

interface SettingsContextType {
  language: Language;
  theme: Theme;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: Theme) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const STORAGE_KEY_LANGUAGE = 'monopoly-language';
const STORAGE_KEY_THEME = 'monopoly-theme';

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LANGUAGE);
    return (saved === 'es' || saved === 'en') ? saved : 'es';
  });

  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_THEME);
    const initialTheme = (saved === 'light' || saved === 'dark') ? saved : 'light';
    // Apply theme immediately on initialization
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return initialTheme;
  });

  // Initialize language on mount
  useEffect(() => {
    i18n.changeLanguage(language);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LANGUAGE, language);
    i18n.changeLanguage(language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_THEME, theme);
    // Apply theme to document root
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <SettingsContext.Provider value={{ language, theme, setLanguage, setTheme }}>
      {children}
    </SettingsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
