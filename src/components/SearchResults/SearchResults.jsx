import React from 'react';
import { Search, X, CreditCard, Tag, Target, PiggyBank, Calendar, DollarSign } from 'lucide-react';
import { useSearch } from '../../context/SearchContext';
import { useTheme } from '../../context/ThemeContext';
import { TRANSACTION_TYPES } from '../../context/FinancialContext';
import './SearchResults.css';

const SearchResults = () => {
  const { searchQuery, searchResults, isSearchOpen, closeSearch, clearSearch } = useSearch();
  const { currentTheme } = useTheme();

  if (!isSearchOpen || !searchQuery.trim()) {
    return null;
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getTypeIcon = (resultType) => {
    switch (resultType) {
      case 'transaction':
        return <CreditCard size={16} />;
      case 'category':
        return <Tag size={16} />;
      case 'goal':
        return <Target size={16} />;
      case 'saving':
        return <PiggyBank size={16} />;
      default:
        return <Search size={16} />;
    }
  };

  const getTypeColor = (resultType) => {
    switch (resultType) {
      case 'transaction':
        return '#3B82F6';
      case 'category':
        return '#10B981';
      case 'goal':
        return '#F59E0B';
      case 'saving':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  const getTypeLabel = (resultType) => {
    switch (resultType) {
      case 'transaction':
        return 'Transação';
      case 'category':
        return 'Categoria';
      case 'goal':
        return 'Meta';
      case 'saving':
        return 'Poupança';
      default:
        return 'Item';
    }
  };

  return (
    <div className="search-results-overlay">
      <div className={`search-results ${currentTheme === 'dark' ? 'dark-theme' : 'light-theme'}`} onClick={(e) => e.stopPropagation()}>
        <div className="search-results-header">
          <div className="search-results-title">
            <Search size={20} />
            <span>Resultados para "{searchQuery}"</span>
          </div>
          <button className="search-results-close" onClick={closeSearch}>
            <X size={20} />
          </button>
        </div>

        <div className="search-results-content">
          {searchResults.totalResults === 0 ? (
            <div className="search-no-results">
              <Search size={48} />
              <h3>Nenhum resultado encontrado</h3>
              <p>Tente usar termos diferentes ou verifique a ortografia</p>
            </div>
          ) : (
            <div className="search-results-list">
              {/* Transações */}
              {searchResults.transactions.length > 0 && (
                <div className="search-results-section">
                  <h4 className="search-section-title">
                    <CreditCard size={16} />
                    Transações ({searchResults.transactions.length})
                  </h4>
                  {searchResults.transactions.slice(0, 5).map(transaction => (
                    <div key={`transaction-${transaction.id}`} className="search-result-item">
                      <div className="search-result-icon" style={{ color: getTypeColor(transaction.resultType) }}>
                        {getTypeIcon(transaction.resultType)}
                      </div>
                      <div className="search-result-content">
                        <div className="search-result-main">
                          <span className="search-result-title">{transaction.description}</span>
                          <span className="search-result-type">{getTypeLabel(transaction.resultType)}</span>
                        </div>
                        <div className="search-result-details">
                          <span className={`search-result-amount ${transaction.type === TRANSACTION_TYPES.INCOME ? 'income' : 'expense'}`}>
                            {transaction.type === TRANSACTION_TYPES.INCOME ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </span>
                          <span className="search-result-meta">{transaction.categoryName}</span>
                        </div>
                        <div className="search-result-date">
                          <Calendar size={12} />
                          {formatDate(transaction.date)}
                        </div>
                      </div>
                    </div>
                  ))}
                  {searchResults.transactions.length > 5 && (
                    <div className="search-results-more">
                      +{searchResults.transactions.length - 5} transações encontradas
                    </div>
                  )}
                </div>
              )}

              {/* Categorias */}
              {searchResults.categories.length > 0 && (
                <div className="search-results-section">
                  <h4 className="search-section-title">
                    <Tag size={16} />
                    Categorias ({searchResults.categories.length})
                  </h4>
                  {searchResults.categories.map(category => (
                    <div key={`category-${category.id}`} className="search-result-item">
                      <div className="search-result-icon" style={{ color: getTypeColor(category.resultType) }}>
                        {getTypeIcon(category.resultType)}
                      </div>
                      <div className="search-result-content">
                        <div className="search-result-main">
                          <span className="search-result-title">{category.name}</span>
                          <span className="search-result-type">{getTypeLabel(category.resultType)}</span>
                        </div>
                        <div className="search-result-details">
                          <span className="search-result-meta">
                            {category.type === TRANSACTION_TYPES.INCOME ? 'Receita' : 'Despesa'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Metas */}
              {searchResults.goals.length > 0 && (
                <div className="search-results-section">
                  <h4 className="search-section-title">
                    <Target size={16} />
                    Metas ({searchResults.goals.length})
                  </h4>
                  {searchResults.goals.map(goal => (
                    <div key={`goal-${goal.id}`} className="search-result-item">
                      <div className="search-result-icon" style={{ color: getTypeColor(goal.resultType) }}>
                        {getTypeIcon(goal.resultType)}
                      </div>
                      <div className="search-result-content">
                        <div className="search-result-main">
                          <span className="search-result-title">{goal.name}</span>
                          <span className="search-result-type">{getTypeLabel(goal.resultType)}</span>
                        </div>
                        <div className="search-result-details">
                          <span className="search-result-amount">
                            {formatCurrency(goal.currentAmount || 0)} / {formatCurrency(goal.targetAmount || 0)}
                          </span>
                          <span className="search-result-meta">
                            {(goal.progress || 0).toFixed(1)}% concluído
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Poupanças */}
              {searchResults.savings.length > 0 && (
                <div className="search-results-section">
                  <h4 className="search-section-title">
                    <PiggyBank size={16} />
                    Poupanças ({searchResults.savings.length})
                  </h4>
                  {searchResults.savings.map(saving => (
                    <div key={`saving-${saving.id}`} className="search-result-item">
                      <div className="search-result-icon" style={{ color: getTypeColor(saving.resultType) }}>
                        {getTypeIcon(saving.resultType)}
                      </div>
                      <div className="search-result-content">
                        <div className="search-result-main">
                          <span className="search-result-title">{saving.name}</span>
                          <span className="search-result-type">{getTypeLabel(saving.resultType)}</span>
                        </div>
                        <div className="search-result-details">
                          <span className="search-result-amount">
                            {formatCurrency(saving.amount || 0)} / {saving.frequency || 'N/A'}
                          </span>
                          <span className="search-result-meta">
                            {saving.active ? 'Ativa' : 'Inativa'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="search-results-footer">
          <button className="search-clear-btn" onClick={clearSearch}>
            Limpar busca
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
