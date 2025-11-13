import React, { useState, useMemo } from 'react';
import { useFinancial, TRANSACTION_TYPES } from '../../../context/FinancialContext';
import BudgetForm from '../../../components/Forms/BudgetForm/BudgetForm';
import GoalForm from '../../../components/Goals/GoalForm/GoalForm';
import BudgetCard from '../../../components/Cards/BudgetCard/BudgetCard';
import FloatingButton from '../../../components/FloatingButton/FloatingButton';
import { 
  Plus, 
  Search, 
  Filter,
  Wallet,
  Target,
  TrendingUp,
  DollarSign,
  Edit3,
  Trash2,
  Calendar,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Settings,
  PlusCircle,
  X,
  Copy
} from 'lucide-react';
import './Planning.css';

// Hook customizado para análise de orçamentos
const useBudgetAnalysis = (budgets, categories, transactions, TRANSACTION_TYPES) => {
  return useMemo(() => {
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

// Hook customizado para filtros de orçamentos
const useBudgetFilters = (budgetAnalysis, searchTerm, filterStatus) => {
  return useMemo(() => {
    let filtered = budgetAnalysis;

    if (searchTerm && searchTerm.trim()) {
      filtered = filtered.filter(b => {
        const budgetName = b.name || '';
        const categoryName = b.category?.name || '';
        const searchLower = searchTerm.toLowerCase().trim();
        return budgetName.toLowerCase().includes(searchLower) || 
               categoryName.toLowerCase().includes(searchLower);
      });
    }

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
  }).format(value || 0);
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

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

// Componente: Empty State para Orçamentos
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

// Componente: Empty State para Metas
const GoalEmptyState = ({ onCreate, message = "Nenhuma meta encontrada", description = "Comece criando sua primeira meta financeira!" }) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Target size={48} />
      </div>
      <h3>{message}</h3>
      <p>{description}</p>
      <button className="empty-state-btn" onClick={onCreate}>
        <Plus size={18} />
        <span>Criar Meta</span>
      </button>
    </div>
  );
};

// Componente Principal
const Planning = () => {
  const { 
    budgets, 
    categories, 
    transactions, 
    goals,
    addBudget, 
    updateBudget, 
    deleteBudget,
    addGoal,
    updateGoal,
    deleteGoal,
    getGoalsProgress,
    TRANSACTION_TYPES 
  } = useFinancial();

  const [activeTab, setActiveTab] = useState('budgets'); // 'budgets' ou 'goals'
  
  // Estados para Orçamentos
  const [budgetSearchTerm, setBudgetSearchTerm] = useState('');
  const [budgetFilterStatus, setBudgetFilterStatus] = useState('all');
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  // Estados para Metas
  const [goalSearchTerm, setGoalSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [addingMoneyToGoal, setAddingMoneyToGoal] = useState(null);
  const [amountToAdd, setAmountToAdd] = useState('');

  // Análises e filtros
  const budgetAnalysis = useBudgetAnalysis(budgets, categories, transactions, TRANSACTION_TYPES);
  const filteredBudgets = useBudgetFilters(budgetAnalysis, budgetSearchTerm, budgetFilterStatus);
  const goalsProgress = useMemo(() => getGoalsProgress(), [goals]);

  // Mapear tipos de meta
  const goalTypeLabels = {
    emergency: 'Reserva de Emergência',
    vacation: 'Viagem/Férias',
    education: 'Educação',
    home: 'Casa/Imóvel',
    car: 'Veículo',
    investment: 'Investimento',
    other: 'Outros'
  };

  const priorityLabels = {
    high: 'Alta',
    medium: 'Média',
    low: 'Baixa'
  };

  // Determinar status da meta
  const getGoalStatus = (goal) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(goal.deadline);
    deadline.setHours(0, 0, 0, 0);

    if (goal.progress >= 100) {
      return 'achieved';
    } else if (deadline < today) {
      return 'overdue';
    } else {
      return 'in-progress';
    }
  };

  // Filtrar metas
  const filteredGoals = useMemo(() => {
    let filtered = goalsProgress;

    if (goalSearchTerm) {
      filtered = filtered.filter(g => 
        g.name.toLowerCase().includes(goalSearchTerm.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(g => g.type === selectedType);
    }

    if (selectedPriority !== 'all') {
      filtered = filtered.filter(g => g.priority === selectedPriority);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(g => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const deadline = new Date(g.deadline);
        deadline.setHours(0, 0, 0, 0);

        let status;
        if (g.progress >= 100) {
          status = 'achieved';
        } else if (deadline < today) {
          status = 'overdue';
        } else {
          status = 'in-progress';
        }
        return status === selectedStatus;
      });
    }

    return filtered;
  }, [goalsProgress, goalSearchTerm, selectedType, selectedPriority, selectedStatus]);

  // Calcular estatísticas gerais
  const overallStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Estatísticas de orçamentos
    const totalBudgets = budgets.length;
    const totalBudgetLimit = budgets.reduce((sum, b) => sum + (b.limit || 0), 0);
    const totalBudgetSpent = budgetAnalysis.reduce((sum, b) => sum + (b.spent || 0), 0);
    const exceededBudgets = budgetAnalysis.filter(b => b.isExceeded).length;

    // Estatísticas de metas
    const totalGoals = goals.length;
    const totalTarget = goals.reduce((sum, g) => sum + (g.targetAmount || 0), 0);
    const totalCurrent = goals.reduce((sum, g) => sum + (g.currentAmount || 0), 0);
    const achieved = goalsProgress.filter(g => g.progress >= 100).length;
    const overdue = goalsProgress.filter(g => {
      const deadline = new Date(g.deadline);
      deadline.setHours(0, 0, 0, 0);
      return deadline < today && g.progress < 100;
    }).length;

    return {
      budgets: {
        total: totalBudgets,
        totalLimit: totalBudgetLimit,
        totalSpent: totalBudgetSpent,
        exceeded: exceededBudgets
      },
      goals: {
        total: totalGoals,
        totalTarget,
        totalCurrent,
        achieved,
        overdue
      }
    };
  }, [budgets, budgetAnalysis, goals, goalsProgress]);

  // Handlers para Orçamentos
  const handleCreateBudget = (budgetData) => {
    addBudget(budgetData);
    setShowBudgetForm(false);
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

  const handleDuplicateBudget = (budget) => {
    // Remover propriedades calculadas antes de adicionar
    const { category, spent, percentage, status, isExceeded, isWarning, remaining, startDate, endDate, ...budgetData } = budget;
    const duplicatedBudget = {
      ...budgetData,
      id: Date.now(),
      name: budget.name ? `${budget.name} (Cópia)` : undefined
    };
    addBudget(duplicatedBudget);
  };

  // Handlers para Metas
  const handleCreateGoal = (goalData) => {
    addGoal(goalData);
    setShowGoalForm(false);
  };

  const handleUpdateGoal = (goalData) => {
    updateGoal({ ...goalData, id: editingGoal.id });
    setEditingGoal(null);
  };

  const handleDeleteGoal = (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta meta?')) {
      deleteGoal(id);
    }
  };

  const handleAddMoney = () => {
    if (!amountToAdd || parseFloat(amountToAdd) <= 0) {
      alert('Por favor, insira um valor válido maior que zero.');
      return;
    }

    const goal = addingMoneyToGoal;
    const newAmount = (goal.currentAmount || 0) + parseFloat(amountToAdd);
    updateGoal({ ...goal, currentAmount: newAmount });
    setAddingMoneyToGoal(null);
    setAmountToAdd('');
  };

  const handleSubmitGoal = (goalData) => {
    if (editingGoal) {
      handleUpdateGoal(goalData);
    } else {
      handleCreateGoal(goalData);
    }
  };

  return (
    <div className="planning-page">
      {/* Header */}
      <div className="planning-header">
        <div className="header-content">
          <h1 className="page-title">Planejamento Financeiro</h1>
          <p className="page-subtitle">
            Gerencie seus orçamentos e metas financeiras em um só lugar
          </p>
        </div>
      </div>

      {/* Dashboard de Estatísticas Gerais */}
      <div className="planning-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <Wallet size={20} />
          </div>
          <div className="stat-content">
            <h3>{overallStats.budgets.total}</h3>
            <p>Orçamentos Ativos</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon income">
            <DollarSign size={20} />
          </div>
          <div className="stat-content">
            <h3>{formatCurrency(overallStats.budgets.totalLimit)}</h3>
            <p>Total Orçado</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon warning">
            <AlertCircle size={20} />
          </div>
          <div className="stat-content">
            <h3>{formatCurrency(overallStats.budgets.totalSpent)}</h3>
            <p>Total Gasto</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <Target size={20} />
          </div>
          <div className="stat-content">
            <h3>{overallStats.goals.total}</h3>
            <p>Metas Ativas</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon income">
            <TrendingUp size={20} />
          </div>
          <div className="stat-content">
            <h3>{formatCurrency(overallStats.goals.totalCurrent)}</h3>
            <p>Total Poupa do</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon success">
            <CheckCircle size={20} />
          </div>
          <div className="stat-content">
            <h3>{overallStats.goals.achieved}</h3>
            <p>Metas Alcançadas</p>
          </div>
        </div>
      </div>

      {/* Sistema de Abas */}
      <div className="planning-tabs-container">
        <div className="planning-tabs">
          <button
            className={`tab-button ${activeTab === 'budgets' ? 'active' : ''}`}
            onClick={() => setActiveTab('budgets')}
          >
            <Wallet size={18} />
            <span>Orçamentos</span>
          </button>
          <button
            className={`tab-button ${activeTab === 'goals' ? 'active' : ''}`}
            onClick={() => setActiveTab('goals')}
          >
            <Target size={18} />
            <span>Metas</span>
          </button>
        </div>
      </div>

      {/* Conteúdo das Abas */}
      <div className="planning-content">
        {/* Aba Orçamentos */}
        {activeTab === 'budgets' && (
          <div className="tab-content budgets-tab">
            <div className="tab-controls">
              <div className="search-box">
                <Search className="search-icon" />
                <input
                  type="text"
                  placeholder="Buscar por projeto ou categoria..."
                  value={budgetSearchTerm}
                  onChange={(e) => setBudgetSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="filter-box">
                <Filter className="filter-icon" />
                <select 
                  value={budgetFilterStatus} 
                  onChange={(e) => setBudgetFilterStatus(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">Todos os status</option>
                  <option value="good">Dentro do limite</option>
                  <option value="warning">Atenção (80-100%)</option>
                  <option value="exceeded">Excedido</option>
                </select>
              </div>

              <button 
                className="create-btn"
                onClick={() => setShowBudgetForm(true)}
              >
                <Plus size={18} />
                <span>Novo Orçamento</span>
              </button>
            </div>

            <div className="tab-content-area">
              {filteredBudgets.length > 0 ? (
                <div className="budgets-grid">
                  {filteredBudgets.map(budget => (
                    <BudgetCard
                      key={budget.id}
                      budget={budget}
                      category={budget.category}
                      spent={budget.spent}
                      onEdit={setEditingBudget}
                      onDelete={handleDeleteBudget}
                      onDuplicate={handleDuplicateBudget}
                    />
                  ))}
                </div>
              ) : (
                <BudgetEmptyState 
                  onCreate={() => setShowBudgetForm(true)}
                  message="Nenhum orçamento encontrado"
                  description={
                    budgetSearchTerm || budgetFilterStatus !== 'all'
                      ? 'Tente ajustar os filtros ou crie um novo orçamento'
                      : 'Crie seu primeiro orçamento para começar a controlar seus gastos'
                  }
                />
              )}
            </div>
          </div>
        )}

        {/* Aba Metas */}
        {activeTab === 'goals' && (
          <div className="tab-content goals-tab">
            <div className="tab-controls">
              <div className="controls-section controls-search">
                <div className="search-wrapper">
                  <Search size={20} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Buscar metas..."
                    value={goalSearchTerm}
                    onChange={(e) => setGoalSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>

              <div className="controls-section controls-filter">
                <select 
                  value={selectedType} 
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">Todos os tipos</option>
                  <option value="emergency">Reserva de Emergência</option>
                  <option value="vacation">Viagem/Férias</option>
                  <option value="education">Educação</option>
                  <option value="home">Casa/Imóvel</option>
                  <option value="car">Veículo</option>
                  <option value="investment">Investimento</option>
                  <option value="other">Outros</option>
                </select>
              </div>

              <div className="controls-section controls-filter">
                <select 
                  value={selectedPriority} 
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">Todas as prioridades</option>
                  <option value="high">Alta</option>
                  <option value="medium">Média</option>
                  <option value="low">Baixa</option>
                </select>
              </div>

              <div className="controls-section controls-filter">
                <select 
                  value={selectedStatus} 
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">Todos os status</option>
                  <option value="in-progress">Em andamento</option>
                  <option value="achieved">Alcançadas</option>
                  <option value="overdue">Vencidas</option>
                </select>
              </div>

              <div className="controls-section controls-view">
                <div className="view-toggle">
                  <button 
                    className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                    title="Visualização em grade"
                  >
                    <BarChart3 size={18} />
                  </button>
                  <button 
                    className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                    title="Visualização em lista"
                  >
                    <Settings size={18} />
                  </button>
                </div>
              </div>

              <div className="controls-section controls-action">
                <button 
                  type="button"
                  className="create-btn"
                  onClick={() => setShowGoalForm(true)}
                >
                  <Plus size={18} />
                  <span>Nova Meta</span>
                </button>
              </div>
            </div>

            <div className="tab-content-area">
              {viewMode === 'grid' && (
                <div className="goals-grid">
                  {filteredGoals.length > 0 ? (
                    filteredGoals.map((goal) => {
                      const status = getGoalStatus(goal);
                      return (
                        <div key={goal.id} className={`goal-card ${status}`}>
                          <div className="goal-header">
                            <div className="goal-title-section">
                              <h3 className="goal-name">{goal.name}</h3>
                              <div className="goal-badges">
                                <span className={`badge type ${goal.type}`}>
                                  {goalTypeLabels[goal.type] || goal.type}
                                </span>
                                <span className={`badge priority ${goal.priority}`}>
                                  {priorityLabels[goal.priority] || goal.priority}
                                </span>
                                {status === 'achieved' && (
                                  <span className="badge status achieved">
                                    Alcançada
                                  </span>
                                )}
                                {status === 'overdue' && (
                                  <span className="badge status overdue">
                                    Vencida
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="goal-actions">
                              <button 
                                className="action-btn edit"
                                onClick={() => setEditingGoal(goal)}
                              >
                                <Edit3 size={16} />
                              </button>
                              <button 
                                className="action-btn delete"
                                onClick={() => handleDeleteGoal(goal.id)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                          
                          <div className="goal-progress">
                            <div className="progress-info">
                              <span className="current">{formatCurrency(goal.currentAmount)}</span>
                              <span className="separator">/</span>
                              <span className="target">{formatCurrency(goal.targetAmount)}</span>
                            </div>
                            <div className="progress-bar-container">
                              <div className="progress-bar">
                                <div 
                                  className={`progress-fill ${status}`}
                                  style={{ width: `${Math.min(goal.progress, 100)}%` }}
                                />
                              </div>
                              <span className="progress-percentage">
                                {goal.progress.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                          
                          <div className="goal-details">
                            <div className="detail-item">
                              <Calendar size={14} />
                              <span>Prazo: {formatDate(goal.deadline)}</span>
                            </div>
                            <div className="detail-item">
                              <Target size={14} />
                              <span>
                                {goal.daysRemaining > 0 
                                  ? `${goal.daysRemaining} dias restantes`
                                  : goal.progress >= 100
                                  ? 'Meta alcançada!'
                                  : 'Prazo vencido'
                                }
                              </span>
                            </div>
                            <div className="detail-item remaining">
                              <DollarSign size={14} />
                              <span>Faltam: {formatCurrency(goal.remaining)}</span>
                            </div>
                          </div>

                          {goal.description && (
                            <div className="goal-description">
                              <p>{goal.description}</p>
                            </div>
                          )}

                          <div className="goal-add-money">
                            <button 
                              className="add-money-btn"
                              onClick={() => setAddingMoneyToGoal(goal)}
                              disabled={goal.progress >= 100}
                            >
                              <PlusCircle size={18} />
                              <span>Adicionar Valor</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <GoalEmptyState 
                      onCreate={() => setShowGoalForm(true)}
                      message="Nenhuma meta encontrada"
                      description={
                        goals.length === 0 
                          ? 'Comece criando sua primeira meta financeira!'
                          : 'Tente ajustar os filtros para encontrar suas metas.'
                      }
                    />
                  )}
                </div>
              )}

              {viewMode === 'list' && (
                <div className="goals-list">
                  <div className="list-header">
                    <div className="header-cell">Meta</div>
                    <div className="header-cell">Tipo</div>
                    <div className="header-cell">Prioridade</div>
                    <div className="header-cell">Progresso</div>
                    <div className="header-cell">Prazo</div>
                    <div className="header-cell">Status</div>
                    <div className="header-cell">Ações</div>
                  </div>
                  
                  {filteredGoals.length > 0 ? (
                    filteredGoals.map((goal) => {
                      const status = getGoalStatus(goal);
                      return (
                        <div key={goal.id} className={`list-row ${status}`}>
                          <div className="list-cell goal-cell">
                            <div className="goal-cell-content">
                              <h4>{goal.name}</h4>
                              <span className="goal-amounts">
                                {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                              </span>
                            </div>
                          </div>
                          <div className="list-cell">
                            <span className="type-badge">{goalTypeLabels[goal.type] || goal.type}</span>
                          </div>
                          <div className="list-cell">
                            <span className={`priority-badge ${goal.priority}`}>
                              {priorityLabels[goal.priority] || goal.priority}
                            </span>
                          </div>
                          <div className="list-cell">
                            <div className="progress-cell">
                              <div className="progress-bar-small">
                                <div 
                                  className={`progress-fill-small ${status}`}
                                  style={{ width: `${Math.min(goal.progress, 100)}%` }}
                                />
                              </div>
                              <span className="progress-text-small">{goal.progress.toFixed(1)}%</span>
                            </div>
                          </div>
                          <div className="list-cell">{formatDate(goal.deadline)}</div>
                          <div className="list-cell">
                            <span className={`status-badge ${status}`}>
                              {status === 'achieved' ? 'Alcançada' : 
                               status === 'overdue' ? 'Vencida' : 'Em andamento'}
                            </span>
                          </div>
                          <div className="list-cell">
                            <div className="action-buttons">
                              <button 
                                className="action-btn edit"
                                onClick={() => setEditingGoal(goal)}
                              >
                                <Edit3 size={16} />
                              </button>
                              <button 
                                className="action-btn delete"
                                onClick={() => handleDeleteGoal(goal.id)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <GoalEmptyState 
                      onCreate={() => setShowGoalForm(true)}
                      message="Nenhuma meta encontrada"
                      description={
                        goals.length === 0 
                          ? 'Comece criando sua primeira meta financeira!'
                          : 'Tente ajustar os filtros para encontrar suas metas.'
                      }
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Botão Flutuante (Mobile) */}
      <FloatingButton 
        onClick={() => activeTab === 'budgets' ? setShowBudgetForm(true) : setShowGoalForm(true)}
        title={activeTab === 'budgets' ? 'Novo Orçamento' : 'Nova Meta'}
      />

      {/* Modais de Orçamentos */}
      <BudgetForm
        isOpen={showBudgetForm}
        onClose={() => setShowBudgetForm(false)}
        onSubmit={handleCreateBudget}
      />

      <BudgetForm
        isOpen={!!editingBudget}
        onClose={() => setEditingBudget(null)}
        onSubmit={handleUpdateBudget}
        budget={editingBudget}
      />

      {/* Modais de Metas */}
      <GoalForm
        isOpen={showGoalForm}
        onClose={() => setShowGoalForm(false)}
        onSubmit={handleSubmitGoal}
      />

      <GoalForm
        isOpen={!!editingGoal}
        onClose={() => setEditingGoal(null)}
        goal={editingGoal}
        onSubmit={handleSubmitGoal}
      />

      {/* Modal para adicionar dinheiro */}
      {addingMoneyToGoal && (
        <div className="add-money-modal-overlay" onClick={() => {
          setAddingMoneyToGoal(null);
          setAmountToAdd('');
        }}>
          <div className="add-money-modal" onClick={(e) => e.stopPropagation()}>
            <div className="add-money-header">
              <h3>Adicionar Valor à Meta</h3>
              <button 
                className="close-modal-btn"
                onClick={() => {
                  setAddingMoneyToGoal(null);
                  setAmountToAdd('');
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="add-money-content">
              <div className="goal-info">
                <h4>{addingMoneyToGoal.name}</h4>
                <p className="goal-amounts">
                  {formatCurrency(addingMoneyToGoal.currentAmount)} / {formatCurrency(addingMoneyToGoal.targetAmount)}
                </p>
              </div>
              <div className="add-money-input-group">
                <label htmlFor="amount">Valor a adicionar (R$)</label>
                <input
                  type="number"
                  id="amount"
                  value={amountToAdd}
                  onChange={(e) => setAmountToAdd(e.target.value)}
                  placeholder="0,00"
                  step="0.01"
                  min="0"
                  autoFocus
                />
              </div>
              <div className="add-money-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => {
                    setAddingMoneyToGoal(null);
                    setAmountToAdd('');
                  }}
                >
                  Cancelar
                </button>
                <button 
                  className="confirm-btn"
                  onClick={handleAddMoney}
                >
                  <PlusCircle size={18} />
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Planning;

