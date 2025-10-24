import React, { useMemo, useState } from 'react';
import { useFinancial, TRANSACTION_TYPES } from '../../../context/FinancialContext';
import SummaryCard from '../../../components/Cards/SummaryCard/SummaryCard';
import TransactionCard from '../../../components/Cards/TransactionCard/TransactionCard';
import ExpenseChart from '../../../components/Charts/ExpenseChart/ExpenseChart';
import BalanceChart from '../../../components/Charts/BalanceChart/BalanceChart';
import FloatingButton from '../../../components/FloatingButton/FloatingButton';
import SimpleTransactionForm from '../../../components/SimpleTransactionForm/SimpleTransactionForm';
import { DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { 
    transactions, 
    categories, 
    getTotalIncome, 
    getTotalExpense, 
    getBalance,
    deleteTransaction
  } = useFinancial();

  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  // Dados para os cards de resumo
  const summaryData = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const currentMonthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    const previousMonthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === previousMonth && date.getFullYear() === previousYear;
    });

    const currentIncome = getTotalIncome(currentMonthTransactions);
    const previousIncome = getTotalIncome(previousMonthTransactions);
    const incomeChange = previousIncome > 0 ? ((currentIncome - previousIncome) / previousIncome) * 100 : 0;

    const currentExpense = getTotalExpense(currentMonthTransactions);
    const previousExpense = getTotalExpense(previousMonthTransactions);
    const expenseChange = previousExpense > 0 ? ((currentExpense - previousExpense) / previousExpense) * 100 : 0;

    const currentBalance = getBalance(currentMonthTransactions);
    const previousBalance = getBalance(previousMonthTransactions);
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
  }, [transactions, getTotalIncome, getTotalExpense, getBalance]);

  // Dados para o gráfico de gastos por categoria
  const expenseData = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const currentMonthExpenses = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && 
             date.getFullYear() === currentYear && 
             t.type === TRANSACTION_TYPES.EXPENSE;
    });

    const categoryTotals = {};
    currentMonthExpenses.forEach(transaction => {
      const category = categories.find(c => c.id === transaction.categoryId);
      if (category) {
        if (!categoryTotals[category.name]) {
          categoryTotals[category.name] = 0;
        }
        categoryTotals[category.name] += transaction.amount;
      }
    });

    const total = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
    
    return Object.entries(categoryTotals)
      .map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? ((value / total) * 100).toFixed(1) : 0
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [transactions, categories]);

  // Dados para o gráfico de evolução do saldo
  const balanceData = useMemo(() => {
    const last30Days = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const dayTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.toDateString() === date.toDateString();
      });
      
      const dayBalance = getBalance(dayTransactions);
      last30Days.push({
        date: date.toISOString(),
        balance: dayBalance
      });
    }
    
    return last30Days;
  }, [transactions, getBalance]);

  // Transações recentes
  const recentTransactions = useMemo(() => {
    return transactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
      .map(transaction => ({
        ...transaction,
        categoryName: categories.find(c => c.id === transaction.categoryId)?.name || 'Sem categoria'
      }));
  }, [transactions, categories]);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">Visão geral das suas finanças</p>
        </div>
      </div>

      {/* Botão Flutuante */}
      <FloatingButton onClick={handleOpenForm} />

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

      {/* Gráficos */}
      <div className="charts-grid">
        <ExpenseChart data={expenseData} />
        <BalanceChart data={balanceData} />
      </div>

      {/* Transações Recentes */}
      <div className="recent-transactions">
        <div className="section-header">
          <h2 className="section-title">Transações Recentes</h2>
          <button className="view-all-button">Ver todas</button>
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

      {/* Formulário de Transação */}
      <SimpleTransactionForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
      />
    </div>
  );
};

export default Dashboard;
