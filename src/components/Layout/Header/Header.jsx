import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <h1 className="logo">RupturaProject</h1>
        <nav className="nav">
          <a href="#home" className="nav-link">Início</a>
          <a href="#about" className="nav-link">Sobre</a>
          <a href="#contact" className="nav-link">Contato</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
