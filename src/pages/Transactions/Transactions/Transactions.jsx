import React, { useState, useMemo } from 'react';
import { Search, TrendingUp, TrendingDown, Wallet, Filter } from 'lucide-react';
import { useFinancial, TRANSACTION_TYPES } from '../../../context/FinancialContext';
import TransactionCard from '../../../components/Cards/TransactionCard/TransactionCard';
import TransactionForm from '../../../components/Forms/TransactionForm/TransactionForm';
import FloatingButton from '../../../components/FloatingButton/FloatingButton';
import './Transactions.css';

const Transactions = () => {
  const { transactions, categories, deleteTransaction } = useFinancial();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);


  // Filtrar transações
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Filtro por texto
    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtro por categoria
    if (filterCategory !== 'all') {
      filtered = filtered.filter(t => t.categoryId === parseInt(filterCategory));
    }

    // Ordenação por data (mais recente primeiro)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    return filtered.map(transaction => ({
      ...transaction,
      categoryName: categories.find(c => c.id === transaction.categoryId)?.name || 'Sem categoria'
    }));
  }, [transactions, categories, searchQuery, filterCategory]);

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleDeleteTransaction = (transactionId) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      deleteTransaction(transactionId);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTransaction(null);
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  // Dados para os cards de resumo (usando dados filtrados)
  const summaryData = useMemo(() => {
    const totalIncome = filteredTransactions
      .filter(t => t.type === TRANSACTION_TYPES.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = filteredTransactions
      .filter(t => t.type === TRANSACTION_TYPES.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpense;

    return [
      {
        title: 'Receitas',
        value: formatAmount(totalIncome),
        icon: TrendingUp,
        color: '#10B981'
      },
      {
        title: 'Despesas',
        value: formatAmount(totalExpense),
        icon: TrendingDown,
        color: '#EF4444'
      },
      {
        title: 'Saldo Atual',
        value: formatAmount(balance),
        icon: Wallet,
        color: balance >= 0 ? '#3B82F6' : '#EF4444'
      }
    ];
  }, [filteredTransactions]);

  return (
    <div className="transactions-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="dashboard-title">Transações</h1> #Arrumar isso depois!
          <p className="page-subtitle">Gerencie suas receitas e despesas</p>
        </div>
      </div>

      {/* Filtros Expansíveis */}
      <div className="filters-section">
        <button 
          className="filter-toggle-button"
          onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
        >
          <Filter size={20} />
          <span>Filtros</span>
          <span className={`toggle-arrow ${isFiltersExpanded ? 'expanded' : ''}`}>▼</span>
        </button>

        {isFiltersExpanded && (
          <div className="filters-content">
            <div className="search-container">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="Buscar transações..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="category-filter">
              <label className="filter-label">Categoria</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="filter-select"
              >
                <option value="all">Todas as categorias</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Card Unificado Mobile */}
      <div className="summary-unified-mobile">
        {summaryData.map((item, index) => (
          <div key={index} className="unified-item">
            <div className="unified-icon" style={{ backgroundColor: item.color }}>
              {React.createElement(item.icon, { size: 20 })}
            </div>
            <div className="unified-content">
              <h3 className="unified-title">{item.title}</h3>
              <p className="unified-value">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Lista de Transações */}
      <div className="transactions-section">
        <div className="section-header">
          <div className="transaction-count">
            <span className="count-number">{filteredTransactions.length}</span>
            <span className="count-label">transações</span>
          </div>
        </div>

        <div className="transactions-list">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map(transaction => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                onEdit={handleEditTransaction}
                onDelete={handleDeleteTransaction}
              />
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <h3>Nenhuma transação encontrada</h3>
              <p>Comece adicionando sua primeira transação</p>
            </div>
          )}
        </div>
      </div>

      {/* FloatingButton */}
      <FloatingButton onClick={() => setIsFormOpen(true)} />

      {/* Modal do Formulário */}
      <TransactionForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        transaction={editingTransaction}
      />
    </div>
  );
};

export default Transactions;

