import React, { createContext, useContext, useState, useEffect } from 'react';

// Contexto do tema
const ThemeContext = createContext();

// Provider do tema
export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState(() => {
    // Verificar se há preferência salva no localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    // Verificar preferência do sistema
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Aplicar tema ao documento
  useEffect(() => {
    const root = document.documentElement;
    
    // Remover todas as classes de tema
    root.classList.remove('light', 'dark');
    
    // Adicionar a classe do tema atual
    root.classList.add(currentTheme);
    
    // Salvar preferência no localStorage
    localStorage.setItem('theme', currentTheme);
  }, [currentTheme]);

  // Escutar mudanças na preferência do sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      // Só atualizar se não houver preferência salva
      if (!localStorage.getItem('theme')) {
        setCurrentTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    const themes = ['light', 'dark'];
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setCurrentTheme(themes[nextIndex]);
  };

  const setTheme = (theme) => {
    setCurrentTheme(theme);
  };

  const value = {
    currentTheme,
    isDarkMode: currentTheme === 'dark',
    toggleTheme,
    setTheme,
    theme: currentTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook personalizado
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
}
