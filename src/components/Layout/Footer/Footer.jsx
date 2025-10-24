import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <p>&copy; 2024 RupturaProject. Todos os direitos reservados.</p>
        <div className="footer-links">
          <a href="#privacy">Política de Privacidade</a>
          <a href="#terms">Termos de Uso</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
