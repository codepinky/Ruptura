import React, { useState, useMemo, useEffect } from 'react';
import { useFinancial, TRANSACTION_TYPES } from '../../../context/FinancialContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  PiggyBank, 
  Calendar,
  Filter,
  Download,
  Plus,
  PlusCircle,
  X,
  ChevronDown
} from 'lucide-react';
import TransactionForm from '../../../components/Forms/TransactionForm/TransactionForm';
import GoalForm from '../../../components/Goals/GoalForm/GoalForm';
import SavingForm from '../../../components/Savings/SavingForm/SavingForm';
import CategoryExpenseCard from '../../../components/Cards/CategoryExpenseCard/CategoryExpenseCard';
import CategoryAnalysisCard from '../../../components/Cards/CategoryAnalysisCard/CategoryAnalysisCard';
import FloatingButton from '../../../components/FloatingButton/FloatingButton';
import { exportToCSV, exportToPDF } from '../../../utils/exportUtils';
import './Spreadsheet.css';

const Spreadsheet = () => {
  const { 
    transactions, 
    categories, 
    savings,
    getTotalIncome, 
    getTotalExpense, 
    getBalance,
    getGoalsProgress,
    getTotalSavings,
    getMonthlySavings,
    addGoal,
    updateGoal,
    addSaving,
    updateSaving
  } = useFinancial();

  const [activeTab, setActiveTab] = useState('expenses');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
  const [isSavingFormOpen, setIsSavingFormOpen] = useState(false);
  const [addingMoneyToGoal, setAddingMoneyToGoal] = useState(null);
  const [addingMoneyToSaving, setAddingMoneyToSaving] = useState(null);
  const [amountToAdd, setAmountToAdd] = useState('');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

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

  // Dados filtrados por mês
  const monthlyData = useMemo(() => {
    const monthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
    });

    return {
      transactions: monthTransactions,
      income: getTotalIncome(monthTransactions),
      expense: getTotalExpense(monthTransactions),
      balance: getBalance(monthTransactions)
    };
  }, [transactions, selectedMonth, selectedYear, getTotalIncome, getTotalExpense, getBalance]);

  // Análise completa por categoria (receitas e despesas)
  const categoryAnalysis = useMemo(() => {
    const allTransactions = monthlyData.transactions;
    const categoryTotals = {};

    allTransactions.forEach(transaction => {
      const category = categories.find(c => c.id === transaction.categoryId);
      if (category) {
        if (!categoryTotals[category.name]) {
          categoryTotals[category.name] = {
            name: category.name,
            income: 0,
            expense: 0,
            total: 0,
            incomeCount: 0,
            expenseCount: 0,
            color: category.color,
            transactions: []
          };
        }
        
        if (transaction.type === TRANSACTION_TYPES.INCOME) {
          categoryTotals[category.name].income += transaction.amount;
          categoryTotals[category.name].incomeCount += 1;
        } else {
          categoryTotals[category.name].expense += transaction.amount;
          categoryTotals[category.name].expenseCount += 1;
        }
        
        categoryTotals[category.name].total = categoryTotals[category.name].income - categoryTotals[category.name].expense;
        categoryTotals[category.name].transactions.push(transaction);
      }
    });

    return Object.values(categoryTotals)
      .sort((a, b) => Math.abs(b.total) - Math.abs(a.total));
  }, [monthlyData.transactions, categories]);

  // Progresso das metas
  const goalsProgress = useMemo(() => getGoalsProgress(), [getGoalsProgress]);

  // Economias com progresso calculado
  const savingsProgress = useMemo(() => {
    return savings.map(saving => {
      const targetAmount = saving.targetAmount || saving.amount || 0;
      const currentAmount = saving.currentAmount || 0;
      const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
      const remaining = Math.max(0, targetAmount - currentAmount);
      
      return {
        ...saving,
        targetAmount,
        currentAmount,
        progress: Math.min(100, Math.max(0, progress)),
        remaining
      };
    });
  }, [savings]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

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

  // Handler para adicionar meta
  const handleSubmitGoal = (goalData) => {
    // Na página Spreadsheet, sempre adicionamos novas metas
    // O GoalForm já gera um ID único para novas metas
    addGoal(goalData);
  };

  // Handler para adicionar/atualizar economia
  const handleSubmitSaving = (savingData) => {
    // Na página Spreadsheet, sempre adicionamos novas economias
    // O SavingForm já gera um ID único para novas economias
    addSaving(savingData);
  };

  // Handler para adicionar dinheiro à economia
  const handleAddMoneyToSaving = () => {
    if (!amountToAdd || parseFloat(amountToAdd) <= 0) {
      alert('Por favor, insira um valor válido maior que zero.');
      return;
    }
    const saving = addingMoneyToSaving;
    const newAmount = (saving.currentAmount || 0) + parseFloat(amountToAdd);
    updateSaving({ ...saving, currentAmount: newAmount });
    setAddingMoneyToSaving(null);
    setAmountToAdd('');
  };

  // Handler para adicionar dinheiro à meta
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

  return (
    <div className="spreadsheet-page">
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">Planilha Financeira</h1>
          <p className="page-subtitle">
            Controle detalhado de gastos, metas e economias
          </p>
        </div>
      </div>

      {/* Filtros e Ações */}
      <div className="filters-toolbar">
        <div className="date-selectors">
          <label htmlFor="month-select" className="sr-only">Selecionar mês</label>
          <select 
            id="month-select"
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="date-select"
            aria-label="Selecionar mês"
          >
            {months.map((month, index) => (
              <option key={index} value={index}>{month}</option>
            ))}
          </select>
          
          <label htmlFor="year-select" className="sr-only">Selecionar ano</label>
          <select 
            id="year-select"
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="date-select"
            aria-label="Selecionar ano"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        
        <div className="toolbar-actions">
          <div className={`export-dropdown ${isExportMenuOpen ? 'active' : ''}`}>
            <button 
              className="action-button export-btn"
              onClick={(e) => {
                e.stopPropagation();
                setIsExportMenuOpen(!isExportMenuOpen);
              }}
              aria-label="Exportar dados"
              title="Exportar dados financeiros"
            >
              <Download size={20} />
              <span>Exportar</span>
              <ChevronDown size={14} />
            </button>
            {isExportMenuOpen && (
              <div className="export-menu">
                <button 
                  className="export-menu-item"
                  onClick={() => {
                    exportToCSV(monthlyData.transactions, categories);
                    setIsExportMenuOpen(false);
                  }}
                >
                  <span>Exportar CSV</span>
                </button>
                <button 
                  className="export-menu-item"
                  onClick={() => {
                    exportToPDF(monthlyData.transactions, categories);
                    setIsExportMenuOpen(false);
                  }}
                >
                  <span>Exportar PDF</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resumo Financeiro */}
      <div className="financial-summary">
        <div className="summary-card income">
          <div className="card-icon">
            <TrendingUp size={24} />
          </div>
          <div className="card-content">
            <h3>Receitas</h3>
            <p className="amount">{formatCurrency(monthlyData.income)}</p>
            <span className="period">{months[selectedMonth]} {selectedYear}</span>
          </div>
        </div>

        <div className="summary-card expense">
          <div className="card-icon">
            <TrendingDown size={24} />
          </div>
          <div className="card-content">
            <h3>Despesas</h3>
            <p className="amount">{formatCurrency(monthlyData.expense)}</p>
            <span className="period">{months[selectedMonth]} {selectedYear}</span>
          </div>
        </div>

        <div className="summary-card balance">
          <div className="card-icon">
            <PiggyBank size={24} />
          </div>
          <div className="card-content">
            <h3>Saldo</h3>
            <p className={`amount ${monthlyData.balance >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(monthlyData.balance)}
            </p>
            <span className="period">{months[selectedMonth]} {selectedYear}</span>
          </div>
        </div>

        <div className="summary-card savings">
          <div className="card-icon">
            <Target size={24} />
          </div>
          <div className="card-content">
            <h3>Economias</h3>
            <p className="amount">{formatCurrency(getTotalSavings())}</p>
            <span className="period">Total acumulado</span>
          </div>
        </div>
      </div>

      {/* Tabs de Navegação */}
      <div className="tabs-container">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'expenses' ? 'active' : ''}`}
            onClick={() => setActiveTab('expenses')}
          >
            <TrendingUp size={16} />
            Receitas e Despesas
          </button>
          <button 
            className={`tab ${activeTab === 'goals' ? 'active' : ''}`}
            onClick={() => setActiveTab('goals')}
          >
            <Target size={16} />
            Metas Financeiras
          </button>
          <button 
            className={`tab ${activeTab === 'savings' ? 'active' : ''}`}
            onClick={() => setActiveTab('savings')}
          >
            <PiggyBank size={16} />
            Economias
          </button>
        </div>
      </div>

      {/* Conteúdo das Tabs */}
      <div className="tab-content">
        {activeTab === 'expenses' && (
          <div className="expenses-tab">
            <div className="section-header">
              <div className="header-info">
                <h2>Receitas e Despesas por Categoria - {months[selectedMonth]} {selectedYear}</h2>
                <p>Receitas: {formatCurrency(monthlyData.income)} | Despesas: {formatCurrency(monthlyData.expense)}</p>
              </div>
            </div>
            
            <div className="expenses-grid">
              {categoryAnalysis.length > 0 ? (
                categoryAnalysis.map((category) => (
                  <CategoryAnalysisCard
                    key={category.name}
                    category={category}
                    totalIncome={monthlyData.income}
                    totalExpense={monthlyData.expense}
                  />
                ))
              ) : (
                <div className="no-expenses">
                  <h3>Nenhuma transação encontrada</h3>
                  <p>Adicione algumas transações para ver receitas e despesas por categoria</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="goals-tab">
            <div className="section-header">
              <h2>Metas Financeiras</h2>
              <button 
                className="add-goal-button"
                onClick={() => setIsGoalFormOpen(true)}
              >
                <Plus size={16} />
                Nova Meta
              </button>
            </div>
            
            <div className="goals-grid">
              {goalsProgress.map((goal) => {
                const isCompleted = goal.progress >= 100;
                const progressPercent = Math.min(Math.round(goal.progress), 100);
                return (
                  <div key={goal.id} className={`goal-card ${isCompleted ? 'completed' : ''}`}>
                    <div className="goal-header">
                      <div className="goal-title-section">
                        <h3>{goal.name}</h3>
                        <span className="goal-type">{goalTypeLabels[goal.type] || goal.type}</span>
                      </div>
                      <div className="goal-badges">
                        <span className={`priority ${goal.priority}`}>{priorityLabels[goal.priority] || goal.priority}</span>
                        {isCompleted && (
                          <span className="completed-badge">
                            <Target size={14} />
                            Concluída
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="goal-progress">
                      <div className="progress-info">
                        <div className="current">
                          <span>{formatCurrency(goal.currentAmount)}</span>
                        </div>
                        <div className="target">
                          <span>{formatCurrency(goal.targetAmount)}</span>
                        </div>
                      </div>
                      <p className={`progress-text ${isCompleted ? 'completed' : ''}`}>
                        {isCompleted ? (
                          <>
                            <Target size={14} />
                            <span>100% concluído - Meta alcançada!</span>
                          </>
                        ) : (
                          `${goal.progress.toFixed(1)}% concluído`
                        )}
                      </p>
                    </div>
                    
                    <div className="goal-details">
                      {!isCompleted && (
                        <p className="remaining">
                          Restam: {formatCurrency(goal.remaining)}
                        </p>
                      )}
                      <p className="deadline">
                        Prazo: {formatDate(goal.deadline)}
                      </p>
                      <p className={`days-remaining ${goal.daysRemaining <= 0 && !isCompleted ? 'overdue' : ''}`}>
                        {isCompleted ? (
                          'Meta alcançada com sucesso!'
                        ) : goal.daysRemaining > 0 ? (
                          `${goal.daysRemaining} dias restantes`
                        ) : (
                          'Prazo vencido'
                        )}
                      </p>
                    </div>
                    
                    {!isCompleted && (
                      <div className="goal-add-money">
                        <button 
                          className="add-money-btn"
                          onClick={() => setAddingMoneyToGoal(goal)}
                        >
                          <PlusCircle size={18} />
                          <span>Adicionar Valor</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'savings' && (
          <div className="savings-tab">
            <div className="section-header">
              <h2>Economias e Poupança</h2>
              <button 
                className="add-saving-button"
                onClick={() => setIsSavingFormOpen(true)}
              >
                <Plus size={16} />
                Nova Economia
              </button>
            </div>
            
            <div className="savings-grid">
              {savingsProgress.map((saving) => {
                const isCompleted = saving.progress >= 100;
                return (
                  <div key={saving.id} className={`saving-card ${isCompleted ? 'completed' : ''}`}>
                    <div className="saving-header">
                      <div className="saving-title-section">
                        <h3>{saving.name}</h3>
                      </div>
                      {isCompleted && (
                        <span className="completed-badge">
                          <PiggyBank size={14} />
                          Concluída
                        </span>
                      )}
                    </div>
                    
                    <div className="saving-progress">
                      <div className="progress-info">
                        <div className="current">
                          <span>{formatCurrency(saving.currentAmount)}</span>
                        </div>
                        <div className="target">
                          <span>{formatCurrency(saving.targetAmount)}</span>
                        </div>
                      </div>
                      <p className={`progress-text ${isCompleted ? 'completed' : ''}`}>
                        {isCompleted ? (
                          <>
                            <PiggyBank size={14} />
                            <span>100% concluído - Economia alcançada!</span>
                          </>
                        ) : (
                          `${saving.progress.toFixed(1)}% concluído`
                        )}
                      </p>
                    </div>
                    
                    {saving.description && (
                      <div className="saving-description">
                        <p>{saving.description}</p>
                      </div>
                    )}
                    
                    {!isCompleted && (
                      <div className="saving-add-money">
                        <button 
                          className="add-money-btn"
                          onClick={() => setAddingMoneyToSaving(saving)}
                        >
                          <PlusCircle size={18} />
                          <span>Adicionar Valor</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modais */}
      <TransactionForm
        isOpen={isTransactionFormOpen}
        onClose={() => setIsTransactionFormOpen(false)}
      />
      
      <GoalForm
        isOpen={isGoalFormOpen}
        onClose={() => setIsGoalFormOpen(false)}
        onSubmit={handleSubmitGoal}
      />
      
      <SavingForm
        isOpen={isSavingFormOpen}
        onClose={() => setIsSavingFormOpen(false)}
        onSubmit={handleSubmitSaving}
      />

      {/* Modal para adicionar dinheiro à meta */}
      {addingMoneyToGoal && (
        <div className="modal-overlay" onClick={() => {
          setAddingMoneyToGoal(null);
          setAmountToAdd('');
        }}>
          <div className="modal-content add-money-modal" onClick={(e) => e.stopPropagation()}>
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

      {/* Modal para adicionar dinheiro à economia */}
      {addingMoneyToSaving && (
        <div className="modal-overlay" onClick={() => {
          setAddingMoneyToSaving(null);
          setAmountToAdd('');
        }}>
          <div className="modal-content add-money-modal" onClick={(e) => e.stopPropagation()}>
            <div className="add-money-header">
              <h3>Adicionar Valor à Economia</h3>
              <button 
                className="close-modal-btn"
                onClick={() => {
                  setAddingMoneyToSaving(null);
                  setAmountToAdd('');
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="add-money-content">
              <div className="goal-info">
                <h4>{addingMoneyToSaving.name}</h4>
                <p className="goal-amounts">
                  {formatCurrency(addingMoneyToSaving.currentAmount || 0)} / {formatCurrency(addingMoneyToSaving.targetAmount || addingMoneyToSaving.amount || 0)}
                </p>
              </div>
              <div className="add-money-input-group">
                <label htmlFor="amount-saving">Valor a adicionar (R$)</label>
                <input
                  type="number"
                  id="amount-saving"
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
                    setAddingMoneyToSaving(null);
                    setAmountToAdd('');
                  }}
                >
                  Cancelar
                </button>
                <button 
                  className="confirm-btn"
                  onClick={handleAddMoneyToSaving}
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FloatingButton */}
      <FloatingButton onClick={() => setIsTransactionFormOpen(true)} />
    </div>
  );
};

export default Spreadsheet;
