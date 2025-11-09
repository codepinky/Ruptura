import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, PiggyBank, DollarSign } from 'lucide-react';
import './SavingForm.css';

const SavingForm = ({ isOpen, onClose, saving = null, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: saving?.name || '',
    targetAmount: saving?.targetAmount || saving?.amount || '',
    currentAmount: saving?.currentAmount || '',
    description: saving?.description || ''
  });

  // Atualizar formData quando saving mudar
  useEffect(() => {
    if (saving) {
      setFormData({
        name: saving.name || '',
        targetAmount: saving.targetAmount || saving.amount || '',
        currentAmount: saving.currentAmount || '',
        description: saving.description || ''
      });
    } else {
      setFormData({
        name: '',
        targetAmount: '',
        currentAmount: '',
        description: ''
      });
    }
  }, [saving]);

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
      newErrors.name = 'Nome da economia é obrigatório';
    }

    if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0) {
      newErrors.targetAmount = 'Valor alvo deve ser maior que zero';
    }

    if (formData.currentAmount < 0) {
      newErrors.currentAmount = 'Valor atual não pode ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const savingData = {
      ...formData,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: parseFloat(formData.currentAmount) || 0,
      id: saving?.id || Date.now(),
      createdAt: saving?.createdAt || new Date().toISOString().split('T')[0]
    };

    if (onSubmit) {
      onSubmit(savingData);
    }
    onClose();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="modal-overlay" onClick={onClose}>
      <div className="saving-form" onClick={(e) => e.stopPropagation()}>
        <div className="form-header">
          <h2 className="form-title">
            {saving ? 'Editar Economia' : 'Nova Economia'}
          </h2>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label className="form-label">
              <PiggyBank size={16} />
              Nome da Economia
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="Ex: Poupança, Investimento Mensal..."
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                <DollarSign size={16} />
                Valor Alvo
              </label>
              <input
                type="number"
                name="targetAmount"
                value={formData.targetAmount}
                onChange={handleChange}
                className={`form-input ${errors.targetAmount ? 'error' : ''}`}
                placeholder="0,00"
                step="0.01"
                min="0"
              />
              {errors.targetAmount && <span className="error-message">{errors.targetAmount}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                <DollarSign size={16} />
                Valor Atual
              </label>
              <input
                type="number"
                name="currentAmount"
                value={formData.currentAmount}
                onChange={handleChange}
                className={`form-input ${errors.currentAmount ? 'error' : ''}`}
                placeholder="0,00"
                step="0.01"
                min="0"
              />
              {errors.currentAmount && <span className="error-message">{errors.currentAmount}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <PiggyBank size={16} />
              Descrição (opcional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-textarea"
              placeholder="Adicione uma descrição para sua economia..."
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="submit-button">
              {saving ? 'Atualizar' : 'Criar'} Economia
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default SavingForm;

