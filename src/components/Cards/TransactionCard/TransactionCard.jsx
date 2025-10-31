import React, { useState, useRef, useEffect, memo } from 'react';
import { ArrowUpRight, ArrowDownLeft, MoreVertical, Edit, Copy, Eye, Trash2 } from 'lucide-react';
import './TransactionCard.css';

const TransactionCard = memo(({ 
  transaction, 
  onEdit, 
  onDelete, 
  onDuplicate,
  onViewDetails,
  animationDelay = 0,
  isSelected = false,
  onSelect = null
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const isIncome = transaction.type === 'income';
  const Icon = isIncome ? ArrowUpRight : ArrowDownLeft;
  const iconColor = isIncome ? '#10B981' : '#EF4444';
  const amountColor = isIncome ? '#10B981' : '#EF4444';
  const categoryColor = transaction.categoryColor || '#64748B';

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Agora';
    if (diffInSeconds < 3600) return `há ${Math.floor(diffInSeconds / 60)}min`;
    if (diffInSeconds < 86400) return `há ${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `há ${Math.floor(diffInSeconds / 86400)} dias`;
    
    return formatDate(dateString);
  };

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleMenuAction = (action) => {
    setIsMenuOpen(false);
    switch (action) {
      case 'edit':
        onEdit?.(transaction);
        break;
      case 'duplicate':
        onDuplicate?.(transaction);
        break;
      case 'details':
        onViewDetails?.(transaction);
        break;
      case 'delete':
        if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
          onDelete?.(transaction.id);
        }
        break;
      default:
        break;
    }
  };

  return (
    <div 
      className={`transaction-card ${isSelected ? 'selected' : ''}`}
      style={{
        animationDelay: `${animationDelay}ms`
      }}
    >
      {onSelect && (
        <div className="transaction-checkbox">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(transaction.id, e.target.checked)}
          />
        </div>
      )}
      
      <div className="transaction-icon" style={{ backgroundColor: `${iconColor}15` }}>
        <Icon size={16} style={{ color: iconColor }} />
      </div>
      
      <div className="transaction-info">
        <h4 className="transaction-description">{transaction.description}</h4>
        <p className="transaction-category">{transaction.categoryName}</p>
        <p className="transaction-date">{getRelativeTime(transaction.date)}</p>
      </div>
      
      <div className="transaction-amount" style={{ color: amountColor }}>
        {isIncome ? '+' : '-'}{formatAmount(transaction.amount)}
      </div>
      
      <div className="transaction-actions" ref={menuRef}>
        <button 
          className="action-button" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Menu de ações"
        >
          <MoreVertical size={16} />
        </button>
        
        {isMenuOpen && (
          <div className="action-menu">
            <button 
              className="menu-item"
              onClick={() => handleMenuAction('edit')}
            >
              <Edit size={16} />
              <span>Editar</span>
            </button>
            <button 
              className="menu-item"
              onClick={() => handleMenuAction('duplicate')}
            >
              <Copy size={16} />
              <span>Duplicar</span>
            </button>
            <button 
              className="menu-item"
              onClick={() => handleMenuAction('details')}
            >
              <Eye size={16} />
              <span>Ver Detalhes</span>
            </button>
            <button 
              className="menu-item delete"
              onClick={() => handleMenuAction('delete')}
            >
              <Trash2 size={16} />
              <span>Excluir</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

TransactionCard.displayName = 'TransactionCard';

export default TransactionCard;

