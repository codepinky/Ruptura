import React, { useState, useMemo } from 'react';
import { useFinancial } from '../../../context/FinancialContext';
import GoalForm from '../../../components/Goals/GoalForm/GoalForm';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Target,
  TrendingUp,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Settings,
  PieChart,
  PlusCircle,
  X
} from 'lucide-react';
import './Goals.css';

const Goals = () => {
  const { 
    goals, 
    addGoal, 
    updateGoal, 
    deleteGoal,
    getGoalsProgress,
    updateGoalProgress
  } = useFinancial();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [addingMoneyToGoal, setAddingMoneyToGoal] = useState(null);
  const [amountToAdd, setAmountToAdd] = useState('');

  // Calcular progresso das metas
  const goalsProgress = useMemo(() => getGoalsProgress(), [getGoalsProgress]);

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

  // Mapear prioridades
  const priorityLabels = {
    high: 'Alta',
    medium: 'Média',
    low: 'Baixa'
  };

  // Calcular estatísticas
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

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
      totalGoals,
      totalTarget,
      totalCurrent,
      achieved,
      overdue
    };
  }, [goals, goalsProgress]);

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

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(g => 
        g.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por tipo
    if (selectedType !== 'all') {
      filtered = filtered.filter(g => g.type === selectedType);
    }

    // Filtro por prioridade
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(g => g.priority === selectedPriority);
    }

    // Filtro por status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(g => {
        const status = getGoalStatus(g);
        return status === selectedStatus;
      });
    }

    return filtered;
  }, [goalsProgress, searchTerm, selectedType, selectedPriority, selectedStatus]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleCreateGoal = (goalData) => {
    addGoal(goalData);
    setShowCreateForm(false);
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
    <div className="goals-page">
      <div className="goals-header">
        <div className="header-content">
          <h1 className="page-title">Metas Financeiras</h1>
          <p className="page-subtitle">
            Defina e acompanhe seus objetivos financeiros
          </p>
        </div>
      </div>

      <div className="goals-controls">
        <div className="controls-section controls-search">
          <div className="search-wrapper">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar metas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
            onClick={() => setShowCreateForm(true)}
          >
            <Plus size={18} />
            <span>Nova Meta</span>
          </button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="goals-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <Target size={20} />
          </div>
          <div className="stat-content">
            <h3>{stats.totalGoals}</h3>
            <p>Total de Metas</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon income">
            <DollarSign size={20} />
          </div>
          <div className="stat-content">
            <h3>{formatCurrency(stats.totalTarget)}</h3>
            <p>Valor Total das Metas</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp size={20} />
          </div>
          <div className="stat-content">
            <h3>{formatCurrency(stats.totalCurrent)}</h3>
            <p>Valor Já Poupado</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon success">
            <CheckCircle size={20} />
          </div>
          <div className="stat-content">
            <h3>{stats.achieved}</h3>
            <p>Metas Alcançadas</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon warning">
            <AlertCircle size={20} />
          </div>
          <div className="stat-content">
            <h3>{stats.overdue}</h3>
            <p>Metas Vencidas</p>
          </div>
        </div>
      </div>

      {/* Listagem de Metas */}
      <div className="goals-content">
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
              <div className="empty-state">
                <Target size={64} />
                <h3>Nenhuma meta encontrada</h3>
                <p>
                  {goals.length === 0 
                    ? 'Comece criando sua primeira meta financeira!'
                    : 'Tente ajustar os filtros para encontrar suas metas.'
                  }
                </p>
                {goals.length === 0 && (
                  <button 
                    className="add-goal-button"
                    onClick={() => setShowCreateForm(true)}
                  >
                    <Plus size={18} />
                    Criar Primeira Meta
                  </button>
                )}
              </div>
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
              <div className="empty-state">
                <Target size={64} />
                <h3>Nenhuma meta encontrada</h3>
                <p>
                  {goals.length === 0 
                    ? 'Comece criando sua primeira meta financeira!'
                    : 'Tente ajustar os filtros para encontrar suas metas.'
                  }
                </p>
                {goals.length === 0 && (
                  <button 
                    className="add-goal-button"
                    onClick={() => setShowCreateForm(true)}
                  >
                    <Plus size={18} />
                    Criar Primeira Meta
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Formulário de criação de meta */}
      <GoalForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={handleSubmitGoal}
      />

      {/* Formulário de edição de meta */}
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

export default Goals;
