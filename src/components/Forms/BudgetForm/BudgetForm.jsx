import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Tag, DollarSign, Calendar, Bell, FileText, ChevronDown } from 'lucide-react';
import { useFinancial, TRANSACTION_TYPES } from '../../../context/FinancialContext';
import './BudgetForm.css';

const BudgetForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  budget = null
}) => {
  const { categories } = useFinancial();

  const [formData, setFormData] = useState({
    categoryId: '',
    limit: '',
    period: 'monthly',
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    startDate: '',
    endDate: '',
    alertsEnabled: true,
    notes: ''
  });

  const [errors, setErrors] = useState({});

  // Filtrar apenas categorias de despesas
  const expenseCategories = categories.filter(c => c.type === TRANSACTION_TYPES.EXPENSE);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (budget) {
      setFormData({
        categoryId: budget.categoryId || '',
        limit: budget.limit || '',
        period: budget.period || 'monthly',
        month: budget.month !== undefined ? budget.month : new Date().getMonth(),
        year: budget.year || new Date().getFullYear(),
        startDate: budget.startDate || '',
        endDate: budget.endDate || '',
        alertsEnabled: budget.alertsEnabled !== undefined ? budget.alertsEnabled : true,
        notes: budget.notes || ''
      });
    } else {
      const now = new Date();
      setFormData({
        categoryId: '',
        limit: '',
        period: 'monthly',
        month: now.getMonth(),
        year: now.getFullYear(),
        startDate: '',
        endDate: '',
        alertsEnabled: true,
        notes: ''
      });
    }
    setErrors({});
  }, [budget, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.categoryId) {
      newErrors.categoryId = 'Selecione uma categoria';
    }

    if (!formData.limit || parseFloat(formData.limit) <= 0) {
      newErrors.limit = 'O valor limite deve ser maior que zero';
    }

    if (formData.period === 'custom') {
      if (!formData.startDate) {
        newErrors.startDate = 'Data inicial é obrigatória';
      }
      if (!formData.endDate) {
        newErrors.endDate = 'Data final é obrigatória';
      }
      if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
        newErrors.endDate = 'Data final deve ser posterior à data inicial';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const budgetData = {
        categoryId: parseInt(formData.categoryId),
        limit: parseFloat(formData.limit),
        period: formData.period,
        alertsEnabled: formData.alertsEnabled,
        notes: formData.notes.trim()
      };

      if (formData.period === 'monthly') {
        budgetData.month = parseInt(formData.month);
        budgetData.year = parseInt(formData.year);
      } else if (formData.period === 'yearly') {
        budgetData.year = parseInt(formData.year);
      } else if (formData.period === 'custom') {
        budgetData.startDate = formData.startDate;
        budgetData.endDate = formData.endDate;
      }

      onSubmit(budgetData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      categoryId: '',
      limit: '',
      period: 'monthly',
      month: new Date().getMonth(),
      year: new Date().getFullYear(),
      startDate: '',
      endDate: '',
      alertsEnabled: true,
      notes: ''
    });
    setErrors({});
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  if (!isOpen) return null;

  const modalContent = (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {budget ? 'Editar Orçamento' : 'Novo Orçamento'}
          </h2>
          <button className="close-button" onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="budget-form">
          <div className="form-group">
            <label htmlFor="categoryId" className="form-label">
              <Tag size={20} />
              Categoria
            </label>
            <select
              id="categoryId"
              value={formData.categoryId}
              onChange={(e) => handleInputChange('categoryId', e.target.value)}
              className={`form-input form-select ${errors.categoryId ? 'error' : ''}`}
            >
              <option value="">Selecione uma categoria</option>
              {expenseCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <span className="error-message">{errors.categoryId}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="limit" className="form-label">
              <DollarSign size={20} />
              Valor Limite
            </label>
            <input
              type="number"
              id="limit"
              value={formData.limit}
              onChange={(e) => handleInputChange('limit', e.target.value)}
              className={`form-input ${errors.limit ? 'error' : ''}`}
              placeholder="0.00"
              step="0.01"
              min="0.01"
            />
            {errors.limit && <span className="error-message">{errors.limit}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="period" className="form-label">
              <Calendar size={20} />
              Período
            </label>
            <div className="period-options">
              <label className={`period-option ${formData.period === 'monthly' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="period"
                  value="monthly"
                  checked={formData.period === 'monthly'}
                  onChange={(e) => handleInputChange('period', e.target.value)}
                />
                <div className="option-content">
                  <span className="option-title">Mensal</span>
                  <span className="option-description">Por mês</span>
                </div>
              </label>
              
              <label className={`period-option ${formData.period === 'yearly' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="period"
                  value="yearly"
                  checked={formData.period === 'yearly'}
                  onChange={(e) => handleInputChange('period', e.target.value)}
                />
                <div className="option-content">
                  <span className="option-title">Anual</span>
                  <span className="option-description">Por ano</span>
                </div>
              </label>
              
              <label className={`period-option ${formData.period === 'custom' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="period"
                  value="custom"
                  checked={formData.period === 'custom'}
                  onChange={(e) => handleInputChange('period', e.target.value)}
                />
                <div className="option-content">
                  <span className="option-title">Personalizado</span>
                  <span className="option-description">Período customizado</span>
                </div>
              </label>
            </div>
          </div>

          {formData.period === 'monthly' && (
            <div className="form-group">
              <div className="form-row">
                <div className="form-col">
                  <label htmlFor="month" className="form-label-small">Mês</label>
                  <select
                    id="month"
                    value={formData.month}
                    onChange={(e) => handleInputChange('month', parseInt(e.target.value))}
                    className="form-input form-select"
                  >
                    {months.map((month, index) => (
                      <option key={index} value={index}>{month}</option>
                    ))}
                  </select>
                </div>
                <div className="form-col">
                  <label htmlFor="year" className="form-label-small">Ano</label>
                  <select
                    id="year"
                    value={formData.year}
                    onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                    className="form-input form-select"
                  >
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {formData.period === 'yearly' && (
            <div className="form-group">
              <label htmlFor="year" className="form-label">
                <Calendar size={20} />
                Ano
              </label>
              <select
                id="year"
                value={formData.year}
                onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                className="form-input form-select"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          )}

          {formData.period === 'custom' && (
            <div className="form-group">
              <div className="form-row">
                <div className="form-col">
                  <label htmlFor="startDate" className="form-label-small">Data Inicial</label>
                  <input
                    type="date"
                    id="startDate"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className={`form-input ${errors.startDate ? 'error' : ''}`}
                  />
                  {errors.startDate && <span className="error-message">{errors.startDate}</span>}
                </div>
                <div className="form-col">
                  <label htmlFor="endDate" className="form-label-small">Data Final</label>
                  <input
                    type="date"
                    id="endDate"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className={`form-input ${errors.endDate ? 'error' : ''}`}
                  />
                  {errors.endDate && <span className="error-message">{errors.endDate}</span>}
                </div>
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              <Bell size={20} />
              Notificações
            </label>
            <div className="switch-container">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={formData.alertsEnabled}
                  onChange={(e) => handleInputChange('alertsEnabled', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
              <span className="switch-label">
                Receber alertas quando próximo ou exceder o limite
              </span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes" className="form-label">
              <FileText size={20} />
              Observações (Opcional)
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="form-input form-textarea"
              placeholder="Adicione observações sobre este orçamento..."
              rows="3"
              maxLength={500}
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handleClose}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
            >
              {budget ? 'Atualizar' : 'Criar'} Orçamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default BudgetForm;

