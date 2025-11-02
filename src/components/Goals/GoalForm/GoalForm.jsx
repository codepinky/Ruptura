import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Target, Calendar, DollarSign, FileText, AlertCircle } from 'lucide-react';
import './GoalForm.css';

const GoalForm = ({ isOpen, onClose, goal = null, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: goal?.name || '',
    targetAmount: goal?.targetAmount || '',
    currentAmount: goal?.currentAmount || '',
    deadline: goal?.deadline || '',
    type: goal?.type || 'emergency',
    priority: goal?.priority || 'medium',
    description: goal?.description || ''
  });

  // Atualizar formData quando goal mudar
  useEffect(() => {
    if (goal) {
      setFormData({
        name: goal.name || '',
        targetAmount: goal.targetAmount || '',
        currentAmount: goal.currentAmount || '',
        deadline: goal.deadline || '',
        type: goal.type || 'emergency',
        priority: goal.priority || 'medium',
        description: goal.description || ''
      });
    } else {
      setFormData({
        name: '',
        targetAmount: '',
        currentAmount: '',
        deadline: '',
        type: 'emergency',
        priority: 'medium',
        description: ''
      });
    }
  }, [goal]);

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

  const [errors, setErrors] = useState({});

  const goalTypes = [
    { value: 'emergency', label: 'Reserva de Emergência' },
    { value: 'vacation', label: 'Viagem/Férias' },
    { value: 'education', label: 'Educação' },
    { value: 'home', label: 'Casa/Imóvel' },
    { value: 'car', label: 'Veículo' },
    { value: 'investment', label: 'Investimento' },
    { value: 'other', label: 'Outros' }
  ];

  const priorities = [
    { value: 'high', label: 'Alta' },
    { value: 'medium', label: 'Média' },
    { value: 'low', label: 'Baixa' }
  ];

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
      newErrors.name = 'Nome da meta é obrigatório';
    }

    if (!formData.targetAmount || formData.targetAmount <= 0) {
      newErrors.targetAmount = 'Valor da meta deve ser maior que zero';
    }

    if (formData.currentAmount < 0) {
      newErrors.currentAmount = 'Valor atual não pode ser negativo';
    }

    if (!formData.deadline) {
      newErrors.deadline = 'Data limite é obrigatória';
    } else if (!goal && new Date(formData.deadline) <= new Date()) {
      // Apenas para novas metas, exigir data futura
      newErrors.deadline = 'Data limite deve ser futura';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const goalData = {
      ...formData,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: parseFloat(formData.currentAmount) || 0,
      id: goal?.id || Date.now(),
      createdAt: goal?.createdAt || new Date().toISOString().split('T')[0]
    };

    if (onSubmit) {
      onSubmit(goalData);
    }
    onClose();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="modal-overlay" onClick={onClose}>
      <div className="goal-form" onClick={(e) => e.stopPropagation()}>
        <div className="form-header">
          <h2 className="form-title">
            {goal ? 'Editar Meta' : 'Nova Meta Financeira'}
          </h2>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label className="form-label">
              <Target size={16} />
              Nome da Meta
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="Ex: Reserva de Emergência, Viagem para Europa..."
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                <DollarSign size={16} />
                Valor da Meta
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

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                <Target size={16} />
                Tipo de Meta
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="form-select"
              >
                {goalTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                <AlertCircle size={16} />
                Prioridade
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="form-select"
              >
                {priorities.map(priority => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <Calendar size={16} />
              Data Limite
            </label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className={`form-input ${errors.deadline ? 'error' : ''}`}
            />
            {errors.deadline && <span className="error-message">{errors.deadline}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">
              <FileText size={16} />
              Descrição
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`form-textarea ${errors.description ? 'error' : ''}`}
              placeholder="Descreva sua meta financeira..."
              rows={3}
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          {/* Preview da Meta */}
          {formData.targetAmount && formData.currentAmount && (
            <div className="goal-preview">
              <h4>Preview da Meta</h4>
              <div className="preview-content">
                <div className="preview-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${Math.min((formData.currentAmount / formData.targetAmount) * 100, 100)}%` 
                      }}
                    />
                  </div>
                  <p className="progress-text">
                    {((formData.currentAmount / formData.targetAmount) * 100).toFixed(1)}% concluído
                  </p>
                </div>
                <div className="preview-amounts">
                  <span className="current">
                    R$ {parseFloat(formData.currentAmount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="target">
                    R$ {parseFloat(formData.targetAmount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="submit-button">
              {goal ? 'Atualizar' : 'Criar'} Meta
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default GoalForm;

