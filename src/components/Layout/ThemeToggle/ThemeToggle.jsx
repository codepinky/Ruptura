import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { currentTheme, toggleTheme } = useTheme();

  const getThemeIcon = () => {
    switch (currentTheme) {
      case 'light':
        return <Sun size={18} />;
      case 'dark':
        return <Moon size={18} />;
      default:
        return <Sun size={18} />;
    }
  };

  const getThemeLabel = () => {
    switch (currentTheme) {
      case 'light':
        return 'Modo Claro';
      case 'dark':
        return 'Modo Escuro';
      default:
        return 'Modo Claro';
    }
  };

  const getNextThemeLabel = () => {
    const themes = ['light', 'dark'];
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    
    switch (nextTheme) {
      case 'light':
        return 'Alternar para modo claro';
      case 'dark':
        return 'Alternar para modo escuro';
      default:
        return 'Alternar tema';
    }
  };

  return (
    <button 
      className="theme-toggle"
      onClick={toggleTheme}
      title={getNextThemeLabel()}
      aria-label={getNextThemeLabel()}
    >
      <div className={`toggle-icon ${currentTheme}`}>
        {getThemeIcon()}
      </div>
      <span className="toggle-label">
        {getThemeLabel()}
      </span>
    </button>
  );
};

export default ThemeToggle;
