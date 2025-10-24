import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Eye, EyeOff } from 'lucide-react';
import TransactionDetailCard from '../TransactionDetailCard/TransactionDetailCard';
import './CategoryExpenseCard.css';

const CategoryExpenseCard = ({ category, transactions, totalExpense }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const percentage = totalExpense > 0 ? (category.amount / totalExpense) * 100 : 0;
  const averageTransaction = category.count > 0 ? category.amount / category.count : 0;

  return (
    <div className="category-expense-card">
      <div 
        className="category-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="category-info">
          <div 
            className="category-color-indicator" 
            style={{ backgroundColor: category.color }}
          />
          <div className="category-details">
            <h3 className="category-name">{category.name}</h3>
            <div className="category-stats">
              <span className="transaction-count">{category.count} transações</span>
              <span className="average-amount">
                Média: {formatAmount(averageTransaction)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="category-summary">
          <div className="amount-info">
            <p className="total-amount">{formatAmount(category.amount)}</p>
            <p className="percentage">{percentage.toFixed(1)}%</p>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ 
                width: `${percentage}%`,
                backgroundColor: category.color
              }}
            />
          </div>
        </div>
        
        <div className="expand-icon">
          {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </div>
      </div>
      
      {isExpanded && (
        <div className="category-content">
          <div className="category-actions">
            <button 
              className={`toggle-transactions-button ${showTransactions ? 'active' : ''}`}
              onClick={() => setShowTransactions(!showTransactions)}
            >
              {showTransactions ? <EyeOff size={16} /> : <Eye size={16} />}
              {showTransactions ? 'Ocultar' : 'Ver'} Transações
            </button>
          </div>
          
          {showTransactions && (
            <div className="transactions-list">
              {transactions.length > 0 ? (
                transactions.map(transaction => (
                  <TransactionDetailCard
                    key={transaction.id}
                    transaction={transaction}
                    category={{ name: category.name, color: category.color }}
                  />
                ))
              ) : (
                <div className="no-transactions">
                  <p>Nenhuma transação encontrada nesta categoria</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryExpenseCard;

