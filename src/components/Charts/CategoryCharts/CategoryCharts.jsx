import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart } from 'lucide-react';
import './CategoryCharts.css';

// Registrar componentes necessários
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

const CategoryCharts = ({ categoryAnalysis, totalIncome, totalExpense }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [activeView, setActiveView] = useState('pie');
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const containerRef = useRef(null);

  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Função para formatar moeda
  const formatCurrency = useCallback((value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }, []);

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

  // Preparar dados para gráfico de barras
  const barData = categoryAnalysis
    .filter(cat => (cat.type === 'income' && cat.totalIncome > 0) || (cat.type === 'expense' && cat.totalExpense > 0))
    .map(cat => ({
      name: cat.name,
      receitas: cat.totalIncome || 0,
      despesas: cat.totalExpense || 0,
      color: cat.color,
      type: cat.type
    }))
    .sort((a, b) => (b.receitas + b.despesas) - (a.receitas + a.despesas))
    .slice(0, 8);

  // Configuração do gráfico de pizza
  const pieChartData = {
    labels: expenseData.map(item => item.name),
    datasets: [
      {
        data: expenseData.map(item => item.value),
        backgroundColor: expenseData.map(item => item.color + '80'),
        borderColor: expenseData.map(item => item.color),
        borderWidth: 2,
        hoverBackgroundColor: expenseData.map(item => item.color),
        hoverBorderWidth: 3,
        hoverOffset: 8,
        cutout: isMobile ? '65%' : '55%',
        spacing: 2
      }
    ]
  };

  // Configuração do gráfico de barras
  const barChartData = {
    labels: barData.map(item => item.name),
    datasets: [
      {
        label: 'Receitas',
        data: barData.map(item => item.receitas),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'Despesas',
        data: barData.map(item => item.despesas),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      }
    ]
  };

  // Opções comuns para tooltips
  const commonTooltipOptions = {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    titleColor: 'var(--text-primary)',
    bodyColor: 'var(--text-primary)',
    borderColor: 'var(--border-primary)',
    borderWidth: 1,
    cornerRadius: 12,
    displayColors: true,
    padding: 12,
    titleFont: {
      size: 14,
      weight: '600'
    },
    bodyFont: {
      size: 13,
      weight: '500'
    }
  };

  // Opções do gráfico de pizza
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: !isMobile,
        position: 'right',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 15,
          font: {
            size: isMobile ? 11 : 12,
            weight: '500'
          },
          color: 'var(--text-primary)'
        }
      },
      tooltip: {
        ...commonTooltipOptions,
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed;
            const percentage = expenseData[context.dataIndex]?.percentage || 0;
            
            return [
              label,
              formatCurrency(value),
              `${percentage}%`
            ];
          }
        }
      }
    },
    onHover: (event, activeElements) => {
      if (activeElements.length > 0) {
        setHoveredCategory(activeElements[0].index);
      } else {
        setHoveredCategory(null);
      }
    }
  };

  // Opções do gráfico de barras
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          pointStyle: 'rect',
          padding: 20,
          font: {
            size: isMobile ? 11 : 12,
            weight: '500'
          },
          color: 'var(--text-primary)'
        }
      },
      tooltip: {
        ...commonTooltipOptions,
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${formatCurrency(value)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: 'var(--text-secondary)',
          font: {
            size: isMobile ? 10 : 12,
            weight: '500'
          },
          maxRotation: isMobile ? 45 : 0
        }
      },
      y: {
        grid: {
          color: 'rgba(226, 232, 240, 0.3)',
          lineWidth: 1
        },
        ticks: {
          color: 'var(--text-secondary)',
          font: {
            size: isMobile ? 10 : 12,
            weight: '500'
          },
          callback: function(value) {
            if (isMobile && Math.abs(value) >= 1000) {
              return `${(value / 1000).toFixed(1)}k`;
            }
            return formatCurrency(value);
          }
        }
      }
    }
  };

  // Handlers para swipe mobile
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && activeView === 'pie') {
      setActiveView('bar');
    }
    if (isRightSwipe && activeView === 'bar') {
      setActiveView('pie');
    }
  };

  // Calcular estatísticas
  const stats = React.useMemo(() => {
    const incomeCategories = categoryAnalysis.filter(cat => cat.type === 'income').length;
    const expenseCategories = categoryAnalysis.filter(cat => cat.type === 'expense').length;
    const netBalance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? ((netBalance / totalIncome) * 100).toFixed(1) : 0;

    return {
      incomeCategories,
      expenseCategories,
      netBalance,
      savingsRate
    };
  }, [categoryAnalysis, totalIncome, totalExpense]);

  // Top 5 categorias
  const topCategories = categoryAnalysis
    .sort((a, b) => (b.totalExpense + b.totalIncome) - (a.totalExpense + a.totalIncome))
    .slice(0, 5);

  return (
    <div className="category-charts">
      <div className="charts-header">
        <h3>Análise Visual das Categorias</h3>
        <p>Visualizações gráficas dos seus gastos e receitas por categoria</p>
      </div>

      <div className="charts-grid">
        {/* Controles de visualização mobile */}
        {isMobile && (
          <div className="view-controls">
            <button 
              className={`view-button ${activeView === 'pie' ? 'active' : ''}`}
              onClick={() => setActiveView('pie')}
            >
              <PieChart size={16} />
              <span>Pizza</span>
            </button>
            <button 
              className={`view-button ${activeView === 'bar' ? 'active' : ''}`}
              onClick={() => setActiveView('bar')}
            >
              <BarChart3 size={16} />
              <span>Barras</span>
            </button>
          </div>
        )}

        {/* Gráfico de Pizza */}
        <div className={`chart-container pie-chart ${isMobile && activeView !== 'pie' ? 'hidden' : ''}`}>
          <div className="chart-header">
            <h4>Distribuição de Despesas</h4>
            <div className="chart-summary">
              <DollarSign size={16} />
              <span>{formatCurrency(totalExpense)}</span>
            </div>
          </div>
          
          <div className="chart-content">
            <div className="chart-wrapper">
              <Pie
                data={pieChartData}
                options={pieOptions}
                className="pie-chart-component"
              />
            </div>
          </div>
          
          {/* Legenda mobile para pizza */}
          {isMobile && (
            <div className="mobile-legend">
              <div 
                className="legend-scroll"
                onTouchStart={(e) => e.preventDefault()}
                onTouchMove={(e) => e.preventDefault()}
              >
                {expenseData.slice(0, 5).map((item, index) => (
                  <div 
                    key={index}
                    className={`legend-item ${hoveredCategory === index ? 'active' : ''}`}
                    onTouchStart={() => setHoveredCategory(index)}
                    onTouchEnd={() => setHoveredCategory(null)}
                    onMouseEnter={() => setHoveredCategory(index)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    <div 
                      className="legend-color"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="legend-content">
                      <span className="legend-label">{item.name}</span>
                      <span className="legend-value">{formatCurrency(item.value)}</span>
                      <span className="legend-percentage">{item.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Gráfico de Barras */}
        <div className={`chart-container bar-chart ${isMobile && activeView !== 'bar' ? 'hidden' : ''}`}>
          <div className="chart-header">
            <h4>Receitas vs Despesas</h4>
            <div className="chart-summary">
              <TrendingUp size={16} />
              <span>{formatCurrency(totalIncome)}</span>
              <TrendingDown size={16} />
              <span>{formatCurrency(totalExpense)}</span>
            </div>
          </div>
          
          <div className="chart-content">
            <div className="chart-wrapper">
              <Bar
                data={barChartData}
                options={barOptions}
                className="bar-chart-component"
              />
            </div>
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
                  {stats.incomeCategories} categorias
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
                  {stats.expenseCategories} categorias
                </p>
              </div>
            </div>
            
            <div className="stat-item">
              <div className="stat-icon">
                <DollarSign size={24} />
              </div>
              <div className="stat-info">
                <h5>Saldo Líquido</h5>
                <p className={`stat-value ${stats.netBalance >= 0 ? 'positive' : 'negative'}`}>
                  {formatCurrency(stats.netBalance)}
                </p>
                <p className="stat-detail">
                  {stats.savingsRate}% da receita
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
            {topCategories.map((category, index) => (
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
