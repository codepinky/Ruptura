import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import './BalanceChart.css';

// Registrar componentes necessários
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const BalanceChart = ({ data }) => {
  const chartRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState(0);

  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Função para formatar datas
  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    if (isMobile) {
      return `${date.getDate()}/${date.getMonth() + 1}`;
    }
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  }, [isMobile]);

  // Função para formatar valores
  const formatValue = useCallback((value) => {
    if (isMobile && Math.abs(value) >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }, [isMobile]);

  // Preparar dados para Chart.js
  const chartData = {
    labels: data.map(item => formatDate(item.date)),
    datasets: [
      {
        label: 'Saldo',
        data: data.map(item => item.balance),
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 3,
        pointHoverRadius: 10,
        animation: {
          duration: 2000,
          easing: 'easeInOutQuart'
        }
      }
    ]
  };

  // Configurações do gráfico
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index'
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
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
        },
        callbacks: {
          title: (context) => {
            return context[0].label;
          },
          label: (context) => {
            const value = context.parsed.y;
            return `Saldo: ${formatValue(value)}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: true,
          color: 'rgba(226, 232, 240, 0.3)',
          lineWidth: 1,
          drawBorder: false
        },
        ticks: {
          color: 'var(--text-secondary)',
          font: {
            size: isMobile ? 10 : 12,
            weight: '500'
          },
          maxTicksLimit: isMobile ? 8 : 12,
          callback: function(value, index) {
            // Mostrar apenas alguns ticks em mobile
            if (isMobile && data.length > 8) {
              const step = Math.ceil(data.length / 8);
              return index % step === 0 ? this.getLabelForValue(value) : '';
            }
            return this.getLabelForValue(value);
          }
        },
        border: {
          display: false
        }
      },
      y: {
        display: true,
        grid: {
          display: true,
          color: 'rgba(226, 232, 240, 0.3)',
          lineWidth: 1,
          drawBorder: false
        },
        ticks: {
          color: 'var(--text-secondary)',
          font: {
            size: isMobile ? 10 : 12,
            weight: '500'
          },
          callback: function(value) {
            return formatValue(value);
          }
        },
        border: {
          display: false
        }
      }
    },
    onHover: (event, activeElements) => {
      if (activeElements.length > 0) {
        setHoveredPoint(activeElements[0].index);
      } else {
        setHoveredPoint(null);
      }
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart',
      delay: (context) => {
        return context.type === 'data' && context.mode === 'default' ? context.dataIndex * 50 : 0;
      }
    }
  };

  // Calcular estatísticas
  const stats = React.useMemo(() => {
    const values = data.map(item => item.balance);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const current = values[values.length - 1];
    const previous = values[values.length - 2] || 0;
    const change = previous !== 0 ? ((current - previous) / Math.abs(previous)) * 100 : 0;
    
    return { min, max, current, change };
  }, [data]);

  // Handlers para gestos mobile
  const handleTouchStart = useCallback((e) => {
    if (!isMobile) return;
    // Implementar pinch-to-zoom e pan em versão futura
  }, [isMobile]);

  return (
    <div className="balance-chart">
      <div className="chart-header">
        <div className="header-content">
          <h3 className="chart-title">Evolução do Saldo</h3>
          <p className="chart-subtitle">Últimos 30 dias</p>
        </div>
        <div className="chart-summary">
          <div className="summary-item">
            <span className="summary-label">Atual</span>
            <span className={`summary-value ${stats.current >= 0 ? 'positive' : 'negative'}`}>
              {formatValue(stats.current)}
            </span>
          </div>
          {stats.change !== 0 && (
            <div className="summary-item">
              <span className="summary-label">Variação</span>
              <span className={`summary-change ${stats.change >= 0 ? 'positive' : 'negative'}`}>
                {stats.change >= 0 ? '+' : ''}{stats.change.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="chart-container">
        <div className="chart-wrapper" onTouchStart={handleTouchStart}>
          <Line
            ref={chartRef}
            data={chartData}
            options={options}
            className="line-chart"
          />
        </div>
        
        {/* Indicadores de pontos importantes */}
        <div className="chart-indicators">
          <div className="indicator-item">
            <div className="indicator-dot min" />
            <span className="indicator-label">Mínimo</span>
            <span className="indicator-value">{formatValue(stats.min)}</span>
          </div>
          <div className="indicator-item">
            <div className="indicator-dot max" />
            <span className="indicator-label">Máximo</span>
            <span className="indicator-value">{formatValue(stats.max)}</span>
          </div>
        </div>
      </div>
      
      {/* Instruções mobile */}
      {isMobile && (
        <div className="mobile-instructions">
          <p>Toque e arraste para navegar • Pinch para ampliar</p>
        </div>
      )}
    </div>
  );
};

export default BalanceChart;

