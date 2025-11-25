import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinancial, TRANSACTION_TYPES } from '../../../context/FinancialContext';
import { useBankCard } from '../../../context/BankCardContext';
import SummaryCard from '../../../components/Cards/SummaryCard/SummaryCard';
import TransactionCard from '../../../components/Cards/TransactionCard/TransactionCard';
import ExpenseChart from '../../../components/Charts/ExpenseChart/ExpenseChart';
import SimpleTransactionForm from '../../../components/SimpleTransactionForm/SimpleTransactionForm';
import FloatingButton from '../../../components/FloatingButton/FloatingButton';
import { TrendingUp, TrendingDown, Wallet, Calendar, ChevronDown, Plus, Clock, Building2 } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { 
    transactions, 
    categories, 
    getTotalIncome, 
    getTotalExpense, 
    getBalance,
    deleteTransaction,
    getMonthlyProjection,
    getYearlyProjection
  } = useFinancial();
  
  const { getTotalBalance } = useBankCard();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  const handleEditTransaction = (transaction) => {
    // TODO: Implementar edição de transação
  };

  const handleDeleteTransaction = (id) => {
    deleteTransaction(id);
  };

  // Função para filtrar transações por período
  const getPeriodTransactions = (period) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (period) {
      case 'today': {
        const todayStr = today.toISOString().split('T')[0];
        return transactions.filter(t => t.date === todayStr);
      }
      case 'week': {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return transactions.filter(t => {
          const date = new Date(t.date);
          return date >= weekAgo && date <= today;
        });
      }
      case 'month': {
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        return transactions.filter(t => {
          const date = new Date(t.date);
          return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });
      }
      case '30days': {
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return transactions.filter(t => {
          const date = new Date(t.date);
          return date >= thirtyDaysAgo && date <= today;
        });
      }
      case '3months': {
        const threeMonthsAgo = new Date(today);
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        return transactions.filter(t => {
          const date = new Date(t.date);
          return date >= threeMonthsAgo && date <= today;
        });
      }
      case 'year': {
        const currentYear = today.getFullYear();
        return transactions.filter(t => {
          const date = new Date(t.date);
          return date.getFullYear() === currentYear;
        });
      }
      default:
        return transactions;
    }
  };

  // Transações filtradas pelo período selecionado
  const periodTransactions = useMemo(() => {
    return getPeriodTransactions(selectedPeriod);
  }, [transactions, selectedPeriod]);

  // Dados para os cards de resumo baseados no período selecionado
  const summaryData = useMemo(() => {
    const currentIncome = getTotalIncome(periodTransactions);
    const currentExpense = getTotalExpense(periodTransactions);
    const currentBalance = getBalance(periodTransactions);

    // Calcular período anterior para comparação
    let previousPeriodTransactions = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (selectedPeriod) {
      case 'today': {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        previousPeriodTransactions = transactions.filter(t => t.date === yesterdayStr);
        break;
      }
      case 'week': {
        const twoWeeksAgo = new Date(today);
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        previousPeriodTransactions = transactions.filter(t => {
          const date = new Date(t.date);
          return date >= twoWeeksAgo && date < weekAgo;
        });
        break;
      }
      case 'month': {
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        previousPeriodTransactions = transactions.filter(t => {
          const date = new Date(t.date);
          return date.getMonth() === previousMonth && date.getFullYear() === previousYear;
        });
        break;
      }
      case '30days': {
        const sixtyDaysAgo = new Date(today);
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        previousPeriodTransactions = transactions.filter(t => {
          const date = new Date(t.date);
          return date >= sixtyDaysAgo && date < thirtyDaysAgo;
        });
        break;
      }
      case '3months': {
        const sixMonthsAgo = new Date(today);
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const threeMonthsAgo = new Date(today);
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        previousPeriodTransactions = transactions.filter(t => {
          const date = new Date(t.date);
          return date >= sixMonthsAgo && date < threeMonthsAgo;
        });
        break;
      }
      case 'year': {
        const previousYear = today.getFullYear() - 1;
        previousPeriodTransactions = transactions.filter(t => {
          const date = new Date(t.date);
          return date.getFullYear() === previousYear;
        });
        break;
      }
    }

    const previousIncome = getTotalIncome(previousPeriodTransactions);
    const incomeChange = previousIncome > 0 ? ((currentIncome - previousIncome) / previousIncome) * 100 : 0;

    const previousExpense = getTotalExpense(previousPeriodTransactions);
    const expenseChange = previousExpense > 0 ? ((currentExpense - previousExpense) / previousExpense) * 100 : 0;

    const previousBalance = getBalance(previousPeriodTransactions);
    const balanceChange = previousBalance !== 0 ? ((currentBalance - previousBalance) / Math.abs(previousBalance)) * 100 : 0;

    return [
      {
        title: 'Receitas',
        value: new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(currentIncome),
        change: incomeChange,
        icon: TrendingUp,
        color: '#10B981'
      },
      {
        title: 'Despesas',
        value: new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(currentExpense),
        change: expenseChange,
        icon: TrendingDown,
        color: '#EF4444'
      },
      {
        title: 'Saldo Atual',
        value: new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(currentBalance),
        change: balanceChange,
        icon: Wallet,
        color: currentBalance >= 0 ? '#3B82F6' : '#EF4444'
      }
    ];
  }, [periodTransactions, selectedPeriod, transactions, getTotalIncome, getTotalExpense, getBalance]);

  // Dados para o gráfico de gastos por categoria (filtrado pelo período)
  const expenseData = useMemo(() => {
    const periodExpenses = periodTransactions.filter(t => t.type === TRANSACTION_TYPES.EXPENSE);

    const categoryTotals = {};
    periodExpenses.forEach(transaction => {
      const category = categories.find(c => c.id === transaction.categoryId);
      if (category) {
        if (!categoryTotals[category.name]) {
          categoryTotals[category.name] = {
            value: 0,
            color: category.color
          };
        }
        categoryTotals[category.name].value += transaction.amount;
      }
    });

    const total = Object.values(categoryTotals).reduce((sum, item) => sum + item.value, 0);
    
    return Object.entries(categoryTotals)
      .map(([name, item]) => ({
        name,
        value: item.value,
        color: item.color,
        percentage: total > 0 ? ((item.value / total) * 100).toFixed(1) : 0
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [periodTransactions, categories]);

  // Dados de hoje para widget
  const todayData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    const todayTransactions = transactions.filter(t => t.date === todayStr);
    
    return {
      income: getTotalIncome(todayTransactions),
      expense: getTotalExpense(todayTransactions),
      balance: getBalance(todayTransactions),
      count: todayTransactions.length
    };
  }, [transactions, getTotalIncome, getTotalExpense, getBalance]);

  // Dados de projeções
  const projectionData = useMemo(() => {
    if (selectedPeriod === 'month' || selectedPeriod === 'year') {
      const projection = selectedPeriod === 'month' 
        ? getMonthlyProjection(1)
        : getYearlyProjection();
      
      const today = new Date();
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      const daysPassed = today.getDate();
      const daysRemaining = daysInMonth - daysPassed;
      const monthProgress = (daysPassed / daysInMonth) * 100;

      return {
        ...projection,
        monthProgress: selectedPeriod === 'month' ? monthProgress : null,
        daysPassed,
        daysRemaining,
        daysInMonth
      };
    }
    return null;
  }, [selectedPeriod, getMonthlyProjection, getYearlyProjection]);


  // Transações recentes (filtradas pelo período)
  const recentTransactions = useMemo(() => {
    return periodTransactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
      .map(transaction => ({
        ...transaction,
        categoryName: categories.find(c => c.id === transaction.categoryId)?.name || 'Sem categoria'
      }));
  }, [periodTransactions, categories]);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">Visão Geral</h1>
          <p className="page-subtitle">
            Acompanhe suas finanças em tempo real e tome decisões inteligentes
          </p>
        </div>
      </div>

      {/* Seção de Controles: Botão Adicionar e Dropdown */}
      <div className="dashboard-controls">
        <button 
          className="add-transaction-btn"
          onClick={handleOpenForm}
          aria-label="Adicionar transação"
        >
          <Plus size={20} />
          <span>Adicionar Transação</span>
        </button>
        <div className="period-selector-wrapper">
          <div className="period-selector">
            <Calendar size={18} />
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="period-select"
            >
              <option value="today">Hoje</option>
              <option value="week">Esta Semana</option>
              <option value="month">Este Mês</option>
              <option value="30days">Últimos 30 dias</option>
              <option value="3months">Últimos 3 meses</option>
              <option value="year">Este Ano</option>
            </select>
            <ChevronDown size={16} className="select-chevron" />
          </div>
        </div>
      </div>

      {/* Widget de Resumo do Dia */}
      {(selectedPeriod === 'today' || selectedPeriod === 'week' || selectedPeriod === 'month') && todayData.count > 0 && (
        <div className="today-summary-widget">
          <div className="today-widget-header">
            <h3 className="today-widget-title">Resumo de Hoje</h3>
            <span className="today-widget-badge">{todayData.count} transação{todayData.count !== 1 ? 'ões' : ''}</span>
          </div>
          <div className="today-widget-content">
            <div className="today-widget-item income">
              <span className="today-widget-label">Receitas</span>
              <span className="today-widget-value">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(todayData.income)}
              </span>
            </div>
            <div className="today-widget-item expense">
              <span className="today-widget-label">Despesas</span>
              <span className="today-widget-value">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(todayData.expense)}
              </span>
            </div>
            <div className="today-widget-item balance">
              <span className="today-widget-label">Saldo</span>
              <span className={`today-widget-value ${todayData.balance >= 0 ? 'positive' : 'negative'}`}>
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(todayData.balance)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Cards de Resumo */}
      <div className="summary-grid">
        {summaryData.map((item, index) => (
          <SummaryCard
            key={index}
            title={item.title}
            value={item.value}
            change={item.change}
            icon={item.icon}
            color={item.color}
          />
        ))}
      </div>

      {/* Card de Saldo Bancário */}
      {(() => {
        const bankBalance = getTotalBalance();
        const transactionBalance = getBalance(periodTransactions);
        const difference = bankBalance - transactionBalance;
        
        return (
          <div className="bank-balance-card" onClick={() => navigate('/bank-accounts')} style={{ cursor: 'pointer' }}>
            <div className="bank-balance-header">
              <div className="bank-balance-icon">
                <Building2 size={24} />
              </div>
              <div className="bank-balance-info">
                <h3 className="bank-balance-title">Saldo Bancário Total</h3>
                <p className="bank-balance-subtitle">Saldo de todas as contas bancárias</p>
              </div>
            </div>
            <div className="bank-balance-content">
              <div className="bank-balance-value">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(bankBalance)}
              </div>
              {difference !== 0 && (
                <div className="bank-balance-difference">
                  <span className="difference-label">
                    Diferença com transações:
                  </span>
                  <span className={`difference-value ${difference >= 0 ? 'positive' : 'negative'}`}>
                    {difference >= 0 ? '+' : ''}
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(difference)}
                  </span>
                </div>
              )}
            </div>
            <div className="bank-balance-footer">
              <span className="bank-balance-link">Ver contas bancárias →</span>
            </div>
          </div>
        );
      })()}

      {/* Card de Projeção */}
      {projectionData && selectedPeriod === 'month' && (
        <div className="projection-card">
          <div className="projection-header">
            <h3 className="projection-title">Projeção do Mês</h3>
            <div className="projection-status">
              <div className="status-item">
                <Clock size={16} />
                <span className="status-label">Dias restantes</span>
                <span className="status-value">{projectionData.daysRemaining}</span>
              </div>
              <div className="status-divider"></div>
              <div className="status-item">
                <Calendar size={16} />
                <span className="status-label">Mês decorrido</span>
                <span className="status-value">{Math.round(projectionData.monthProgress)}%</span>
              </div>
            </div>
          </div>
          <div className="projection-content">
            <div className="projection-item">
              <span className="projection-label">Receitas Projetadas</span>
              <span className="projection-value income">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(projectionData.projectedIncome)}
              </span>
            </div>
            <div className="projection-item">
              <span className="projection-label">Despesas Projetadas</span>
              <span className="projection-value expense">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(projectionData.projectedExpense)}
              </span>
            </div>
            <div className="projection-item">
              <span className="projection-label">Saldo Projetado</span>
              <span className={`projection-value ${projectionData.projectedBalance >= 0 ? 'positive' : 'negative'}`}>
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(projectionData.projectedBalance)}
              </span>
            </div>
          </div>
        </div>
      )}

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

      {/* Gráfico de Pizza */}
      <div className="charts-grid">
        <ExpenseChart data={expenseData} />
      </div>

      {/* Transações Recentes */}
      <div className="recent-transactions">
        <div className="section-header">
          <h2 className="section-title">Transações Recentes</h2>
          <button 
            className="view-all-button"
            onClick={() => navigate('/transactions')}
          >
            Ver todas
          </button>
        </div>
        
        <div className="transactions-list">
          {recentTransactions.length > 0 ? (
            recentTransactions.map(transaction => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                onEdit={() => handleEditTransaction(transaction)}
                onDelete={() => handleDeleteTransaction(transaction.id)}
              />
            ))
          ) : (
            <div className="empty-state">
              <p>Nenhuma transação encontrada</p>
        <button 
          className="add-transaction-button"
          onClick={handleOpenForm}
        >
          Adicionar primeira transação
        </button>
            </div>
          )}
        </div>
      </div>

      {/* FloatingButton */}
      <FloatingButton onClick={handleOpenForm} isHidden={isFormOpen} />

      {/* Formulário de Transação */}
      <SimpleTransactionForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
      />
    </div>
  );
};

export default Dashboard;
