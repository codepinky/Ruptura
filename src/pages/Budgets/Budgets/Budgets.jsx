import React, { useState, useMemo } from 'react';
import { useFinancial, TRANSACTION_TYPES } from '../../../context/FinancialContext';
import BudgetForm from '../../../components/Forms/BudgetForm/BudgetForm';
import BudgetCard from '../../../components/Cards/BudgetCard/BudgetCard';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2,
  Grid3x3,
  List,
  BarChart3,
  Wallet,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Calendar
} from 'lucide-react';
import FloatingButton from '../../../components/FloatingButton/FloatingButton';
import './Budgets.css';

const Budgets = () => {
  const { 
    budgets, 
    categories, 
    transactions,
    addBudget, 
    updateBudget, 
    deleteBudget
  } = useFinancial();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('current');
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  // Calcular gastos e status para cada orçamento
  const budgetsWithData = useMemo(() => {
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

      return {
        ...budget,
        category,
        spent,
        percentage,
        status,
        isExceeded,
        isWarning,
        remaining: Math.max(0, budget.limit - spent),
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      };
    });
  }, [budgets, categories, transactions]);

  // Filtrar orçamentos
  const filteredBudgets = useMemo(() => {
    let filtered = [...budgetsWithData];

    // Filtro por busca
    if (searchTerm && searchTerm.trim()) {
      filtered = filtered.filter(b => {
        const categoryName = b.category?.name || '';
        return categoryName.toLowerCase().includes(searchTerm.toLowerCase().trim());
      });
    }

    // Filtro por status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(b => {
        return b.status === filterStatus;
      });
    }

    // Filtro por categoria
    if (filterCategory !== 'all') {
      const categoryId = Number(filterCategory);
      filtered = filtered.filter(b => {
        const budgetCategoryId = Number(b.categoryId);
        return budgetCategoryId === categoryId;
      });
    }

    // Filtro por período
    if (filterPeriod === 'current') {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      filtered = filtered.filter(b => {
        if (b.period === 'monthly') {
          const budgetMonth = Number(b.month);
          const budgetYear = Number(b.year);
          return budgetMonth === currentMonth && budgetYear === currentYear;
        }
        if (b.period === 'yearly') {
          const budgetYear = Number(b.year);
          return budgetYear === currentYear;
        }
        if (b.period === 'custom') {
          if (!b.startDate || !b.endDate) return false;
          const start = new Date(b.startDate);
          const end = new Date(b.endDate);
          const now = new Date();
          return now >= start && now <= end;
        }
        return false;
      });
    } else if (filterPeriod === 'previous') {
      const currentDate = new Date();
      const previousMonth = currentDate.getMonth() === 0 ? 11 : currentDate.getMonth() - 1;
      const previousYear = currentDate.getMonth() === 0 ? currentDate.getFullYear() - 1 : currentDate.getFullYear();
      
      filtered = filtered.filter(b => {
        if (b.period === 'monthly') {
          const budgetMonth = Number(b.month);
          const budgetYear = Number(b.year);
          return budgetMonth === previousMonth && budgetYear === previousYear;
        }
        return false;
      });
    }
    // Se filterPeriod === 'all', não filtra por período

    return filtered;
  }, [budgetsWithData, searchTerm, filterStatus, filterCategory, filterPeriod]);

  // Estatísticas
  const stats = useMemo(() => {
    const active = filteredBudgets.length;
    const totalBudgeted = filteredBudgets.reduce((sum, b) => sum + b.limit, 0);
    const totalSpent = filteredBudgets.reduce((sum, b) => sum + b.spent, 0);
    const exceeded = filteredBudgets.filter(b => b.isExceeded).length;
    const warning = filteredBudgets.filter(b => b.isWarning).length;

    return {
      active,
      totalBudgeted,
      totalSpent,
      exceeded,
      warning,
      remaining: totalBudgeted - totalSpent
    };
  }, [filteredBudgets]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const handleCreateBudget = (budgetData) => {
    addBudget(budgetData);
  };

  const handleUpdateBudget = (budgetData) => {
    updateBudget({ ...budgetData, id: editingBudget.id });
  };

  const handleDeleteBudget = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este orçamento?')) {
      deleteBudget(id);
    }
  };

  const handleDuplicateBudget = (budget) => {
    const newBudget = {
      categoryId: budget.categoryId,
      limit: budget.limit,
      period: budget.period,
      alertsEnabled: budget.alertsEnabled,
      notes: budget.notes || '',
      month: budget.month !== undefined ? (budget.month + 1) % 12 : undefined,
      year: budget.month !== undefined && budget.month === 11 ? budget.year + 1 : budget.year
    };
    
    if (budget.period === 'yearly') {
      newBudget.year = budget.year + 1;
    }
    
    if (budget.period === 'custom') {
      const startDate = new Date(budget.startDate);
      const endDate = new Date(budget.endDate);
      const diffTime = endDate - startDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const newStartDate = new Date(budget.endDate);
      newStartDate.setDate(newStartDate.getDate() + 1);
      const newEndDate = new Date(newStartDate);
      newEndDate.setDate(newEndDate.getDate() + diffDays);
      
      newBudget.startDate = newStartDate.toISOString().split('T')[0];
      newBudget.endDate = newEndDate.toISOString().split('T')[0];
    }
    
    addBudget(newBudget);
  };

  const expenseCategories = categories.filter(c => c.type === TRANSACTION_TYPES.EXPENSE);

  return (
    <div className="budgets-page">
      <div className="budgets-header">
        <div className="header-content">
          <h1 className="page-title">Orçamentos</h1>
          <p className="page-subtitle">Controle seus gastos por categoria e período</p>
        </div>
      </div>

      {/* FloatingButton */}
      <FloatingButton 
        onClick={() => setShowCreateForm(true)} 
        title="Adicionar novo orçamento"
      />

      {/* Cards de Estatísticas */}
      <div className="budgets-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#3B82F615' }}>
            <Wallet size={20} color="#3B82F6" />
          </div>
          <div className="stat-content">
            <h3>{stats.active}</h3>
            <p>Orçamentos Ativos</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#10B98115' }}>
            <TrendingUp size={20} color="#10B981" />
          </div>
          <div className="stat-content">
            <h3>{formatCurrency(stats.totalBudgeted)}</h3>
            <p>Total Orçado</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#EF444415' }}>
            <TrendingUp size={20} color="#EF4444" />
          </div>
          <div className="stat-content">
            <h3>{formatCurrency(stats.totalSpent)}</h3>
            <p>Total Gasto</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: `${stats.remaining >= 0 ? '#10B98115' : '#EF444415'}` }}>
            <CheckCircle size={20} color={stats.remaining >= 0 ? '#10B981' : '#EF4444'} />
          </div>
          <div className="stat-content">
            <h3>{formatCurrency(stats.remaining)}</h3>
            <p>Total Restante</p>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="budgets-controls">
        <div className="controls-section controls-search">
          <div className="search-wrapper">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar orçamentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="controls-section controls-filter">
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

        <div className="controls-section controls-filter">
          <select 
            value={filterPeriod} 
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="filter-select"
          >
            <option value="all">Todos</option>
            <option value="current">Este Mês</option>
            <option value="previous">Mês Anterior</option>
          </select>
        </div>

        <div className="controls-section controls-filter">
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="all">Todas as categorias</option>
            {expenseCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="controls-section controls-view">
          <div className="view-toggle">
            <button 
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Visualização em grade"
            >
              <Grid3x3 size={18} />
            </button>
            <button 
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="Visualização em lista"
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="budgets-content">
        {filteredBudgets.length > 0 ? (
          <>
            {viewMode === 'grid' ? (
              <div className="budgets-grid">
                {filteredBudgets.map(budget => (
                  <BudgetCard
                    key={budget.id}
                    budget={budget}
                    category={budget.category}
                    spent={budget.spent}
                    onEdit={(b) => setEditingBudget(b)}
                    onDelete={handleDeleteBudget}
                    onDuplicate={handleDuplicateBudget}
                  />
                ))}
              </div>
            ) : (
            <div className="budgets-list">
              <div className="list-header">
                <div className="header-cell">Categoria</div>
                <div className="header-cell">Período</div>
                <div className="header-cell">Orçado</div>
                <div className="header-cell">Gasto</div>
                <div className="header-cell">Restante</div>
                <div className="header-cell">Progresso</div>
                <div className="header-cell">Status</div>
                <div className="header-cell">Ações</div>
              </div>
              
              {filteredBudgets.map(budget => (
                <div key={budget.id} className="list-row">
                  <div className="list-cell category-cell">
                    <div 
                      className="category-color-indicator" 
                      style={{ backgroundColor: budget.category?.color || '#64748B' }}
                    />
                    <span>{budget.category?.name || 'Sem categoria'}</span>
                  </div>
                  <div className="list-cell">
                    {budget.period === 'monthly' && (
                      <span>{new Date(budget.year, budget.month).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
                    )}
                    {budget.period === 'yearly' && <span>{budget.year}</span>}
                    {budget.period === 'custom' && (
                      <span>{new Date(budget.startDate).toLocaleDateString('pt-BR')} - {new Date(budget.endDate).toLocaleDateString('pt-BR')}</span>
                    )}
                  </div>
                  <div className="list-cell">{formatCurrency(budget.limit)}</div>
                  <div className="list-cell">
                    <span className={`amount ${budget.isExceeded ? 'exceeded' : ''}`}>
                      {formatCurrency(budget.spent)}
                    </span>
                  </div>
                  <div className="list-cell">
                    <span className={`amount ${budget.remaining > 0 ? 'positive' : 'negative'}`}>
                      {formatCurrency(budget.remaining)}
                    </span>
                  </div>
                  <div className="list-cell">
                    <div className="progress-mini">
                      <div 
                        className="progress-bar-mini"
                        style={{ 
                          width: `${Math.min(100, budget.percentage)}%`,
                          backgroundColor: budget.isExceeded ? '#EF4444' : budget.isWarning ? '#F59E0B' : '#10B981'
                        }}
                      />
                      <span className="progress-percentage">{budget.percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="list-cell">
                    <span className={`status-badge ${budget.status}`}>
                      {budget.status === 'exceeded' ? 'Excedido' : budget.status === 'warning' ? 'Atenção' : 'OK'}
                    </span>
                  </div>
                  <div className="list-cell">
                    <div className="action-buttons">
                      <button 
                        className="action-btn edit"
                        onClick={() => setEditingBudget(budget)}
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        className="action-btn delete"
                        onClick={() => handleDeleteBudget(budget.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>Nenhum orçamento encontrado</h3>
            <p>
              {searchTerm || filterStatus !== 'all' || filterCategory !== 'all' || filterPeriod !== 'all' 
                ? 'Tente ajustar os filtros ou crie um novo orçamento'
                : 'Crie seu primeiro orçamento para começar a controlar seus gastos'}
            </p>
            <button 
              className="add-budget-button"
              onClick={() => setShowCreateForm(true)}
            >
              <Plus size={18} />
              <span>Criar Orçamento</span>
            </button>
          </div>
        )}
      </div>

      {/* Formulários */}
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

