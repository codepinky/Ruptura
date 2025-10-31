import React, { useMemo } from 'react';
import { useFinancial, TRANSACTION_TYPES } from '../../../context/FinancialContext';
import ExpenseChart from '../../../components/Charts/ExpenseChart/ExpenseChart';
import BalanceChart from '../../../components/Charts/BalanceChart/BalanceChart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ExecutiveOverview = ({ selectedRange }) => {
  const { transactions, categories, getMonthlyProjection, getYearlyProjection } = useFinancial();

  const getDateRange = (range) => {
    const end = new Date();
    end.setHours(0, 0, 0, 0);
    const start = new Date(end);
    if (range === '30days') {
      start.setDate(start.getDate() - 29);
    } else if (range === 'year') {
      start.setMonth(0, 1);
    } else {
      start.setDate(1);
    }
    return { start, end };
  };

  const monthlyData = useMemo(() => {
    const { start, end } = getDateRange(selectedRange);
    const months = [];
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    while (cursor <= end) {
      const y = cursor.getFullYear();
      const m = cursor.getMonth();
      const monthTransactions = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getFullYear() === y && d.getMonth() === m;
      });
      const income = monthTransactions
        .filter(t => t.type === TRANSACTION_TYPES.INCOME)
        .reduce((sum, t) => sum + t.amount, 0);
      const expense = monthTransactions
        .filter(t => t.type === TRANSACTION_TYPES.EXPENSE)
        .reduce((sum, t) => sum + t.amount, 0);
      months.push({
        month: new Date(y, m).toLocaleDateString('pt-BR', { month: 'short' }),
        income,
        expense,
        balance: income - expense
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return months;
  }, [transactions, selectedRange]);

  const expenseData = useMemo(() => {
    const { start, end } = getDateRange(selectedRange);
    const rangeExpenses = transactions.filter(t => {
      const date = new Date(t.date);
      return date >= start && date <= end && t.type === TRANSACTION_TYPES.EXPENSE;
    });
    const categoryTotals = {};
    rangeExpenses.forEach(transaction => {
      const category = categories.find(c => c.id === transaction.categoryId);
      if (category) {
        if (!categoryTotals[category.name]) categoryTotals[category.name] = 0;
        categoryTotals[category.name] += transaction.amount;
      }
    });
    const total = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value, percentage: total > 0 ? ((value / total) * 100).toFixed(1) : 0 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [transactions, categories, selectedRange]);

  const balanceData = useMemo(() => {
    const { start, end } = getDateRange(selectedRange);
    const days = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      const dayTransactions = transactions.filter(t => {
        const d = new Date(t.date);
        return d.toDateString() === cursor.toDateString();
      });
      const income = dayTransactions.filter(t => t.type === TRANSACTION_TYPES.INCOME).reduce((s, t) => s + t.amount, 0);
      const expense = dayTransactions.filter(t => t.type === TRANSACTION_TYPES.EXPENSE).reduce((s, t) => s + t.amount, 0);
      days.push({ date: cursor.toISOString(), income, expense, balance: income - expense });
      cursor.setDate(cursor.getDate() + 1);
    }
    return days;
  }, [transactions, selectedRange]);

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const kpis = useMemo(() => {
    const { start, end } = getDateRange(selectedRange);
    let prevStart = new Date(start);
    let prevEnd = new Date(end);
    if (selectedRange === '30days') {
      prevStart.setDate(prevStart.getDate() - 30);
      prevEnd.setDate(prevEnd.getDate() - 30);
    } else if (selectedRange === 'year') {
      prevStart.setFullYear(prevStart.getFullYear() - 1);
      prevEnd.setFullYear(prevEnd.getFullYear() - 1);
    } else {
      prevStart.setMonth(prevStart.getMonth() - 1);
      prevEnd = new Date(prevStart.getFullYear(), prevStart.getMonth() + 1, 0);
    }
    const inRange = transactions.filter(t => {
      const d = new Date(t.date);
      return d >= start && d <= end;
    });
    const inPrev = transactions.filter(t => {
      const d = new Date(t.date);
      return d >= prevStart && d <= prevEnd;
    });
    const sumIncome = (arr) => arr.filter(t => t.type === TRANSACTION_TYPES.INCOME).reduce((s, t) => s + t.amount, 0);
    const sumExpense = (arr) => arr.filter(t => t.type === TRANSACTION_TYPES.EXPENSE).reduce((s, t) => s + t.amount, 0);
    const income = sumIncome(inRange);
    const expense = sumExpense(inRange);
    const balance = income - expense;
    const prevIncome = sumIncome(inPrev);
    const prevExpense = sumExpense(inPrev);
    const prevBalance = prevIncome - prevExpense;
    const pct = (curr, prev) => prev ? ((curr - prev) / Math.abs(prev)) * 100 : 0;
    return [
      { key: 'income', label: 'Receitas', value: income, change: pct(income, prevIncome) },
      { key: 'expense', label: 'Despesas', value: expense, change: pct(expense, prevExpense) },
      { key: 'balance', label: 'Saldo', value: balance, change: pct(balance, prevBalance) }
    ];
  }, [transactions, selectedRange]);

  const miniSummary = useMemo(() => {
    const income = kpis.find(k => k.key === 'income')?.value || 0;
    const expense = kpis.find(k => k.key === 'expense')?.value || 0;
    const balance = income - expense;
    const label = selectedRange === 'year' ? 'no ano' : (selectedRange === '30days' ? 'nos últimos 30 dias' : 'neste mês');
    return `Você recebeu ${formatCurrency(income)}, gastou ${formatCurrency(expense)} e seu saldo foi ${formatCurrency(balance)} ${label}.`;
  }, [kpis, selectedRange]);

  const yearly = useMemo(() => getYearlyProjection(), [getYearlyProjection]);
  const monthly = useMemo(() => getMonthlyProjection(1), [getMonthlyProjection]);

  return (
    <>
      <p className="mini-summary">{miniSummary}</p>

      <div className="kpi-strip">
        {kpis.map((kpi) => (
          <div key={kpi.key} className={`kpi-card ${kpi.key}`}>
            <span className="kpi-label">{kpi.label}</span>
            <span className={`kpi-value ${kpi.key}`}>{formatCurrency(kpi.value)}</span>
            <span className={`kpi-change ${kpi.change >= 0 ? 'up' : 'down'}`}>{kpi.change >= 0 ? '+' : ''}{kpi.change.toFixed(1)}%</span>
          </div>
        ))}
      </div>

      <div className="projections-grid">
        <div className="projection-card">
          <h4 className="projection-title">Receita Anual</h4>
          <p className="projection-value income">{formatCurrency(yearly.currentYear.income)}</p>
          <span className="projection-hint">Projeção: {formatCurrency(yearly.projection.income)}</span>
        </div>
        <div className="projection-card">
          <h4 className="projection-title">Despesa Anual</h4>
          <p className="projection-value expense">{formatCurrency(yearly.currentYear.expense)}</p>
          <span className="projection-hint">Projeção: {formatCurrency(yearly.projection.expense)}</span>
        </div>
        <div className="projection-card">
          <h4 className="projection-title">Saldo Anual</h4>
          <p className="projection-value balance">{formatCurrency(yearly.currentYear.balance)}</p>
          <span className="projection-hint">Projeção: {formatCurrency(yearly.projection.balance)}</span>
        </div>
        <div className="projection-card">
          <h4 className="projection-title">Média Mensal</h4>
          <div className="projection-avg">
            <span>Receitas: {formatCurrency(monthly.monthlyAverage.income)}</span>
            <span>Despesas: {formatCurrency(monthly.monthlyAverage.expense)}</span>
            <span>Saldo: {formatCurrency(monthly.monthlyAverage.balance)}</span>
          </div>
        </div>
      </div>

      <div className="chart-section">
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Receitas vs Despesas</h3>
            <p className="chart-subtitle">{selectedRange === 'year' ? 'Este ano' : (selectedRange === '30days' ? 'Últimos 30 dias' : 'Este mês')}</p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value) => [formatCurrency(value), '']} labelFormatter={(label) => `Mês: ${label}`} />
                <Bar dataKey="income" fill="#10B981" name="Receitas" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#EF4444" name="Despesas" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <ExpenseChart data={expenseData} />
        <BalanceChart data={balanceData} />
      </div>

      <div className="stats-section">
        <div className="stats-card">
          <h3 className="stats-title">Resumo do Ano</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <h4>Total de Receitas</h4>
              <p className="stat-value income">{formatCurrency(monthlyData.reduce((sum, m) => sum + m.income, 0))}</p>
            </div>
            <div className="stat-item">
              <h4>Total de Despesas</h4>
              <p className="stat-value expense">{formatCurrency(monthlyData.reduce((sum, m) => sum + m.expense, 0))}</p>
            </div>
            <div className="stat-item">
              <h4>Saldo Anual</h4>
              <p className="stat-value balance">{formatCurrency(monthlyData.reduce((sum, m) => sum + m.balance, 0))}</p>
            </div>
            <div className="stat-item">
              <h4>Média Mensal</h4>
              <p className="stat-value average">{formatCurrency(monthlyData.reduce((sum, m) => sum + m.balance, 0) / 12)}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExecutiveOverview;




