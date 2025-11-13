import React, { useState, useMemo } from 'react';
import { useFinancial, TRANSACTION_TYPES } from '../../../context/FinancialContext';
import BudgetForm from '../../../components/Forms/BudgetForm/BudgetForm';
import FloatingButton from '../../../components/FloatingButton/FloatingButton';
import { 
  Plus, 
  Search, 
  Filter,
  Wallet,
  Edit3,
  Trash2
} from 'lucide-react';
import './Budgets.css';

// Hook customizado para análise de orçamentos
const useBudgetAnalysis = (budgets, categories, transactions, TRANSACTION_TYPES) => {
  return useMemo(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    return budgets.map(budget => {
      const category = categories.find(c => c.id === budget.categoryId);
      let spent = 0;
      let budgetTransactions = [];

      // Determinar período do orçamento
      let startDate, endDate;
      
      if (budget.period === 'monthly') {
        startDate = new Date(budget.year, budget.month, 1);
        endDate = new Date(budget.year, budget.month + 1, 0);
        endDate.setHours(23, 59, 59, 999);
      } else if (budget.period === 'yearly') {
        startDate = new Date(budget.year, 0, 1);
        endDate = new Date(budget.year, 11, 31);
        endDate.setHours(23, 59, 59, 999);
      } else if (budget.period === 'custom') {
        startDate = new Date(budget.startDate);
        endDate = new Date(budget.endDate);
        endDate.setHours(23, 59, 59, 999);
      }

      // Filtrar transações do período e categoria
      budgetTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return (
          t.categoryId === budget.categoryId &&
          t.type === TRANSACTION_TYPES.EXPENSE &&
          transactionDate >= startDate &&
          transactionDate <= endDate
        );
      });

      // Calcular total gasto
      spent = budgetTransactions.reduce((sum, t) => sum + t.amount, 0);

      // Calcular porcentagem e status
      const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
      const isExceeded = percentage > 100;
      const isWarning = percentage >= 80 && percentage <= 100;
      const status = isExceeded ? 'exceeded' : isWarning ? 'warning' : 'good';
      const remaining = Math.max(0, budget.limit - spent);

      return {
        ...budget,
        category,
        spent,
        percentage,
        status,
        isExceeded,
        isWarning,
        remaining,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      };
    });
  }, [budgets, categories, transactions, TRANSACTION_TYPES]);
};

// Hook customizado para filtros
const useBudgetFilters = (budgetAnalysis, searchTerm, filterStatus) => {
  return useMemo(() => {
    let filtered = budgetAnalysis;

    // Filtro por busca
    if (searchTerm && searchTerm.trim()) {
      filtered = filtered.filter(b => {
        const budgetName = b.name || '';
        const categoryName = b.category?.name || '';
        const searchLower = searchTerm.toLowerCase().trim();
        return budgetName.toLowerCase().includes(searchLower) || 
               categoryName.toLowerCase().includes(searchLower);
      });
    }

    // Filtro por status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(b => b.status === filterStatus);
    }

    return filtered;
  }, [budgetAnalysis, searchTerm, filterStatus]);
};

// Funções utilitárias
const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

const formatPeriod = (budget) => {
  if (budget.period === 'monthly' && budget.month !== undefined && budget.year !== undefined) {
    const date = new Date(budget.year, budget.month);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }
  if (budget.period === 'yearly' && budget.year !== undefined) {
    return budget.year.toString();
  }
  if (budget.period === 'custom' && budget.startDate && budget.endDate) {
    const start = new Date(budget.startDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    const end = new Date(budget.endDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return `${start} - ${end}`;
  }
  return '';
};

// Componente: Item de Orçamento Simples
const SimpleBudgetItem = ({ budget, onEdit, onDelete }) => {
  const getStatusColor = () => {
    if (budget.isExceeded) return '#EF4444';
    if (budget.isWarning) return '#F59E0B';
    return '#10B981';
  };

  const getStatusText = () => {
    if (budget.isExceeded) return 'Excedido';
    if (budget.isWarning) return 'Atenção';
    return 'OK';
  };

  const statusColor = getStatusColor();
  const statusText = getStatusText();

  return (
    <div className="simple-budget-item">
      <div 
        className="simple-budget-color" 
        style={{ backgroundColor: budget.category?.color || '#64748B' }} 
      />
      <div className="simple-budget-info">
        <div className="simple-budget-header">
          <div className="simple-budget-name">
            {budget.name || budget.category?.name || 'Sem nome'}
          </div>
          <span className={`simple-budget-status ${budget.status}`} style={{ color: statusColor }}>
            {statusText}
          </span>
        </div>
        <div className="simple-budget-meta">
          {budget.name && budget.category && (
            <span className="simple-budget-category">{budget.category.name}</span>
          )}
          <span className="simple-budget-period">{formatPeriod(budget)}</span>
        </div>
        <div className="simple-budget-values">
          <div className="budget-value-item">
            <span className="budget-value-label">Orçado</span>
            <span className="budget-value-amount">{formatCurrency(budget.limit)}</span>
          </div>
          <div className="budget-value-item">
            <span className="budget-value-label">Gasto</span>
            <span className={`budget-value-amount ${budget.isExceeded ? 'exceeded' : ''}`}>
              {formatCurrency(budget.spent)}
            </span>
          </div>
          <div className="budget-value-item">
            <span className="budget-value-label">Restante</span>
            <span className={`budget-value-amount ${budget.remaining > 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(budget.remaining)}
            </span>
          </div>
        </div>
        <div className="simple-budget-progress">
          <div className="budget-progress-header">
            <span className="budget-progress-label">Progresso</span>
            <span className="budget-progress-percentage" style={{ color: statusColor }}>
              {budget.percentage.toFixed(1)}%
            </span>
          </div>
          <div className="budget-progress-bar-container">
            <div 
              className="budget-progress-bar"
              style={{ 
                width: `${Math.min(100, budget.percentage)}%`,
                backgroundColor: statusColor
              }}
            />
          </div>
        </div>
      </div>
      <div className="simple-budget-actions">
        <button 
          className="budget-action-btn edit"
          onClick={() => onEdit(budget)}
          title="Editar orçamento"
        >
          <Edit3 size={18} />
        </button>
        <button 
          className="budget-action-btn delete"
          onClick={() => onDelete(budget.id)}
          title="Excluir orçamento"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

// Componente: Empty State
const BudgetEmptyState = ({ onCreate, message = "Nenhum orçamento encontrado", description = "Crie seu primeiro orçamento para começar a controlar seus gastos" }) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Wallet size={48} />
      </div>
      <h3>{message}</h3>
      <p>{description}</p>
      <button className="empty-state-btn" onClick={onCreate}>
        <Plus size={18} />
        <span>Criar Orçamento</span>
      </button>
    </div>
  );
};

// Componente Principal
const Budgets = () => {
  const { 
    budgets, 
    categories, 
    transactions, 
    addBudget, 
    updateBudget, 
    deleteBudget,
    TRANSACTION_TYPES 
  } = useFinancial();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  const budgetAnalysis = useBudgetAnalysis(budgets, categories, transactions, TRANSACTION_TYPES);
  const filteredBudgets = useBudgetFilters(budgetAnalysis, searchTerm, filterStatus);

  const handleCreateBudget = (budgetData) => {
    addBudget(budgetData);
    setShowCreateForm(false);
  };

  const handleUpdateBudget = (budgetData) => {
    updateBudget({ ...budgetData, id: editingBudget.id });
    setEditingBudget(null);
  };

  const handleDeleteBudget = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este orçamento?')) {
      deleteBudget(id);
    }
  };

  return (
    <div className="budgets-page">
      {/* Header Simplificado */}
      <div className="budgets-header">
        <div className="header-content">
          <h1 className="budgets-title">Orçamentos</h1>
          <p className="page-subtitle">
            Planeje projetos específicos (reformas, viagens) ou defina limites de gasto por categoria para manter suas finanças organizadas
          </p>
        </div>
      </div>

      {/* Container Principal */}
      <div className="budgets-container">
        {/* Barra de Busca e Filtros */}
        <div className="budgets-controls">
          <div className="search-box">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por projeto ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-box">
            <Filter className="filter-icon" />
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">Todos os status</option>
              <option value="good">Dentro do limite</option>
              <option value="warning">Atenção (80-100%)</option>
              <option value="exceeded">Excedido</option>
            </select>
          </div>
        </div>

        {/* Lista de Orçamentos */}
        <div className="budgets-content">
          <div className="budgets-list-container">
            {filteredBudgets.length > 0 ? (
              <div className="simple-budgets-list">
                {filteredBudgets.map(budget => (
                  <SimpleBudgetItem
                    key={budget.id}
                    budget={budget}
                    onEdit={setEditingBudget}
                    onDelete={handleDeleteBudget}
                  />
                ))}
              </div>
            ) : (
              <BudgetEmptyState 
                onCreate={() => setShowCreateForm(true)}
                message="Nenhum orçamento encontrado"
                description={
                  searchTerm || filterStatus !== 'all'
                    ? 'Tente ajustar os filtros ou crie um novo orçamento'
                    : 'Crie seu primeiro orçamento para começar a controlar seus gastos'
                }
              />
            )}
          </div>
        </div>
      </div>

      {/* Botão Flutuante (Mobile) */}
      <FloatingButton 
        onClick={() => setShowCreateForm(true)}
        title="Novo Orçamento"
      />

      {/* Modais */}
      <BudgetForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={handleCreateBudget}
      />

      <BudgetForm
        isOpen={!!editingBudget}
        onClose={() => setEditingBudget(null)}
        onSubmit={handleUpdateBudget}
        budget={editingBudget}
      />
    </div>
  );
};

export default Budgets;
