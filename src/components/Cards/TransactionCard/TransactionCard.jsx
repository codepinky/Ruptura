import React, { useRef, memo } from 'react';
import { ArrowUpRight, ArrowDownLeft, MoreVertical } from 'lucide-react';
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
  const selectRef = useRef(null);
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

  const handleMenuChange = (e) => {
    const action = e.target.value;
    e.target.value = ''; // Reset para permitir selecionar a mesma opção novamente
    
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
      
      <div className="transaction-actions">
        <div className="native-menu-wrapper">
          <button 
            className="action-button-native"
            onClick={() => selectRef.current?.click()}
            aria-label="Menu de ações"
            type="button"
          >
            <MoreVertical size={16} />
          </button>
          <select
            ref={selectRef}
            className="native-action-select"
            onChange={handleMenuChange}
            value=""
            aria-label="Menu de ações"
          >
            <option value="" disabled hidden>Selecione uma ação</option>
            <option value="edit">Editar</option>
            <option value="duplicate">Duplicar</option>
            <option value="details">Ver Detalhes</option>
            <option value="delete">Excluir</option>
          </select>
        </div>
      </div>
    </div>
  );
});

TransactionCard.displayName = 'TransactionCard';

export default TransactionCard;

