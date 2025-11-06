import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Search, TrendingUp, TrendingDown, Wallet, Filter, ArrowUpDown, ArrowUp, ArrowDown, X, Calendar, DollarSign, Plus, CheckSquare, Square, Trash2, Download, ChevronDown } from 'lucide-react';
import { useFinancial, TRANSACTION_TYPES } from '../../../context/FinancialContext';
import TransactionCard from '../../../components/Cards/TransactionCard/TransactionCard';
import TransactionForm from '../../../components/Forms/TransactionForm/TransactionForm';
import TransactionDetailCard from '../../../components/Cards/TransactionDetailCard/TransactionDetailCard';
import FloatingButton from '../../../components/FloatingButton/FloatingButton';
import { exportToCSV, exportToPDF } from '../../../utils/exportUtils';
import './Transactions.css';

const Transactions = () => {
  const { transactions, categories, deleteTransaction, duplicateTransaction } = useFinancial();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [selectedTransactions, setSelectedTransactions] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [viewDetailsTransaction, setViewDetailsTransaction] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterMinAmount, setFilterMinAmount] = useState('');
  const [filterMaxAmount, setFilterMaxAmount] = useState('');
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const filtersPanelRef = useRef(null);
  const [isControlsExpanded, setIsControlsExpanded] = useState(false);

  // Debounce para busca
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fechar menu de exportação ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isExportMenuOpen && !event.target.closest('.export-dropdown')) {
        setIsExportMenuOpen(false);
      }
    };

    if (isExportMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExportMenuOpen]);

  // Fechar painel de filtros com ESC, bloquear scroll do body e gerenciar foco
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        if (isFiltersExpanded) {
          setIsFiltersExpanded(false);
        } else if (isControlsExpanded) {
          setIsControlsExpanded(false);
        }
      }
    };

    const isAnyPanelOpen = isFiltersExpanded || isControlsExpanded;

    if (isAnyPanelOpen) {
      document.addEventListener('keydown', handleEscape);
      // Bloquear scroll do body
      document.body.style.overflow = 'hidden';
      
      if (isFiltersExpanded) {
        // Focar no painel de filtros para acessibilidade
        setTimeout(() => {
          if (filtersPanelRef.current) {
            const firstInput = filtersPanelRef.current.querySelector('input, select, button');
            if (firstInput) {
              firstInput.focus();
            }
          }
        }, 100);
      }
    } else {
      // Restaurar scroll do body
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      if (!isFiltersExpanded && !isControlsExpanded) {
        document.body.style.overflow = '';
      }
    };
  }, [isFiltersExpanded, isControlsExpanded]);

  // Contar filtros ativos
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (filterCategory !== 'all') count++;
    if (filterType !== 'all') count++;
    if (filterStartDate || filterEndDate) count++;
    if (filterMinAmount || filterMaxAmount) count++;
    return count;
  }, [searchQuery, filterCategory, filterType, filterStartDate, filterEndDate, filterMinAmount, filterMaxAmount]);

  // Função para limpar todos os filtros
  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setFilterCategory('all');
    setFilterType('all');
    setFilterStartDate('');
    setFilterEndDate('');
    setFilterMinAmount('');
    setFilterMaxAmount('');
  }, []);

  // Função de formatação de data relativa
  const getRelativeDateLabel = useCallback((dateString) => {
    const transactionDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    if (transactionDate >= today) {
      return 'Hoje';
    } else if (transactionDate >= yesterday) {
      return 'Ontem';
    } else if (transactionDate >= thisWeekStart) {
      return 'Esta Semana';
    } else if (transactionDate >= thisMonthStart) {
      return 'Este Mês';
    } else {
      return transactionDate.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: 'long', 
        year: transactionDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined 
      });
    }
  }, []);

  // Filtrar transações
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Filtro por texto
    if (debouncedSearchQuery) {
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        t.notes?.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      );
    }

    // Filtro por categoria
    if (filterCategory !== 'all') {
      filtered = filtered.filter(t => t.categoryId === parseInt(filterCategory));
    }

    // Filtro por tipo
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    // Filtro por período
    if (filterStartDate) {
      filtered = filtered.filter(t => new Date(t.date) >= new Date(filterStartDate));
    }
    if (filterEndDate) {
      const endDate = new Date(filterEndDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(t => new Date(t.date) <= endDate);
    }

    // Filtro por valor
    if (filterMinAmount) {
      filtered = filtered.filter(t => t.amount >= parseFloat(filterMinAmount));
    }
    if (filterMaxAmount) {
      filtered = filtered.filter(t => t.amount <= parseFloat(filterMaxAmount));
    }

    // Ordenação
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch(sortField) {
        case 'date':
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'category':
          const catA = categories.find(c => c.id === a.categoryId)?.name || '';
          const catB = categories.find(c => c.id === b.categoryId)?.name || '';
          comparison = catA.localeCompare(catB);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'description':
          comparison = a.description.localeCompare(b.description);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered.map(transaction => ({
      ...transaction,
      categoryName: categories.find(c => c.id === transaction.categoryId)?.name || 'Sem categoria',
      categoryColor: categories.find(c => c.id === transaction.categoryId)?.color || '#64748B'
    }));
  }, [transactions, categories, debouncedSearchQuery, filterCategory, filterType, filterStartDate, filterEndDate, filterMinAmount, filterMaxAmount, sortField, sortOrder]);

  // Agrupar transações por data
  const groupedTransactions = useMemo(() => {
    const groups = {};
    
    filteredTransactions.forEach(transaction => {
      const dateKey = getRelativeDateLabel(transaction.date);
      
      if (!groups[dateKey]) {
        groups[dateKey] = {
          label: dateKey,
          date: transaction.date,
          transactions: []
        };
      }
      
      groups[dateKey].transactions.push(transaction);
    });

    // Calcular totais por dia
    Object.keys(groups).forEach(key => {
      const group = groups[key];
      group.totalIncome = group.transactions
        .filter(t => t.type === TRANSACTION_TYPES.INCOME)
        .reduce((sum, t) => sum + t.amount, 0);
      group.totalExpense = group.transactions
        .filter(t => t.type === TRANSACTION_TYPES.EXPENSE)
        .reduce((sum, t) => sum + t.amount, 0);
    });

    // Ordenar grupos por data (mais recente primeiro)
    return Object.values(groups).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [filteredTransactions, getRelativeDateLabel]);

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleDeleteTransaction = (transactionId) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      deleteTransaction(transactionId);
    }
  };

  const handleDuplicateTransaction = (transaction) => {
    duplicateTransaction(transaction);
  };

  const handleViewDetails = (transaction) => {
    setViewDetailsTransaction(transaction);
  };

  const handleSelectTransaction = (transactionId, isSelected) => {
    setSelectedTransactions(prev => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(transactionId);
      } else {
        newSet.delete(transactionId);
      }
      return newSet;
    });
  };

  const handleBulkDelete = () => {
    if (selectedTransactions.size === 0) return;
    
    const count = selectedTransactions.size;
    if (window.confirm(`Tem certeza que deseja excluir ${count} transação(ões)?`)) {
      selectedTransactions.forEach(id => deleteTransaction(id));
      setSelectedTransactions(new Set());
      setIsSelectionMode(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedTransactions.size === filteredTransactions.length) {
      setSelectedTransactions(new Set());
    } else {
      setSelectedTransactions(new Set(filteredTransactions.map(t => t.id)));
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTransaction(null);
  };

  const handleCloseDetails = () => {
    setViewDetailsTransaction(null);
  };

  // Funções para atalhos de período
  const applyPeriodFilter = useCallback((period) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let startDate = '';
    let endDate = '';
    
    switch(period) {
      case 'today':
        startDate = today.toISOString().split('T')[0];
        endDate = today.toISOString().split('T')[0];
        break;
      case 'thisWeek':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        startDate = weekStart.toISOString().split('T')[0];
        endDate = weekEnd.toISOString().split('T')[0];
        break;
      case 'thisMonth':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        startDate = monthStart.toISOString().split('T')[0];
        endDate = monthEnd.toISOString().split('T')[0];
        break;
      case 'last30days':
        const last30Start = new Date(today);
        last30Start.setDate(today.getDate() - 30);
        startDate = last30Start.toISOString().split('T')[0];
        endDate = today.toISOString().split('T')[0];
        break;
      default:
        break;
    }
    
    setFilterStartDate(startDate);
    setFilterEndDate(endDate);
    setIsFiltersExpanded(true);
  }, []);

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  // Estatísticas rápidas
  const quickStats = useMemo(() => {
    if (filteredTransactions.length === 0) {
      return {
        maxIncome: null,
        maxExpense: null,
        minIncome: null,
        minExpense: null,
        averageIncome: 0,
        averageExpense: 0,
        topCategories: []
      };
    }

    const incomes = filteredTransactions.filter(t => t.type === TRANSACTION_TYPES.INCOME);
    const expenses = filteredTransactions.filter(t => t.type === TRANSACTION_TYPES.EXPENSE);

    const maxIncome = incomes.length > 0 
      ? incomes.reduce((max, t) => t.amount > max.amount ? t : max, incomes[0])
      : null;
    
    const maxExpense = expenses.length > 0
      ? expenses.reduce((max, t) => t.amount > max.amount ? t : max, expenses[0])
      : null;

    const minIncome = incomes.length > 0
      ? incomes.reduce((min, t) => t.amount < min.amount ? t : min, incomes[0])
      : null;
    
    const minExpense = expenses.length > 0
      ? expenses.reduce((min, t) => t.amount < min.amount ? t : min, expenses[0])
      : null;

    const averageIncome = incomes.length > 0
      ? incomes.reduce((sum, t) => sum + t.amount, 0) / incomes.length
      : 0;

    const averageExpense = expenses.length > 0
      ? expenses.reduce((sum, t) => sum + t.amount, 0) / expenses.length
      : 0;

    // Top 3 categorias por valor total
    const categoryTotals = {};
    filteredTransactions.forEach(t => {
      const catId = t.categoryId;
      if (!categoryTotals[catId]) {
        categoryTotals[catId] = { id: catId, total: 0, name: t.categoryName, color: t.categoryColor };
      }
      categoryTotals[catId].total += t.amount;
    });

    const topCategories = Object.values(categoryTotals)
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);

    return {
      maxIncome,
      maxExpense,
      minIncome,
      minExpense,
      averageIncome,
      averageExpense,
      topCategories
    };
  }, [filteredTransactions]);

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
      {/* Header Compacto com Título e Ações */}
      <div className="transaction-header">
        <div className="header-main">
          <div className="header-text">
            <h1 className="transaction-title">Transações</h1>
            <p className="transaction-subtitle">Gerencie suas receitas e despesas</p>
            <button 
              className="add-transaction-header-button"
              onClick={() => setIsFormOpen(true)}
            >
              <Plus size={18} />
              <span>Adicionar Transação</span>
            </button>
          </div>
        </div>
      </div>

      {/* Atalhos de Período */}
      <div className="period-shortcuts">
        <button 
          className="period-shortcut"
          onClick={() => applyPeriodFilter('today')}
        >
          Hoje
        </button>
        <button 
          className="period-shortcut"
          onClick={() => applyPeriodFilter('thisWeek')}
        >
          Esta Semana
        </button>
        <button 
          className="period-shortcut"
          onClick={() => applyPeriodFilter('thisMonth')}
        >
          Este Mês
        </button>
        <button 
          className="period-shortcut"
          onClick={() => applyPeriodFilter('last30days')}
        >
          Últimos 30 dias
        </button>
      </div>

      {/* Cards de Resumo em Grid */}
      <div className="summary-cards-grid">
        {summaryData.map((item, index) => (
          <div key={index} className="summary-card-item">
            <div className="summary-card-icon" style={{ backgroundColor: `${item.color}15` }}>
              {React.createElement(item.icon, { size: 24, color: item.color })}
            </div>
            <div className="summary-card-content">
              <p className="summary-card-title">{item.title}</p>
              <h3 className="summary-card-value">{item.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Estatísticas Rápidas */}
      {filteredTransactions.length > 0 && (
        <div className="quick-stats-section">
          <h3 className="quick-stats-title">Estatísticas</h3>
          <div className="quick-stats-grid">
            {quickStats.maxIncome && (
              <div className="quick-stat-card">
                <div className="quick-stat-icon" style={{ backgroundColor: '#10B98115' }}>
                  <TrendingUp size={16} color="#10B981" />
                </div>
                <div className="quick-stat-content">
                  <p className="quick-stat-label">Maior Receita</p>
                  <h3 className="quick-stat-value income">{formatAmount(quickStats.maxIncome.amount)}</h3>
                  {quickStats.maxIncome.description && (
                    <p className="quick-stat-desc">{quickStats.maxIncome.description}</p>
                  )}
                </div>
              </div>
            )}
            
            {quickStats.maxExpense && (
              <div className="quick-stat-card">
                <div className="quick-stat-icon" style={{ backgroundColor: '#EF444415' }}>
                  <TrendingDown size={16} color="#EF4444" />
                </div>
                <div className="quick-stat-content">
                  <p className="quick-stat-label">Maior Despesa</p>
                  <h3 className="quick-stat-value expense">{formatAmount(quickStats.maxExpense.amount)}</h3>
                  {quickStats.maxExpense.description && (
                    <p className="quick-stat-desc">{quickStats.maxExpense.description}</p>
                  )}
                </div>
              </div>
            )}

            <div className="quick-stat-card">
              <div className="quick-stat-icon" style={{ backgroundColor: '#3B82F615' }}>
                <DollarSign size={16} color="#3B82F6" />
              </div>
              <div className="quick-stat-content">
                <p className="quick-stat-label">Média Receitas</p>
                <h3 className="quick-stat-value">{formatAmount(quickStats.averageIncome)}</h3>
              </div>
            </div>

            <div className="quick-stat-card">
              <div className="quick-stat-icon" style={{ backgroundColor: '#EF444415' }}>
                <DollarSign size={16} color="#EF4444" />
              </div>
              <div className="quick-stat-content">
                <p className="quick-stat-label">Média Despesas</p>
                <h3 className="quick-stat-value">{formatAmount(quickStats.averageExpense)}</h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botão Compacto Mobile */}
      <button 
        className="controls-mobile-toggle"
        onClick={() => setIsControlsExpanded(!isControlsExpanded)}
        aria-label={isControlsExpanded ? "Fechar controles" : "Abrir controles"}
        aria-expanded={isControlsExpanded}
      >
        <div className="controls-mobile-toggle-content">
          <div className="controls-mobile-info">
            <span className="controls-mobile-count">{filteredTransactions.length}</span>
            <span className="controls-mobile-label">transações</span>
          </div>
          <ChevronDown 
            size={20} 
            className={`controls-mobile-chevron ${isControlsExpanded ? 'expanded' : ''}`}
          />
        </div>
      </button>

      {/* Painel de Controles Expansível Mobile */}
      {isControlsExpanded && (
        <>
          <div 
            className="controls-mobile-overlay" 
            onClick={() => setIsControlsExpanded(false)}
            aria-label="Fechar controles"
          />
          <div className="controls-mobile-panel">
            <div className="controls-mobile-panel-header">
              <h3>Controles</h3>
              <button 
                className="controls-mobile-close"
                onClick={() => setIsControlsExpanded(false)}
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </div>
            <div className="controls-mobile-panel-content">
              {/* Conteúdo da controls-bar aqui */}
              <div className="controls-mobile-search">
                <div className="search-wrapper">
                  <Search size={18} className="search-icon-controls" />
                  <input
                    type="text"
                    placeholder="Buscar transações..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input-controls"
                  />
                  {searchQuery && (
                    <button 
                      className="clear-search-button"
                      onClick={() => setSearchQuery('')}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              <div className="controls-mobile-actions">
                <button 
                  className="filter-toggle-button-new"
                  onClick={() => {
                    setIsFiltersExpanded(true);
                    setIsControlsExpanded(false);
                  }}
                >
                  <Filter size={16} />
                  <span>Filtros</span>
                  {activeFiltersCount > 0 && (
                    <span className="filter-badge-new">{activeFiltersCount}</span>
                  )}
                </button>

                <button 
                  className={`selection-mode-button ${isSelectionMode ? 'active' : ''}`}
                  onClick={() => {
                    setIsSelectionMode(!isSelectionMode);
                    if (!isSelectionMode) {
                      setSelectedTransactions(new Set());
                    }
                    setIsControlsExpanded(false);
                  }}
                >
                  {isSelectionMode ? <CheckSquare size={16} /> : <Square size={16} />}
                  <span>Selecionar</span>
                </button>

                {isSelectionMode && selectedTransactions.size > 0 && (
                  <button 
                    className="bulk-delete-button"
                    onClick={() => {
                      handleBulkDelete();
                      setIsControlsExpanded(false);
                    }}
                  >
                    <Trash2 size={16} />
                    <span>Excluir ({selectedTransactions.size})</span>
                  </button>
                )}

                <div className={`export-dropdown ${isExportMenuOpen ? 'active' : ''}`}>
                  <button 
                    className="export-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExportMenuOpen(!isExportMenuOpen);
                    }}
                  >
                    <Download size={16} />
                    <span>Exportar</span>
                    <ChevronDown size={14} />
                  </button>
                  {isExportMenuOpen && (
                    <div className="export-menu">
                      <button 
                        className="export-menu-item"
                        onClick={() => {
                          exportToCSV(filteredTransactions, categories);
                          setIsExportMenuOpen(false);
                          setIsControlsExpanded(false);
                        }}
                      >
                        <span>Exportar CSV</span>
                      </button>
                      <button 
                        className="export-menu-item"
                        onClick={() => {
                          exportToPDF(filteredTransactions, categories);
                          setIsExportMenuOpen(false);
                          setIsControlsExpanded(false);
                        }}
                      >
                        <span>Exportar PDF</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="sort-controls-compact">
                  <label className="sort-label-mobile">Ordenar por:</label>
                  <div className="sort-controls-wrapper">
                    <select
                      value={sortField}
                      onChange={(e) => setSortField(e.target.value)}
                      className="sort-select-compact"
                    >
                      <option value="date">Data</option>
                      <option value="amount">Valor</option>
                      <option value="category">Categoria</option>
                      <option value="type">Tipo</option>
                      <option value="description">Descrição</option>
                    </select>
                    <button 
                      className="sort-order-button-compact"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      title={`Ordenação ${sortOrder === 'asc' ? 'Crescente' : 'Decrescente'}`}
                    >
                      {sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Barra de Controles Unificada (Filtros + Ordenação) - Desktop */}
      <div className="controls-bar">
        <div className="controls-left">
          <div className="search-wrapper">
            <Search size={18} className="search-icon-controls" />
            <input
              type="text"
              placeholder="Buscar transações..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input-controls"
            />
            {searchQuery && (
              <button 
                className="clear-search-button"
                onClick={() => setSearchQuery('')}
              >
                <X size={16} />
              </button>
            )}
          </div>

          <button 
            className="filter-toggle-button-new"
            onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
          >
            <Filter size={16} />
            <span>Filtros</span>
            {activeFiltersCount > 0 && (
              <span className="filter-badge-new">{activeFiltersCount}</span>
            )}
          </button>

          <button 
            className={`selection-mode-button ${isSelectionMode ? 'active' : ''}`}
            onClick={() => {
              setIsSelectionMode(!isSelectionMode);
              if (!isSelectionMode) {
                setSelectedTransactions(new Set());
              }
            }}
          >
            {isSelectionMode ? <CheckSquare size={16} /> : <Square size={16} />}
            <span>Selecionar</span>
          </button>

          {isSelectionMode && selectedTransactions.size > 0 && (
            <button 
              className="bulk-delete-button"
              onClick={handleBulkDelete}
            >
              <Trash2 size={16} />
              <span>Excluir ({selectedTransactions.size})</span>
            </button>
          )}
        </div>

        <div className="controls-right">
          <div className="transaction-count-inline">
            <span className="count-number-inline">{filteredTransactions.length}</span>
            <span className="count-label-inline">transações</span>
          </div>
          
          <div className={`export-dropdown ${isExportMenuOpen ? 'active' : ''}`}>
            <button 
              className="export-button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExportMenuOpen(!isExportMenuOpen);
              }}
            >
              <Download size={16} />
              <span>Exportar</span>
              <ChevronDown size={14} />
            </button>
            {isExportMenuOpen && (
              <div className="export-menu">
                <button 
                  className="export-menu-item"
                  onClick={() => {
                    exportToCSV(filteredTransactions, categories);
                    setIsExportMenuOpen(false);
                  }}
                >
                  <span>Exportar CSV</span>
                </button>
                <button 
                  className="export-menu-item"
                  onClick={() => {
                    exportToPDF(filteredTransactions, categories);
                    setIsExportMenuOpen(false);
                  }}
                >
                  <span>Exportar PDF</span>
                </button>
              </div>
            )}
          </div>

          <div className="sort-controls-compact">
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
              className="sort-select-compact"
            >
              <option value="date">Data</option>
              <option value="amount">Valor</option>
              <option value="category">Categoria</option>
              <option value="type">Tipo</option>
              <option value="description">Descrição</option>
            </select>
            <button 
              className="sort-order-button-compact"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              title={`Ordenação ${sortOrder === 'asc' ? 'Crescente' : 'Decrescente'}`}
            >
              {sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Painel de Filtros Sidebar */}
      {isFiltersExpanded && (
        <>
          <div 
            className="filters-panel-overlay" 
            onClick={() => setIsFiltersExpanded(false)}
            aria-label="Fechar filtros"
          />
          <div className="filters-panel" ref={filtersPanelRef} role="dialog" aria-modal="true" aria-labelledby="filters-panel-title">
            <div className="filters-panel-header">
              <h3 id="filters-panel-title">Filtros Avançados</h3>
              <div className="filters-panel-header-actions">
                {activeFiltersCount > 0 && (
                  <button 
                    className="clear-filters-button" 
                    onClick={clearAllFilters}
                    aria-label="Limpar todos os filtros"
                  >
                    <X size={16} />
                    <span>Limpar</span>
                  </button>
                )}
                <button 
                  className="close-filters-button" 
                  onClick={() => setIsFiltersExpanded(false)}
                  aria-label="Fechar painel de filtros"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="filters-panel-content">
              <div className="filters-grid">
                <div className="filter-group">
                  <label className="filter-label">Tipo de Transação</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">Todas</option>
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
                    <option value="all">Todas as categorias</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="filters-grid">
                <div className="filter-group">
                  <label className="filter-label">Data Inicial</label>
                  <input
                    type="date"
                    value={filterStartDate}
                    onChange={(e) => setFilterStartDate(e.target.value)}
                    className="filter-input"
                  />
                </div>

                <div className="filter-group">
                  <label className="filter-label">Data Final</label>
                  <input
                    type="date"
                    value={filterEndDate}
                    onChange={(e) => setFilterEndDate(e.target.value)}
                    className="filter-input"
                  />
                </div>
              </div>

              <div className="filters-grid">
                <div className="filter-group">
                  <label className="filter-label">Valor Mínimo</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    value={filterMinAmount}
                    onChange={(e) => setFilterMinAmount(e.target.value)}
                    className="filter-input"
                  />
                </div>

                <div className="filter-group">
                  <label className="filter-label">Valor Máximo</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    value={filterMaxAmount}
                    onChange={(e) => setFilterMaxAmount(e.target.value)}
                    className="filter-input"
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Lista de Transações Agrupadas */}
      <div className="transactions-section">
        <div className="transactions-list">
          {filteredTransactions.length > 0 ? (
            groupedTransactions.map((group, groupIndex) => (
              <div key={group.label} className="transaction-group">
                <div className="group-transactions">
                  {group.transactions.map((transaction, index) => (
                    <TransactionCard
                      key={transaction.id}
                      transaction={transaction}
                      onEdit={handleEditTransaction}
                      onDelete={handleDeleteTransaction}
                      onDuplicate={handleDuplicateTransaction}
                      onViewDetails={handleViewDetails}
                      onSelect={isSelectionMode ? handleSelectTransaction : null}
                      isSelected={selectedTransactions.has(transaction.id)}
                      animationDelay={index * 50}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <h3>Nenhuma transação encontrada</h3>
              <p>Comece adicionando sua primeira transação ou ajuste os filtros</p>
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

      {/* Modal de Detalhes */}
      {viewDetailsTransaction && (
        <div className="detail-modal-overlay" onClick={handleCloseDetails}>
          <div className="detail-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="detail-modal-header">
              <h2>Detalhes da Transação</h2>
              <button className="detail-modal-close" onClick={handleCloseDetails}>
                <X size={24} />
              </button>
            </div>
            <TransactionDetailCard
              transaction={viewDetailsTransaction}
              category={categories.find(c => c.id === viewDetailsTransaction.categoryId)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;

