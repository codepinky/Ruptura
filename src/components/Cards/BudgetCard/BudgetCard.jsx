import React from 'react';
import { Edit3, Trash2, Copy, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import './BudgetCard.css';

const BudgetCard = ({ budget, category, spent, onEdit, onDelete, onDuplicate }) => {
  const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
  const remaining = Math.max(0, budget.limit - spent);
  const isExceeded = percentage > 100;
  const isWarning = percentage >= 80 && percentage <= 100;
  const isGood = percentage < 80;

  const getStatusColor = () => {
    if (isExceeded) return '#EF4444';
    if (isWarning) return '#F59E0B';
    return '#10B981';
  };

  const getStatusIcon = () => {
    if (isExceeded) return AlertCircle;
    if (isWarning) return Clock;
    return CheckCircle;
  };

  const getStatusText = () => {
    if (isExceeded) return 'Excedido';
    if (isWarning) return 'Atenção';
    return 'Dentro do limite';
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatPeriod = () => {
    if (budget.period === 'monthly' && budget.month !== undefined && budget.year !== undefined) {
      const date = new Date(budget.year, budget.month);
      return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    }
    if (budget.period === 'yearly' && budget.year !== undefined) {
      return budget.year.toString();
    }
    if (budget.period === 'custom' && budget.startDate && budget.endDate) {
      const start = new Date(budget.startDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      const end = new Date(budget.endDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
      return `${start} - ${end}`;
    }
    return '';
  };

  const StatusIcon = getStatusIcon();
  const statusColor = getStatusColor();

  return (
    <div className={`budget-card ${isExceeded ? 'exceeded' : isWarning ? 'warning' : 'good'}`}>
      <div className="budget-card-header">
        <div className="budget-category-info">
          <div 
            className="budget-category-color" 
            style={{ backgroundColor: category?.color || '#64748B' }}
          />
          <div className="budget-category-details">
            <h3 className="budget-category-name">{budget.name || category?.name || 'Sem categoria'}</h3>
            <span className="budget-period">{budget.name && category ? category.name : formatPeriod()}</span>
          </div>
        </div>
        <div className="budget-status-badge" style={{ backgroundColor: `${statusColor}15`, color: statusColor }}>
          <StatusIcon size={14} />
          <span>{getStatusText()}</span>
        </div>
      </div>

      <div className="budget-card-body">
        <div className="budget-amounts">
          <div className="budget-amount-item">
            <span className="budget-amount-label">Orçado</span>
            <span className="budget-amount-value">{formatCurrency(budget.limit)}</span>
          </div>
          <div className="budget-amount-item">
            <span className="budget-amount-label">Gasto</span>
            <span className={`budget-amount-value ${isExceeded ? 'exceeded' : ''}`}>
              {formatCurrency(spent)}
            </span>
          </div>
          <div className="budget-amount-item">
            <span className="budget-amount-label">Restante</span>
            <span className={`budget-amount-value ${remaining > 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(remaining)}
            </span>
          </div>
        </div>

        <div className="budget-progress">
          <div className="budget-progress-header">
            <span className="budget-progress-label">Progresso</span>
            <span className="budget-progress-percentage" style={{ color: statusColor }}>
              {percentage.toFixed(1)}%
            </span>
          </div>
          <div className="budget-progress-bar-container">
            <div 
              className="budget-progress-bar"
              style={{ 
                width: `${Math.min(100, percentage)}%`,
                backgroundColor: statusColor
              }}
            />
          </div>
        </div>
      </div>

      <div className="budget-card-actions">
        <button 
          className="budget-action-btn edit"
          onClick={() => onEdit(budget)}
          title="Editar orçamento"
        >
          <Edit3 size={16} />
        </button>
        <button 
          className="budget-action-btn duplicate"
          onClick={() => onDuplicate(budget)}
          title="Duplicar orçamento"
        >
          <Copy size={16} />
        </button>
        <button 
          className="budget-action-btn delete"
          onClick={() => onDelete(budget.id)}
          title="Excluir orçamento"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default BudgetCard;

