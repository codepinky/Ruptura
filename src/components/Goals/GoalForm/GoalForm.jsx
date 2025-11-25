import React, { useState, useEffect, useRef } from 'react';
import { X, Target, Calendar, DollarSign, FileText, AlertCircle } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import './GoalForm.css';

const GoalForm = ({ isOpen, onClose, goal = null, onSubmit }) => {
  const { currentTheme } = useTheme();
  const scrollPositionRef = useRef(0);
  
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

  // Prevenir scroll do body quando modal está aberto (mesmo tratamento do SimpleTransactionForm)
  useEffect(() => {
    if (isOpen) {
      // Salvar posição do scroll atual
      const currentScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      scrollPositionRef.current = currentScrollY;
      
      // Detectar iOS
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      
      // Prevenir scroll do body quando modal estiver aberto
      if (isIOS) {
        document.body.style.overflow = 'hidden';
        document.body.style.touchAction = 'none';
        document.body.setAttribute('data-scroll-y', currentScrollY.toString());
        document.documentElement.style.overflow = 'hidden';
        document.documentElement.style.height = '100%';
      } else {
        document.body.style.overflow = 'hidden';
        document.body.style.touchAction = 'none';
        document.body.style.position = 'fixed';
        document.body.style.top = `-${currentScrollY}px`;
        document.body.style.width = '100%';
      }
      
      // ESC para fechar
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      document.addEventListener('keydown', handleEscape);
      
      // Prevenir scroll no iOS quando modal estiver aberto
      let preventScrollHandler = null;
      
      if (isIOS) {
        preventScrollHandler = (e) => {
          const modalContent = e.target.closest('.goal-form');
          const isScrollable = modalContent && (
            modalContent.scrollHeight > modalContent.clientHeight ||
            e.target.closest('.form-content') ||
            e.target.closest('input') ||
            e.target.closest('select') ||
            e.target.closest('textarea')
          );
          
          if (!isScrollable) {
            e.preventDefault();
            return false;
          }
        };
        
        document.body.addEventListener('touchmove', preventScrollHandler, { passive: false, capture: true });
        document.body.addEventListener('wheel', preventScrollHandler, { passive: false, capture: true });
        document.addEventListener('touchmove', preventScrollHandler, { passive: false, capture: true });
      }
      
      return () => {
        document.removeEventListener('keydown', handleEscape);
        if (isIOS && preventScrollHandler) {
          document.body.removeEventListener('touchmove', preventScrollHandler, { capture: true });
          document.body.removeEventListener('wheel', preventScrollHandler, { capture: true });
          document.removeEventListener('touchmove', preventScrollHandler, { capture: true });
        }
      };
    } else {
      // Detectar iOS
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      
      // Restaurar scroll do body quando modal fechar
      const savedScrollY = scrollPositionRef.current;
      
      if (isIOS) {
        document.body.style.overflow = '';
        document.body.style.touchAction = '';
        document.body.removeAttribute('data-scroll-y');
        document.documentElement.style.overflow = '';
        document.documentElement.style.height = '';
        
        setTimeout(() => {
          if (savedScrollY > 0) {
            window.scrollTo({
              top: savedScrollY,
              behavior: 'auto'
            });
          }
        }, 0);
      } else {
        document.body.style.overflow = '';
        document.body.style.touchAction = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        
        if (savedScrollY > 0) {
          requestAnimationFrame(() => {
            window.scrollTo(0, savedScrollY);
          });
        }
      }
    }
    
    // Cleanup quando componente desmontar
    return () => {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      
      if (isIOS) {
        document.body.style.overflow = '';
        document.body.style.touchAction = '';
        document.body.removeAttribute('data-scroll-y');
        document.documentElement.style.overflow = '';
        document.documentElement.style.height = '';
      } else {
        document.body.style.overflow = '';
        document.body.style.touchAction = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
      }
    };
  }, [isOpen, onClose]);

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

  return (
    <div className="modal-overlay">
      <div className={`goal-form ${currentTheme === 'dark' ? 'dark-theme' : 'light-theme'}`} onClick={(e) => e.stopPropagation()}>
        <div className="form-header">
          <h2>
            {goal ? 'Editar Meta' : 'Nova Meta Financeira'}
          </h2>
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
              <Target size={16} />
              Nome da Meta *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'error' : ''}
              placeholder="Ex: Reserva de Emergência, Viagem para Europa..."
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && <span id="name-error" className="error" role="alert">{errors.name}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                <DollarSign size={16} />
                Valor da Meta *
              </label>
              <input
                type="number"
                name="targetAmount"
                value={formData.targetAmount}
                onChange={handleChange}
                className={errors.targetAmount ? 'error' : ''}
                placeholder="0,00"
                step="0.01"
                min="0"
                aria-describedby={errors.targetAmount ? 'targetAmount-error' : undefined}
              />
              {errors.targetAmount && <span id="targetAmount-error" className="error" role="alert">{errors.targetAmount}</span>}
            </div>

            <div className="form-group">
              <label>
                <DollarSign size={16} />
                Valor Atual
              </label>
              <input
                type="number"
                name="currentAmount"
                value={formData.currentAmount}
                onChange={handleChange}
                className={errors.currentAmount ? 'error' : ''}
                placeholder="0,00"
                step="0.01"
                min="0"
                aria-describedby={errors.currentAmount ? 'currentAmount-error' : undefined}
              />
              {errors.currentAmount && <span id="currentAmount-error" className="error" role="alert">{errors.currentAmount}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                <Target size={16} />
                Tipo de Meta
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
              >
                {goalTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>
                <AlertCircle size={16} />
                Prioridade
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                {priorities.map(priority => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group date-input-group">
            <label>
              <Calendar size={16} />
              Data Limite *
            </label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className={errors.deadline ? 'error' : ''}
              aria-describedby={errors.deadline ? 'deadline-error' : undefined}
            />
            {errors.deadline && <span id="deadline-error" className="error" role="alert">{errors.deadline}</span>}
          </div>

          <div className="form-group">
            <label>
              <FileText size={16} />
              Descrição *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={errors.description ? 'error' : ''}
              placeholder="Descreva sua meta financeira..."
              rows={3}
              aria-describedby={errors.description ? 'description-error' : undefined}
            />
            {errors.description && <span id="description-error" className="error" role="alert">{errors.description}</span>}
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
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancelar
            </button>
            <button type="submit" className="submit-btn">
              {goal ? 'Atualizar' : 'Criar'} Meta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalForm;

