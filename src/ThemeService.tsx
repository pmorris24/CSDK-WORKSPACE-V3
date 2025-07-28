import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    const fetchTheme = async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'theme');
      
      if (error) {
        console.error('Error fetching theme:', error);
      } else if (data && data.length > 0) {
        setThemeState(data[0].value as Theme);
      }
    };

    fetchTheme();
  }, []);

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    document.body.setAttribute('data-theme', newTheme);
    
    const { error } = await supabase
      .from('settings')
      .upsert({ key: 'theme', value: newTheme });

    if (error) {
      console.error('Error saving theme:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    await setTheme(newTheme);
  };

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};