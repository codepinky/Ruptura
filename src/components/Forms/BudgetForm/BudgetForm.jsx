import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Tag, DollarSign, Calendar, FileText, Briefcase } from 'lucide-react';
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
    budgetType: 'project', // 'project' ou 'category'
    name: '',
    categoryId: '',
    limit: '',
    period: 'monthly',
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    startDate: '',
    endDate: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  // Filtrar apenas categorias de despesas
  const expenseCategories = categories.filter(c => c.type === TRANSACTION_TYPES.EXPENSE);

  // Prevenir scroll do body quando modal está aberto
  useEffect(() => {
    if (isOpen) {
      // Salvar o scroll atual e desabilitar scroll
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Restaurar scroll quando modal fechar
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
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
        budgetType: budget.name ? 'project' : 'category',
        name: budget.name || '',
        categoryId: budget.categoryId || '',
        limit: budget.limit || '',
        period: budget.period || 'monthly',
        month: budget.month !== undefined ? budget.month : new Date().getMonth(),
        year: budget.year || new Date().getFullYear(),
        startDate: budget.startDate || '',
        endDate: budget.endDate || '',
        notes: budget.notes || ''
      });
    } else {
      const now = new Date();
      setFormData({
        budgetType: 'project',
        name: '',
        categoryId: '',
        limit: '',
        period: 'monthly',
        month: now.getMonth(),
        year: now.getFullYear(),
        startDate: '',
        endDate: '',
        notes: ''
      });
    }
    setErrors({});
  }, [budget, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      
      // Se mudou o tipo para 'category', limpar o nome
      if (field === 'budgetType' && value === 'category') {
        newData.name = '';
      }
      
      return newData;
    });
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.budgetType === 'project' && (!formData.name || formData.name.trim() === '')) {
      newErrors.name = 'Nome do projeto é obrigatório';
    }

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
        name: formData.name.trim() || undefined,
        categoryId: parseInt(formData.categoryId),
        limit: parseFloat(formData.limit),
        period: formData.period,
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
        budgetType: 'project',
        name: '',
        categoryId: '',
        limit: '',
        period: 'monthly',
        month: new Date().getMonth(),
        year: new Date().getFullYear(),
        startDate: '',
        endDate: '',
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
      <div className="budget-form" onClick={(e) => e.stopPropagation()}>
        <div className="form-header">
          <h2 className="form-title">
            {budget ? 'Editar Orçamento' : 'Novo Orçamento'}
          </h2>
          <button className="close-button" onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label className="form-label">
              <Briefcase size={20} />
              Tipo de Orçamento
            </label>
            <div className="budget-type-options">
              <label className={`budget-type-option ${formData.budgetType === 'project' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="budgetType"
                  value="project"
                  checked={formData.budgetType === 'project'}
                  onChange={(e) => handleInputChange('budgetType', e.target.value)}
                />
                <div className="option-content">
                  <span className="option-title">Projeto Específico</span>
                  <span className="option-description">Reforma, viagem, evento...</span>
                </div>
              </label>
              
              <label className={`budget-type-option ${formData.budgetType === 'category' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="budgetType"
                  value="category"
                  checked={formData.budgetType === 'category'}
                  onChange={(e) => handleInputChange('budgetType', e.target.value)}
                />
                <div className="option-content">
                  <span className="option-title">Limite por Categoria</span>
                  <span className="option-description">Controle de gastos mensais</span>
                </div>
              </label>
            </div>
          </div>

          {formData.budgetType === 'project' && (
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                <Briefcase size={20} />
                Nome do Projeto
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="Ex: Reforma da Cozinha, Viagem para Europa..."
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>
          )}

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
              className="cancel-button" 
              onClick={handleClose}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="submit-button"
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

