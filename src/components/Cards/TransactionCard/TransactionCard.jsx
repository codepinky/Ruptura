import React from 'react';
import { ArrowUpRight, ArrowDownLeft, MoreVertical } from 'lucide-react';
import './TransactionCard.css';

const TransactionCard = ({ transaction, onEdit }) => {
  const isIncome = transaction.type === 'income';
  const Icon = isIncome ? ArrowUpRight : ArrowDownLeft;
  const iconColor = isIncome ? '#10B981' : '#EF4444';
  const amountColor = isIncome ? '#10B981' : '#EF4444';

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

  return (
    <div className="transaction-card">
      <div className="transaction-icon" style={{ backgroundColor: `${iconColor}20` }}>
        <Icon size={20} style={{ color: iconColor }} />
      </div>
      
      <div className="transaction-info">
        <h4 className="transaction-description">{transaction.description}</h4>
        <p className="transaction-category">{transaction.categoryName}</p>
        <p className="transaction-date">{formatDate(transaction.date)}</p>
      </div>
      
      <div className="transaction-amount" style={{ color: amountColor }}>
        {isIncome ? '+' : '-'}{formatAmount(transaction.amount)}
      </div>
      
      <div className="transaction-actions">
        <button className="action-button" onClick={() => onEdit(transaction)}>
          <MoreVertical size={16} />
        </button>
      </div>
    </div>
  );
};

export default TransactionCard;

