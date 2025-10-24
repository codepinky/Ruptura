import React, { useState } from 'react';
import { Menu, Bell, Search, User, X } from 'lucide-react';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import './TopBar.css';

const TopBar = ({ onMenuClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
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
        <div className={`navbar-search-container ${isSearchFocused ? 'focused' : ''}`}>
          <Search size={18} className="navbar-search-icon" />
          <input
            type="text"
            placeholder="Pesquisar..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
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
        
        <button className="navbar-action-btn navbar-notifications" aria-label="Notificações">
          <Bell size={18} />
          <span className="navbar-notification-badge">3</span>
        </button>
        
        <button className="navbar-action-btn navbar-user" aria-label="Perfil do usuário">
          <User size={18} />
        </button>
      </div>
    </header>
  );
};

export default TopBar;