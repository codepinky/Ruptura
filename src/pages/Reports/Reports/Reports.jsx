import React, { useMemo } from 'react';
import { useFinancial, TRANSACTION_TYPES } from '../../../context/FinancialContext';
import ExpenseChart from '../../../components/Charts/ExpenseChart/ExpenseChart';
import BalanceChart from '../../../components/Charts/BalanceChart/BalanceChart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Reports.css';

const Reports = () => {
  const { transactions, categories, getTransactionsByMonth } = useFinancial();

  // Dados para gráfico de receitas vs despesas por mês
  const monthlyData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const months = [];
    
    for (let month = 0; month < 12; month++) {
      const monthTransactions = getTransactionsByMonth(currentYear, month);
      const income = monthTransactions
        .filter(t => t.type === TRANSACTION_TYPES.INCOME)
        .reduce((sum, t) => sum + t.amount, 0);
      const expense = monthTransactions
        .filter(t => t.type === TRANSACTION_TYPES.EXPENSE)
        .reduce((sum, t) => sum + t.amount, 0);
      
      months.push({
        month: new Date(currentYear, month).toLocaleDateString('pt-BR', { month: 'short' }),
        income,
        expense,
        balance: income - expense
      });
    }
    
    return months;
  }, [getTransactionsByMonth]);

  // Dados para gráfico de gastos por categoria
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

  // Dados para gráfico de evolução do saldo
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
      
      const dayIncome = dayTransactions
        .filter(t => t.type === TRANSACTION_TYPES.INCOME)
        .reduce((sum, t) => sum + t.amount, 0);
      const dayExpense = dayTransactions
        .filter(t => t.type === TRANSACTION_TYPES.EXPENSE)
        .reduce((sum, t) => sum + t.amount, 0);
      
      last30Days.push({
        date: date.toISOString(),
        income: dayIncome,
        expense: dayExpense,
        balance: dayIncome - dayExpense
      });
    }
    
    return last30Days;
  }, [transactions]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="reports-page">
      <div className="page-header">
        <h1 className="page-title">Relatórios</h1>
        <p className="page-subtitle">Análise detalhada das suas finanças</p>
      </div>

      {/* Gráfico de Receitas vs Despesas por Mês */}
      <div className="chart-section">
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Receitas vs Despesas por Mês</h3>
            <p className="chart-subtitle">Comparativo anual</p>
          </div>
          
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="month" 
                  stroke="#64748b"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#64748b"
                  fontSize={12}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), '']}
                  labelFormatter={(label) => `Mês: ${label}`}
                />
                <Bar dataKey="income" fill="#10B981" name="Receitas" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#EF4444" name="Despesas" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Gráficos em Grid */}
      <div className="charts-grid">
        <ExpenseChart data={expenseData} />
        <BalanceChart data={balanceData} />
      </div>

      {/* Resumo Estatístico */}
      <div className="stats-section">
        <div className="stats-card">
          <h3 className="stats-title">Resumo do Ano</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <h4>Total de Receitas</h4>
              <p className="stat-value income">
                {formatCurrency(monthlyData.reduce((sum, m) => sum + m.income, 0))}
              </p>
            </div>
            <div className="stat-item">
              <h4>Total de Despesas</h4>
              <p className="stat-value expense">
                {formatCurrency(monthlyData.reduce((sum, m) => sum + m.expense, 0))}
              </p>
            </div>
            <div className="stat-item">
              <h4>Saldo Anual</h4>
              <p className="stat-value balance">
                {formatCurrency(monthlyData.reduce((sum, m) => sum + m.balance, 0))}
              </p>
            </div>
            <div className="stat-item">
              <h4>Média Mensal</h4>
              <p className="stat-value average">
                {formatCurrency(monthlyData.reduce((sum, m) => sum + m.balance, 0) / 12)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;

