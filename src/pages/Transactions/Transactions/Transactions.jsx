import React, { useState, useMemo } from 'react';
import { Plus, Filter, Search, Calendar, Download } from 'lucide-react';
import { useFinancial, TRANSACTION_TYPES } from '../../../context/FinancialContext';
import TransactionCard from '../../../components/Cards/TransactionCard/TransactionCard';
import TransactionForm from '../../../components/Forms/TransactionForm/TransactionForm';
import './Transactions.css';

const Transactions = () => {
  const { transactions, categories } = useFinancial();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  // Filtrar e ordenar transações
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Filtro por texto
    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtro por tipo
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    // Filtro por categoria
    if (filterCategory !== 'all') {
      filtered = filtered.filter(t => t.categoryId === parseInt(filterCategory));
    }

    // Ordenação
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date) - new Date(a.date);
        case 'amount':
          return b.amount - a.amount;
        case 'description':
          return a.description.localeCompare(b.description);
        default:
          return 0;
      }
    });

    return filtered.map(transaction => ({
      ...transaction,
      categoryName: categories.find(c => c.id === transaction.categoryId)?.name || 'Sem categoria'
    }));
  }, [transactions, categories, searchQuery, filterType, filterCategory, sortBy]);

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleDeleteTransaction = (transactionId) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      // Implementar delete
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

  const totalIncome = filteredTransactions
    .filter(t => t.type === TRANSACTION_TYPES.INCOME)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter(t => t.type === TRANSACTION_TYPES.EXPENSE)
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  return (
    <div className="transactions-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Transações</h1>
          <p className="page-subtitle">Gerencie suas receitas e despesas</p>
        </div>
        <button 
          className="add-button"
          onClick={() => setIsFormOpen(true)}
        >
          <Plus size={20} />
          Nova Transação
        </button>
      </div>

      {/* Filtros e Busca */}
      <div className="filters-section">
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

        <div className="filters-row">
          <div className="filter-group">
            <label className="filter-label">Tipo</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">Todos</option>
              <option value={TRANSACTION_TYPES.INCOME}>Receitas</option>
              <option value={TRANSACTION_TYPES.EXPENSE}>Despesas</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Categoria</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="filter-select"
            >
              <option value="all">Todas</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Ordenar por</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="date">Data</option>
              <option value="amount">Valor</option>
              <option value="description">Descrição</option>
            </select>
          </div>

          <button className="export-button">
            <Download size={16} />
            Exportar
          </button>
        </div>
      </div>

      {/* Resumo */}
      <div className="summary-cards">
        <div className="summary-card income">
          <h3>Total de Receitas</h3>
          <p className="amount">{formatAmount(totalIncome)}</p>
        </div>
        <div className="summary-card expense">
          <h3>Total de Despesas</h3>
          <p className="amount">{formatAmount(totalExpense)}</p>
        </div>
        <div className="summary-card balance">
          <h3>Saldo</h3>
          <p className={`amount ${balance >= 0 ? 'positive' : 'negative'}`}>
            {formatAmount(balance)}
          </p>
        </div>
      </div>

      {/* Lista de Transações */}
      <div className="transactions-section">
        <div className="section-header">
          <h2 className="section-title">
            Transações ({filteredTransactions.length})
          </h2>
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
              <button 
                className="add-first-button"
                onClick={() => setIsFormOpen(true)}
              >
                <Plus size={20} />
                Adicionar Transação
              </button>
            </div>
          )}
        </div>
      </div>

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

