import React from 'react';
import { Calendar, Tag, FileText, DollarSign, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import './TransactionDetailCard.css';

const TransactionDetailCard = ({ transaction, category }) => {
  const isIncome = transaction.type === 'income';
  const Icon = isIncome ? ArrowUpRight : ArrowDownLeft;
  const iconColor = isIncome ? 'var(--color-success)' : 'var(--color-error)';
  const amountColor = isIncome ? 'var(--color-success)' : 'var(--color-error)';

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

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="transaction-detail-card">
      <div className="transaction-header">
        <div className="transaction-icon" style={{ backgroundColor: `${iconColor}20` }}>
          <Icon size={20} style={{ color: iconColor }} />
        </div>
        
        <div className="transaction-main-info">
          <h3 className="transaction-title">{transaction.description}</h3>
          <div className="transaction-tags">
            <span 
              className="category-tag" 
              style={{ 
                backgroundColor: category?.color || 'var(--text-tertiary)',
                color: 'var(--text-inverse)'
              }}
            >
              <Tag size={12} />
              {category?.name || 'Sem categoria'}
            </span>
            <span className={`type-tag ${isIncome ? 'income' : 'expense'}`}>
              {isIncome ? 'Receita' : 'Despesa'}
            </span>
          </div>
        </div>
        
        <div className="transaction-amount" style={{ color: amountColor }}>
          {isIncome ? '+' : '-'}{formatAmount(transaction.amount)}
        </div>
      </div>
      
      <div className="transaction-details">
        <div className="detail-item">
          <Calendar size={14} />
          <span>{formatDate(transaction.date)} às {formatTime(transaction.date)}</span>
        </div>
        
        {transaction.notes && (
          <div className="detail-item">
            <FileText size={14} />
            <span>{transaction.notes}</span>
          </div>
        )}
        
        <div className="detail-item">
          <DollarSign size={14} />
          <span>Valor: {formatAmount(transaction.amount)}</span>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailCard;

