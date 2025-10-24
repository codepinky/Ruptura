import React, { useState, useEffect } from 'react';
import { X, Palette, Type, DollarSign } from 'lucide-react';
import './CategoryForm.css';

const CategoryForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  category = null, 
  TRANSACTION_TYPES 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: TRANSACTION_TYPES.EXPENSE,
    color: '#3B82F6'
  });

  const [errors, setErrors] = useState({});

  // Cores predefinidas para escolha
  const predefinedColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#6B7280', '#64748B',
    '#84CC16', '#F43F5E', '#06B6D4', '#8B5CF6', '#F59E0B'
  ];

  // Ícones predefinidos para categorias
  const categoryIcons = [
    '🍽️', '🚗', '🏠', '💊', '📚', '🎬', '🛒', '⚡', '💧', '📱',
    '👕', '✈️', '🎮', '🏋️', '🎵', '📷', '💻', '☕', '🍕', '🎯'
  ];

  useEffect(() => {
    if (isOpen) {
      // Prevenir scroll do body quando modal estiver aberto
      document.body.style.overflow = 'hidden';
    } else {
      // Restaurar scroll do body quando modal fechar
      document.body.style.overflow = 'unset';
    }

    // Cleanup function para restaurar scroll quando componente desmontar
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
    if (category) {
      setFormData({
        name: category.name || '',
        type: category.type || TRANSACTION_TYPES.EXPENSE,
        color: category.color || '#3B82F6'
      });
    } else {
      setFormData({
        name: '',
        type: TRANSACTION_TYPES.EXPENSE,
        color: '#3B82F6'
      });
    }
    setErrors({});
  }, [category, TRANSACTION_TYPES, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome da categoria é obrigatório';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!formData.type) {
      newErrors.type = 'Tipo da categoria é obrigatório';
    }

    if (!formData.color) {
      newErrors.color = 'Cor da categoria é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const categoryData = {
        ...formData,
        name: formData.name.trim()
      };
      
      onSubmit(categoryData);
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      type: TRANSACTION_TYPES.EXPENSE,
      color: '#3B82F6'
    });
    setErrors({});
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {category ? 'Editar Categoria' : 'Nova Categoria'}
          </h2>
          <button className="close-button" onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="category-form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              <Type size={20} />
              Nome da Categoria
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="Ex: Supermercado, Restaurante, Transporte..."
              maxLength={50}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="type" className="form-label">
              <DollarSign size={20} />
              Tipo da Categoria
            </label>
            <div className="type-options">
              <label className={`type-option ${formData.type === TRANSACTION_TYPES.INCOME ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="type"
                  value={TRANSACTION_TYPES.INCOME}
                  checked={formData.type === TRANSACTION_TYPES.INCOME}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                />
                <div className="option-content">
                  <div className="option-icon income">📈</div>
                  <div className="option-text">
                    <span className="option-title">Receita</span>
                    <span className="option-description">Dinheiro que entra</span>
                  </div>
                </div>
              </label>
              
              <label className={`type-option ${formData.type === TRANSACTION_TYPES.EXPENSE ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="type"
                  value={TRANSACTION_TYPES.EXPENSE}
                  checked={formData.type === TRANSACTION_TYPES.EXPENSE}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                />
                <div className="option-content">
                  <div className="option-icon expense">📉</div>
                  <div className="option-text">
                    <span className="option-title">Despesa</span>
                    <span className="option-description">Dinheiro que sai</span>
                  </div>
                </div>
              </label>
            </div>
            {errors.type && <span className="error-message">{errors.type}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">
              <Palette size={20} />
              Cor da Categoria
            </label>
            <div className="color-selection">
              <div className="color-preview">
                <div 
                  className="preview-circle" 
                  style={{ backgroundColor: formData.color }}
                />
                <span className="preview-text">{formData.color}</span>
              </div>
              
              <div className="color-options">
                {predefinedColors.map((color, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`color-option ${formData.color === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleInputChange('color', color)}
                    title={color}
                  />
                ))}
              </div>
              
              <div className="custom-color">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  className="color-picker"
                />
                <span className="custom-label">Cor personalizada</span>
              </div>
            </div>
            {errors.color && <span className="error-message">{errors.color}</span>}
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
              {category ? 'Atualizar' : 'Criar'} Categoria
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;
