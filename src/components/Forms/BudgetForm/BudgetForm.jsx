import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Wallet, Calendar, DollarSign, Tag } from 'lucide-react';
import { useFinancial } from '../../../context/FinancialContext';
import './BudgetForm.css';

const BudgetForm = ({ isOpen, onClose, budget = null, onSubmit }) => {
  const { categories, TRANSACTION_TYPES } = useFinancial();
  const [formData, setFormData] = useState({
    name: budget?.name || '',
    categoryId: budget?.categoryId || '',
    limit: budget?.limit || '',
    period: budget?.period || 'monthly',
    month: budget?.month !== undefined ? budget.month : new Date().getMonth(),
    year: budget?.year !== undefined ? budget.year : new Date().getFullYear(),
    startDate: budget?.startDate || '',
    endDate: budget?.endDate || ''
  });

  // Atualizar formData quando budget mudar
  useEffect(() => {
    if (budget) {
      setFormData({
        name: budget.name || '',
        categoryId: budget.categoryId || '',
        limit: budget.limit || '',
        period: budget.period || 'monthly',
        month: budget.month !== undefined ? budget.month : new Date().getMonth(),
        year: budget.year !== undefined ? budget.year : new Date().getFullYear(),
        startDate: budget.startDate || '',
        endDate: budget.endDate || ''
      });
    } else {
      const now = new Date();
      setFormData({
        name: '',
        categoryId: '',
        limit: '',
        period: 'monthly',
        month: now.getMonth(),
        year: now.getFullYear(),
        startDate: '',
        endDate: ''
      });
    }
  }, [budget]);

  // Prevenir scroll do body quando modal está aberto
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  const [errors, setErrors] = useState({});

  const periods = [
    { value: 'monthly', label: 'Mensal' },
    { value: 'yearly', label: 'Anual' },
    { value: 'custom', label: 'Personalizado' }
  ];

  const months = [
    { value: 0, label: 'Janeiro' },
    { value: 1, label: 'Fevereiro' },
    { value: 2, label: 'Março' },
    { value: 3, label: 'Abril' },
    { value: 4, label: 'Maio' },
    { value: 5, label: 'Junho' },
    { value: 6, label: 'Julho' },
    { value: 7, label: 'Agosto' },
    { value: 8, label: 'Setembro' },
    { value: 9, label: 'Outubro' },
    { value: 10, label: 'Novembro' },
    { value: 11, label: 'Dezembro' }
  ];

  const expenseCategories = categories.filter(c => c.type === TRANSACTION_TYPES.EXPENSE);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome do orçamento é obrigatório';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Categoria é obrigatória';
    }

    if (!formData.limit || formData.limit <= 0) {
      newErrors.limit = 'Limite deve ser maior que zero';
    }

    if (formData.period === 'monthly' && (formData.month === '' || formData.year === '')) {
      if (formData.month === '') newErrors.month = 'Mês é obrigatório';
      if (formData.year === '') newErrors.year = 'Ano é obrigatório';
    }

    if (formData.period === 'yearly' && !formData.year) {
      newErrors.year = 'Ano é obrigatório';
    }

    if (formData.period === 'custom') {
      if (!formData.startDate) {
        newErrors.startDate = 'Data de início é obrigatória';
      }
      if (!formData.endDate) {
        newErrors.endDate = 'Data de término é obrigatória';
      }
      if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
        newErrors.endDate = 'Data de término deve ser posterior à data de início';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const budgetData = {
      name: formData.name.trim(),
      categoryId: parseInt(formData.categoryId),
      limit: parseFloat(formData.limit),
      period: formData.period,
      ...(formData.period === 'monthly' && {
        month: parseInt(formData.month),
        year: parseInt(formData.year)
      }),
      ...(formData.period === 'yearly' && {
        year: parseInt(formData.year)
      }),
      ...(formData.period === 'custom' && {
        startDate: formData.startDate,
        endDate: formData.endDate
      })
    };

    if (onSubmit) {
      onSubmit(budgetData);
    }
    onClose();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="modal-overlay" onClick={onClose}>
      <div className="budget-form" onClick={(e) => e.stopPropagation()}>
        <div className="form-header">
          <h2 className="form-title">
            {budget ? 'Editar Orçamento' : 'Novo Orçamento'}
          </h2>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label className="form-label">
              <Wallet size={16} />
              Nome do Orçamento
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="Ex: Orçamento de Alimentação, Projeto Casa..."
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">
              <Tag size={16} />
              Categoria
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className={`form-select ${errors.categoryId ? 'error' : ''}`}
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
            <label className="form-label">
              <DollarSign size={16} />
              Limite do Orçamento
            </label>
            <input
              type="number"
              name="limit"
              value={formData.limit}
              onChange={handleChange}
              className={`form-input ${errors.limit ? 'error' : ''}`}
              placeholder="0,00"
              step="0.01"
              min="0"
            />
            {errors.limit && <span className="error-message">{errors.limit}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">
              <Calendar size={16} />
              Período
            </label>
            <select
              name="period"
              value={formData.period}
              onChange={handleChange}
              className="form-select"
            >
              {periods.map(period => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>

          {formData.period === 'monthly' && (
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Mês</label>
                <select
                  name="month"
                  value={formData.month}
                  onChange={handleChange}
                  className={`form-select ${errors.month ? 'error' : ''}`}
                >
                  {months.map(month => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
                {errors.month && <span className="error-message">{errors.month}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Ano</label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className={`form-input ${errors.year ? 'error' : ''}`}
                  min="2020"
                  max="2100"
                />
                {errors.year && <span className="error-message">{errors.year}</span>}
              </div>
            </div>
          )}

          {formData.period === 'yearly' && (
            <div className="form-group">
              <label className="form-label">Ano</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                className={`form-input ${errors.year ? 'error' : ''}`}
                min="2020"
                max="2100"
              />
              {errors.year && <span className="error-message">{errors.year}</span>}
            </div>
          )}

          {formData.period === 'custom' && (
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Data de Início</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={`form-input ${errors.startDate ? 'error' : ''}`}
                />
                {errors.startDate && <span className="error-message">{errors.startDate}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Data de Término</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={`form-input ${errors.endDate ? 'error' : ''}`}
                  min={formData.startDate}
                />
                {errors.endDate && <span className="error-message">{errors.endDate}</span>}
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="submit-button">
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
