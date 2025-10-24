import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Tag, FileText } from 'lucide-react';
import { useFinancial, TRANSACTION_TYPES } from '../../../context/FinancialContext';
import './TransactionForm.css';

const TransactionForm = ({ isOpen, onClose, transaction = null }) => {
  const { categories, addTransaction, updateTransaction } = useFinancial();
  
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

    const transactionData = {
      ...formData,
      amount: parseFloat(formData.amount),
      categoryId: parseInt(formData.categoryId),
      id: transaction?.id || Date.now()
    };

    if (transaction) {
      updateTransaction(transactionData);
    } else {
      addTransaction(transactionData);
    }

    onClose();
  };

  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  // Debug: verificar se as categorias estão sendo carregadas
  useEffect(() => {
    if (isOpen) {
      console.log('Categorias disponíveis:', categories);
      console.log('Tipo selecionado:', formData.type);
      console.log('Categorias filtradas:', filteredCategories);
    }
  }, [isOpen, categories, formData.type, filteredCategories]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="transaction-form" onClick={(e) => e.stopPropagation()}>
        <div className="form-header">
          <h2 className="form-title">
            {transaction ? 'Editar Transação' : 'Nova Transação'}
          </h2>
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
                Tipo
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="form-select"
              >
                <option value={TRANSACTION_TYPES.INCOME}>Receita</option>
                <option value={TRANSACTION_TYPES.EXPENSE}>Despesa</option>
              </select>
            </div>
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
              {filteredCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {/* Debug temporário */}
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              Debug: {filteredCategories.length} categorias encontradas para tipo "{formData.type}"
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
