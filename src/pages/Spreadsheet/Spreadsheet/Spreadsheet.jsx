import React, { useState, useMemo } from 'react';
import { useFinancial, TRANSACTION_TYPES } from '../../../context/FinancialContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  PiggyBank, 
  Calendar,
  Filter,
  Download,
  Plus
} from 'lucide-react';
import TransactionForm from '../../../components/Forms/TransactionForm/TransactionForm';
import GoalForm from '../../../components/Goals/GoalForm/GoalForm';
import CategoryExpenseCard from '../../../components/Cards/CategoryExpenseCard/CategoryExpenseCard';
import CategoryAnalysisCard from '../../../components/Cards/CategoryAnalysisCard/CategoryAnalysisCard';
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
    getMonthlySavings
  } = useFinancial();

  const [activeTab, setActiveTab] = useState('expenses');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
  const [isSavingFormOpen, setIsSavingFormOpen] = useState(false);

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

  // Economias ativas
  const activeSavings = useMemo(() => {
    return savings.filter(s => s.active);
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

  return (
    <div className="spreadsheet-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">📊 Planilha Financeira</h1>
          <p className="page-subtitle">Controle detalhado de gastos, metas e economias</p>
        </div>
        
        <div className="header-actions">
          <div className="date-filters">
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="filter-select"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="filter-select"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <button className="export-button">
            <Download size={16} />
            Exportar
          </button>
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
              <div className="header-actions">
                <button 
                  className="add-expense-button"
                  onClick={() => setIsTransactionFormOpen(true)}
                >
                  <Plus size={16} />
                  Adicionar Transação
                </button>
              </div>
            </div>
            
            <div className="expenses-grid">
              {categoryAnalysis.length > 0 ? (
                categoryAnalysis.map((category, index) => (
                  <CategoryAnalysisCard
                    key={index}
                    category={category}
                    totalIncome={monthlyData.income}
                    totalExpense={monthlyData.expense}
                  />
                ))
              ) : (
                <div className="no-expenses">
                  <h3>Nenhuma transação encontrada</h3>
                  <p>Adicione algumas transações para ver receitas e despesas por categoria</p>
                  <button 
                    className="add-first-expense-button"
                    onClick={() => setIsTransactionFormOpen(true)}
                  >
                    <Plus size={16} />
                    Adicionar Primeira Transação
                  </button>
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
              {goalsProgress.map((goal) => (
                <div key={goal.id} className="goal-card">
                  <div className="goal-header">
                    <h3>{goal.name}</h3>
                    <span className={`priority ${goal.priority}`}>{goal.priority}</span>
                  </div>
                  
                  <div className="goal-progress">
                    <div className="progress-info">
                      <span className="current">{formatCurrency(goal.currentAmount)}</span>
                      <span className="target">{formatCurrency(goal.targetAmount)}</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${Math.min(goal.progress, 100)}%` }}
                      />
                    </div>
                    <p className="progress-text">
                      {goal.progress.toFixed(1)}% concluído
                    </p>
                  </div>
                  
                  <div className="goal-details">
                    <p className="remaining">
                      Restam: {formatCurrency(goal.remaining)}
                    </p>
                    <p className="deadline">
                      Prazo: {formatDate(goal.deadline)}
                    </p>
                    <p className="days-remaining">
                      {goal.daysRemaining > 0 ? `${goal.daysRemaining} dias restantes` : 'Prazo vencido'}
                    </p>
                  </div>
                </div>
              ))}
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
            
            <div className="savings-summary">
              <div className="saving-stat">
                <h3>Total Acumulado</h3>
                <p>{formatCurrency(getTotalSavings())}</p>
              </div>
              <div className="saving-stat">
                <h3>Economia Mensal</h3>
                <p>{formatCurrency(getMonthlySavings())}</p>
              </div>
            </div>
            
            <div className="savings-grid">
              {activeSavings.map((saving) => (
                <div key={saving.id} className="saving-card">
                  <div className="saving-header">
                    <h3>{saving.name}</h3>
                    <span className={`status ${saving.active ? 'active' : 'inactive'}`}>
                      {saving.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  
                  <div className="saving-details">
                    <p className="amount">{formatCurrency(saving.amount)}</p>
                    <p className="frequency">{saving.frequency}</p>
                    <p className="period">
                      {formatDate(saving.startDate)} - {formatDate(saving.endDate)}
                    </p>
                  </div>
                </div>
              ))}
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
      />
      
      {/* Modal de Economia - placeholder por enquanto */}
      {isSavingFormOpen && (
        <div className="modal-overlay" onClick={() => setIsSavingFormOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Nova Economia</h3>
            <p>Funcionalidade em desenvolvimento...</p>
            <button onClick={() => setIsSavingFormOpen(false)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Spreadsheet;
