import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Tag, FileText, TrendingUp, TrendingDown } from 'lucide-react';
import { useFinancial, TRANSACTION_TYPES } from '../../../context/FinancialContext';
import { useNotification } from '../../../context/NotificationContext';
import './TransactionForm.css';

const TransactionForm = ({ isOpen, onClose, transaction = null }) => {
  const { categories, addTransaction, updateTransaction, transactions } = useFinancial();
  const { success, error } = useNotification();
  
  const [formData, setFormData] = useState({
    description: transaction?.description || '',
    amount: transaction?.amount || '',
    type: transaction?.type || TRANSACTION_TYPES.EXPENSE,
    categoryId: transaction?.categoryId || '',
    date: transaction?.date || new Date().toISOString().split('T')[0],
    notes: transaction?.notes || ''
  });

  const [errors, setErrors] = useState({});

  // Resetar formulário quando abrir ou quando transaction mudar
  useEffect(() => {
    if (isOpen) {
      setFormData({
        description: transaction?.description || '',
        amount: transaction?.amount || '',
        type: transaction?.type || TRANSACTION_TYPES.EXPENSE,
        categoryId: transaction?.categoryId || '',
        date: transaction?.date || new Date().toISOString().split('T')[0],
        notes: transaction?.notes || ''
      });
      setErrors({});
    }
  }, [isOpen, transaction, TRANSACTION_TYPES]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      
      // Se o tipo mudou, resetar a categoria selecionada
      if (name === 'type') {
        newData.categoryId = '';
      }
      
      return newData;
    });
    
    // Limpar erro quando o usuário começar a digitar
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

    if (!formData.amount || formData.amount <= 0) {
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

      if (transaction) {
        // Editar transação existente
        updateTransaction({ ...transactionData, id: transaction.id });
        success('Transação atualizada com sucesso!');
      } else {
        // Adicionar nova transação (o ID será gerado pelo reducer)
        addTransaction(transactionData);
        success('Transação adicionada com sucesso!');
      }

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
      <div className="transaction-form" onClick={(e) => e.stopPropagation()}>
        <div className="form-header">
          <div className="header-content">
            <div className={`type-indicator ${formData.type}`}>
              {formData.type === TRANSACTION_TYPES.INCOME ? (
                <TrendingUp size={20} />
              ) : (
                <TrendingDown size={20} />
              )}
            </div>
            <h2 className="form-title">
              {transaction ? 'Editar Transação' : 'Nova Transação'}
            </h2>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label className="form-label">
              <FileText size={16} />
              Descrição
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`form-input ${errors.description ? 'error' : ''}`}
              placeholder="Ex: Salário, Supermercado, Conta de luz..."
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                <DollarSign size={16} />
                Valor
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className={`form-input ${errors.amount ? 'error' : ''}`}
                placeholder="0,00"
                step="0.01"
                min="0"
              />
              {errors.amount && <span className="error-message">{errors.amount}</span>}
            </div>

          <div className="form-group">
            <label className="form-label">
              <Tag size={16} />
              Tipo de Transação
            </label>
            <div className="type-selector">
              <button
                type="button"
                className={`type-button income ${formData.type === TRANSACTION_TYPES.INCOME ? 'active' : ''}`}
                onClick={() => handleChange({ target: { name: 'type', value: TRANSACTION_TYPES.INCOME } })}
              >
                <TrendingUp size={20} />
                <span>Receita</span>
              </button>
              <button
                type="button"
                className={`type-button expense ${formData.type === TRANSACTION_TYPES.EXPENSE ? 'active' : ''}`}
                onClick={() => handleChange({ target: { name: 'type', value: TRANSACTION_TYPES.EXPENSE } })}
              >
                <TrendingDown size={20} />
                <span>Despesa</span>
              </button>
            </div>
          </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <Tag size={16} />
              Categoria
            </label>
            <div className="category-grid">
              {filteredCategories.map(category => (
                <button
                  key={category.id}
                  type="button"
                  className={`category-button ${formData.categoryId === category.id ? 'active' : ''}`}
                  onClick={() => handleChange({ target: { name: 'categoryId', value: category.id } })}
                  style={{ '--category-color': category.color }}
                >
                  <div className="category-icon" style={{ backgroundColor: category.color }}>
                    <Tag size={16} />
                  </div>
                  <span className="category-name">{category.name}</span>
                </button>
              ))}
            </div>
            {errors.categoryId && <span className="error-message">{errors.categoryId}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">
              <Calendar size={16} />
              Data
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={`form-input ${errors.date ? 'error' : ''}`}
            />
            {errors.date && <span className="error-message">{errors.date}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">
              <FileText size={16} />
              Observações (opcional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="form-textarea"
              placeholder="Adicione observações sobre esta transação..."
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="submit-button">
              {transaction ? 'Atualizar' : 'Adicionar'} Transação
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
