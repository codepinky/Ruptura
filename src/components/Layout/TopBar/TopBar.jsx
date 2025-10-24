import React from 'react';
import { Menu, Search, X } from 'lucide-react';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import { useSearch } from '../../../context/SearchContext';
import './TopBar.css';

const TopBar = ({ onMenuClick }) => {
  const { searchQuery, setSearchQuery, isSearchOpen, openSearch, closeSearch, clearSearch } = useSearch();

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchFocus = () => {
    openSearch();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeSearch();
    }
  };

  return (
    <header className="navbar">
      {/* Seção do Menu */}
      <div className="navbar-section navbar-menu">
        <button className="navbar-menu-btn" onClick={onMenuClick} aria-label="Abrir menu">
          <Menu size={20} />
        </button>
      </div>

      {/* Seção de Pesquisa */}
      <div className="navbar-section navbar-search">
        <div className={`navbar-search-container ${isSearchOpen ? 'focused' : ''}`}>
          <Search size={18} className="navbar-search-icon" />
          <input
            type="text"
            placeholder="Pesquisar transações, categorias, metas..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={handleSearchFocus}
            onKeyDown={handleKeyDown}
            className="navbar-search-input"
          />
          {searchQuery && (
            <button className="navbar-search-clear" onClick={clearSearch} aria-label="Limpar pesquisa">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Seção de Ações */}
      <div className="navbar-section navbar-actions">
        <ThemeToggle />
      </div>
    </header>
  );
};

export default TopBar;