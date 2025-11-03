import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, Tag, FileText } from 'lucide-react';
import { useFinancial, TRANSACTION_TYPES } from '../../context/FinancialContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotification } from '../../context/NotificationContext';
import './SimpleTransactionForm.css';

const SimpleTransactionForm = ({ isOpen, onClose }) => {
  const { categories, addTransaction, transactions } = useFinancial();
  const { currentTheme } = useTheme();
  const { success, error } = useNotification();
  
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: TRANSACTION_TYPES.EXPENSE,
    categoryId: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [errors, setErrors] = useState({});

  // Resetar formulário quando abrir
  useEffect(() => {
    if (isOpen) {
      setFormData({
        description: '',
        amount: '',
        type: TRANSACTION_TYPES.EXPENSE,
        categoryId: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      setErrors({});
      
      // Prevenir scroll do body quando modal estiver aberto
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      
      // Foco inicial no primeiro campo (acessibilidade)
      const firstInput = document.querySelector('.simple-form input[type="text"]');
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
      }
      
      // ESC para fechar
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    } else {
      // Restaurar scroll do body quando modal fechar
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    
    // Cleanup quando componente desmontar
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen, onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erro quando usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero';
    }
    
    if (!formData.categoryId) {
      newErrors.categoryId = 'Categoria é obrigatória';
    }
    
    if (!formData.date) {
      newErrors.date = 'Data é obrigatória';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const transactionData = {
        description: formData.description,
        amount: parseFloat(formData.amount),
        type: formData.type,
        categoryId: parseInt(formData.categoryId),
        date: formData.date,
        notes: formData.notes || ''
      };

      // Adicionar nova transação (o ID será gerado pelo reducer)
      addTransaction(transactionData);
      success('Transação adicionada com sucesso!');
      onClose();
    } catch (err) {
      error('Erro ao salvar transação. Tente novamente.');
      console.error('Erro ao salvar transação:', err);
    }
  };

  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`simple-form ${currentTheme === 'dark' ? 'dark-theme' : 'light-theme'}`} onClick={(e) => e.stopPropagation()}>
        <div className="form-header">
          <h2>Nova Transação</h2>
          <button 
            className="close-btn" 
            onClick={onClose}
            aria-label="Fechar formulário"
            type="button"
          >
            <X size={24} aria-hidden="true" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="form-content">
          <div className="form-group">
            <label>
              <DollarSign size={16} />
              Descrição *
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Ex: Supermercado, Salário..."
              className={errors.description ? 'error' : ''}
              aria-describedby={errors.description ? 'description-error' : undefined}
              autoComplete="off"
            />
            {errors.description && <span id="description-error" className="error" role="alert">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label>
              <DollarSign size={16} />
              Valor *
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0,00"
              step="0.01"
              min="0"
              inputMode="decimal"
              className={errors.amount ? 'error' : ''}
              aria-describedby={errors.amount ? 'amount-error' : undefined}
            />
            {errors.amount && <span id="amount-error" className="error" role="alert">{errors.amount}</span>}
          </div>

          <div className="form-group">
            <label>
              <Tag size={16} />
              Tipo *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
            >
              <option value={TRANSACTION_TYPES.EXPENSE}>Despesa</option>
              <option value={TRANSACTION_TYPES.INCOME}>Receita</option>
            </select>
          </div>

          <div className="form-group">
            <label>
              <Tag size={16} />
              Categoria *
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className={errors.categoryId ? 'error' : ''}
              aria-describedby={errors.categoryId ? 'category-error' : undefined}
            >
              <option value="">Selecione uma categoria</option>
              {filteredCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <span id="category-error" className="error" role="alert">{errors.categoryId}</span>}
          </div>

          <div className="form-group">
            <label>
              <Calendar size={16} />
              Data *
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={errors.date ? 'error' : ''}
              aria-describedby={errors.date ? 'date-error' : undefined}
            />
            {errors.date && <span id="date-error" className="error" role="alert">{errors.date}</span>}
          </div>

          <div className="form-group">
            <label>
              <FileText size={16} />
              Observações
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Observações opcionais..."
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancelar
            </button>
            <button type="submit" className="submit-btn">
              Adicionar Transação
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SimpleTransactionForm;
