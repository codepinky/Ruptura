import React from 'react';
import { Menu } from 'lucide-react';
import './HelpGuide.css';

const HelpGuide = ({ onMenuClick }) => {
  return (
    <button 
      className="help-button"
      onClick={onMenuClick}
      title="Abrir menu"
    >
      <Menu size={28} />
    </button>
  );
};

export default HelpGuide;

