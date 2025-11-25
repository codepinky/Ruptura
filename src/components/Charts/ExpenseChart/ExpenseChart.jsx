import React, { useRef, useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Filler
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import './ExpenseChart.css';

// Registrar componentes necessários
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Filler
);

const ExpenseChart = ({ data }) => {
  const chartRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [themeColors, setThemeColors] = useState({
    text: '#1e293b',
    border: '#e2e8f0',
    bgCard: '#ffffff'
  });

  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Ler variáveis CSS do tema atual e acompanhar mudanças de tema
  useEffect(() => {
    const readThemeColors = () => {
      const styles = getComputedStyle(document.documentElement);
      const text = styles.getPropertyValue('--text-primary').trim() || '#1e293b';
      const border = styles.getPropertyValue('--border-primary').trim() || '#e2e8f0';
      const bgCard = styles.getPropertyValue('--bg-card').trim() || '#ffffff';
      setThemeColors({ text, border, bgCard });
    };

    readThemeColors();

    // Observar mudanças na classe do root (.dark/.light)
    const observer = new MutationObserver(readThemeColors);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Paleta de cores minimalista com gradientes sutis (fallback quando categoria não tem cor)
  const COLORS = [
    'rgba(59, 130, 246, 0.8)',   // Azul suave
    'rgba(139, 92, 246, 0.8)',   // Roxo suave
    'rgba(239, 68, 68, 0.8)',    // Vermelho suave
    'rgba(245, 158, 11, 0.8)',   // Amarelo suave
    'rgba(16, 185, 129, 0.8)',   // Verde suave
    'rgba(236, 72, 153, 0.8)',   // Rosa suave
    'rgba(107, 114, 128, 0.8)',  // Cinza suave
    'rgba(20, 184, 166, 0.8)'     // Turquesa suave
  ];

  const BORDER_COLORS = [
    'rgba(59, 130, 246, 1)',
    'rgba(139, 92, 246, 1)',
    'rgba(239, 68, 68, 1)',
    'rgba(245, 158, 11, 1)',
    'rgba(16, 185, 129, 1)',
    'rgba(236, 72, 153, 1)',
    'rgba(107, 114, 128, 1)',
    'rgba(20, 184, 166, 1)'
  ];

  // Função para converter cor HEX para RGBA
  const hexToRgba = (hex, alpha = 0.8) => {
    if (!hex) return null;
    // Remove # se presente
    hex = hex.replace('#', '');
    // Converte para RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Usar cores das categorias se disponíveis, senão usar paleta padrão
  const backgroundColor = data.map((item, index) => {
    if (item.color) {
      return hexToRgba(item.color, 0.8);
    }
    return COLORS[index % COLORS.length];
  });

  const borderColor = data.map((item, index) => {
    if (item.color) {
      return hexToRgba(item.color, 1);
    }
    return BORDER_COLORS[index % BORDER_COLORS.length];
  });

  const hoverBackgroundColor = data.map((item, index) => {
    if (item.color) {
      return hexToRgba(item.color, 1);
    }
    return COLORS[index % COLORS.length].replace('0.8', '1');
  });

  // Preparar dados para Chart.js
  const chartData = {
    labels: data.map(item => item.name),
    datasets: [
      {
        data: data.map(item => item.value),
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 2,
        hoverBackgroundColor: hoverBackgroundColor,
        hoverBorderWidth: 3,
        hoverOffset: 8,
        cutout: isMobile ? '65%' : '55%',
        spacing: 2,
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 1000,
          easing: 'easeInOutQuart'
        }
      }
    ]
  };

  // Configurações do gráfico
  const options = {
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
          color: themeColors.text,
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels?.length && data.datasets?.length) {
              return data.labels.map((label, i) => ({
                text: label,
                fillStyle: data.datasets[0].backgroundColor[i],
                strokeStyle: data.datasets[0].borderColor[i],
                lineWidth: 2,
                pointStyle: 'circle',
                hidden: false,
                index: i
              }));
            }
            return [];
          }
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: themeColors.bgCard,
        titleColor: themeColors.text,
        bodyColor: themeColors.text,
        borderColor: themeColors.border,
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
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed;
            const percentage = data[context.dataIndex]?.percentage || 0;
            
            return [
              label,
              new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(value),
              `${percentage}%`
            ];
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    onHover: (event, activeElements) => {
      if (activeElements.length > 0) {
        setHoveredIndex(activeElements[0].index);
      } else {
        setHoveredIndex(null);
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
      easing: 'easeInOutQuart'
    }
  };

  // Calcular total para exibir
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="expense-chart">
      <div className="chart-header">
        <div className="header-content">
          <h3 className="chart-title">Gastos por Categoria</h3>
          <p className="chart-subtitle">Últimos 30 dias</p>
        </div>
        <div className="chart-summary">
          <span className="total-amount">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(total)}
          </span>
        </div>
      </div>
      
      <div className="chart-container">
        <div className="chart-wrapper">
          <Pie
            ref={chartRef}
            data={chartData}
            options={options}
            className="pie-chart"
          />
        </div>
        
        {/* Legenda mobile */}
        {isMobile && (
          <div className="mobile-legend">
            <div 
              className="legend-scroll"
              onTouchStart={(e) => e.preventDefault()}
              onTouchMove={(e) => e.preventDefault()}
            >
              {data.map((item, index) => {
                // Função para converter cor HEX para RGBA
                const hexToRgba = (hex, alpha = 0.8) => {
                  if (!hex) return COLORS[index % COLORS.length];
                  hex = hex.replace('#', '');
                  const r = parseInt(hex.substring(0, 2), 16);
                  const g = parseInt(hex.substring(2, 4), 16);
                  const b = parseInt(hex.substring(4, 6), 16);
                  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                };
                
                const itemColor = item.color 
                  ? hexToRgba(item.color, 0.8) 
                  : COLORS[index % COLORS.length];
                
                return (
                  <div 
                    key={index}
                    className={`legend-item ${hoveredIndex === index ? 'active' : ''}`}
                    onTouchStart={() => setHoveredIndex(index)}
                    onTouchEnd={() => setHoveredIndex(null)}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <div 
                      className="legend-color"
                      style={{ backgroundColor: itemColor }}
                    />
                  <div className="legend-content">
                    <span className="legend-label">{item.name}</span>
                    <span className="legend-value">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(item.value)}
                    </span>
                    <span className="legend-percentage">{item.percentage}%</span>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseChart;

