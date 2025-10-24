import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import './CategoryCharts.css';

const CategoryCharts = ({ categoryAnalysis, totalIncome, totalExpense }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Preparar dados para gráfico de pizza (apenas despesas)
  const expenseData = categoryAnalysis
    .filter(cat => cat.type === 'expense' && cat.totalExpense > 0)
    .map(cat => ({
      name: cat.name,
      value: cat.totalExpense,
      color: cat.color,
      percentage: totalExpense > 0 ? ((cat.totalExpense / totalExpense) * 100).toFixed(1) : 0
    }))
    .sort((a, b) => b.value - a.value);

  // Preparar dados para gráfico de barras (receitas vs despesas)
  const incomeData = categoryAnalysis
    .filter(cat => cat.type === 'income' && cat.totalIncome > 0)
    .map(cat => ({
      name: cat.name,
      receitas: cat.totalIncome,
      despesas: 0,
      color: cat.color
    }));

  const expenseBarData = categoryAnalysis
    .filter(cat => cat.type === 'expense' && cat.totalExpense > 0)
    .map(cat => ({
      name: cat.name,
      receitas: 0,
      despesas: cat.totalExpense,
      color: cat.color
    }));

  const barData = [...incomeData, ...expenseBarData]
    .sort((a, b) => (b.receitas + b.despesas) - (a.receitas + a.despesas));

  // Preparar dados para gráfico de evolução temporal (últimos 6 meses)
  const monthlyData = React.useMemo(() => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
      
      const monthTransactions = categoryAnalysis.reduce((acc, cat) => {
        // Simular dados mensais baseados no total atual
        const monthlyAmount = cat.totalExpense > 0 ? cat.totalExpense / 6 : cat.totalIncome / 6;
        acc[cat.name] = monthlyAmount;
        return acc;
      }, {});
      
      months.push({
        month: monthName,
        ...monthlyData
      });
    }
    
    return months;
  }, [categoryAnalysis]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="tooltip-value" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{data.name}</p>
          <p className="tooltip-value" style={{ color: data.color }}>
            {formatCurrency(data.value)} ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="category-charts">
      <div className="charts-header">
        <h3>Análise Visual das Categorias</h3>
        <p>Visualizações gráficas dos seus gastos e receitas por categoria</p>
      </div>

      <div className="charts-grid">
        {/* Gráfico de Pizza - Distribuição de Despesas */}
        <div className="chart-container pie-chart">
          <div className="chart-header">
            <h4>Distribuição de Despesas</h4>
            <div className="chart-summary">
              <DollarSign size={16} />
              <span>{formatCurrency(totalExpense)}</span>
            </div>
          </div>
          
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="chart-legend">
            {expenseData.slice(0, 5).map((item, index) => (
              <div key={index} className="legend-item">
                <div 
                  className="legend-color" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="legend-label">{item.name}</span>
                <span className="legend-value">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico de Barras - Receitas vs Despesas */}
        <div className="chart-container bar-chart">
          <div className="chart-header">
            <h4>Receitas vs Despesas por Categoria</h4>
            <div className="chart-summary">
              <TrendingUp size={16} />
              <span>{formatCurrency(totalIncome)}</span>
              <TrendingDown size={16} />
              <span>{formatCurrency(totalExpense)}</span>
            </div>
          </div>
          
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="receitas" 
                  name="Receitas" 
                  fill="#10B981" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="despesas" 
                  name="Despesas" 
                  fill="#EF4444" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Estatísticas Resumidas */}
        <div className="chart-container stats-chart">
          <div className="chart-header">
            <h4>Estatísticas Resumidas</h4>
          </div>
          
          <div className="stats-content">
            <div className="stat-item">
              <div className="stat-icon income">
                <TrendingUp size={24} />
              </div>
              <div className="stat-info">
                <h5>Total de Receitas</h5>
                <p className="stat-value positive">{formatCurrency(totalIncome)}</p>
                <p className="stat-detail">
                  {categoryAnalysis.filter(cat => cat.type === 'income').length} categorias
                </p>
              </div>
            </div>
            
            <div className="stat-item">
              <div className="stat-icon expense">
                <TrendingDown size={24} />
              </div>
              <div className="stat-info">
                <h5>Total de Despesas</h5>
                <p className="stat-value negative">{formatCurrency(totalExpense)}</p>
                <p className="stat-detail">
                  {categoryAnalysis.filter(cat => cat.type === 'expense').length} categorias
                </p>
              </div>
            </div>
            
            <div className="stat-item">
              <div className="stat-icon">
                <DollarSign size={24} />
              </div>
              <div className="stat-info">
                <h5>Saldo Líquido</h5>
                <p className={`stat-value ${totalIncome - totalExpense >= 0 ? 'positive' : 'negative'}`}>
                  {formatCurrency(totalIncome - totalExpense)}
                </p>
                <p className="stat-detail">
                  {totalIncome > 0 ? 
                    `${(((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1)}% da receita` : 
                    'Sem receitas registradas'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Top 5 Categorias */}
        <div className="chart-container top-categories">
          <div className="chart-header">
            <h4>Top 5 Categorias</h4>
          </div>
          
          <div className="top-categories-content">
            {categoryAnalysis
              .sort((a, b) => (b.totalExpense + b.totalIncome) - (a.totalExpense + a.totalIncome))
              .slice(0, 5)
              .map((category, index) => (
                <div key={category.id} className="top-category-item">
                  <div className="category-rank">#{index + 1}</div>
                  <div 
                    className="category-color-indicator" 
                    style={{ backgroundColor: category.color }}
                  />
                  <div className="category-details">
                    <h6>{category.name}</h6>
                    <p className="category-type">
                      {category.type === 'income' ? 'Receita' : 'Despesa'}
                    </p>
                  </div>
                  <div className="category-amount">
                    <p className="amount-value">
                      {formatCurrency(category.totalExpense + category.totalIncome)}
                    </p>
                    <p className="amount-detail">
                      {category.totalTransactions} transações
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryCharts;
