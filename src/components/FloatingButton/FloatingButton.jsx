import React from 'react';
import { Plus } from 'lucide-react';
import './FloatingButton.css';

const FloatingButton = ({ onClick, title = "Adicionar transação" }) => {
  return (
    <button 
      className="floating-button"
      onClick={onClick}
      title={title}
      aria-label={title}
    >
      <Plus size={28} />
    </button>
  );
};

export default FloatingButton;
