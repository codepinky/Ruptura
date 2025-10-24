import React, { useState } from 'react';
import { ChevronDown, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import TransactionDetailCard from '../TransactionDetailCard/TransactionDetailCard';
import './CategoryAnalysisCard.css';

const CategoryAnalysisCard = ({ category, totalIncome, totalExpense }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const incomePercentage = totalIncome > 0 ? (category.income / totalIncome) * 100 : 0;
  const expensePercentage = totalExpense > 0 ? (category.expense / totalExpense) * 100 : 0;
  const totalTransactions = category.incomeCount + category.expenseCount;

  return (
    <div className="category-analysis-card">
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
              <span className="transaction-count">{totalTransactions} transações</span>
              {category.incomeCount > 0 && (
                <span className="income-count">
                  <TrendingUp size={12} />
                  {category.incomeCount} receitas
                </span>
              )}
              {category.expenseCount > 0 && (
                <span className="expense-count">
                  <TrendingDown size={12} />
                  {category.expenseCount} despesas
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="category-summary">
          <div className="amount-breakdown">
            {category.income > 0 && (
              <div className="income-amount">
                <TrendingUp size={14} />
                <span>+{formatAmount(category.income)}</span>
                <span className="percentage">({incomePercentage.toFixed(1)}%)</span>
              </div>
            )}
            {category.expense > 0 && (
              <div className="expense-amount">
                <TrendingDown size={14} />
                <span>-{formatAmount(category.expense)}</span>
                <span className="percentage">({expensePercentage.toFixed(1)}%)</span>
              </div>
            )}
            <div className={`total-amount ${category.total >= 0 ? 'positive' : 'negative'}`}>
              {category.total >= 0 ? '+' : ''}{formatAmount(category.total)}
            </div>
          </div>
          
          <div className="progress-bars">
            {category.income > 0 && (
              <div className="progress-bar income-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${incomePercentage}%`,
                    backgroundColor: '#10B981'
                  }}
                />
              </div>
            )}
            {category.expense > 0 && (
              <div className="progress-bar expense-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${expensePercentage}%`,
                    backgroundColor: '#EF4444'
                  }}
                />
              </div>
            )}
          </div>
        </div>
        
        <div className="expand-icon">
          {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </div>
      </div>
      
      {isExpanded && (
        <div className="category-content">
          <div className="transactions-list">
            {category.transactions.length > 0 ? (
              category.transactions.map(transaction => (
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
        </div>
      )}
    </div>
  );
};

export default CategoryAnalysisCard;

