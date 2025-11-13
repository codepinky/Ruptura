import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, DollarSign, Calendar, Tag, FileText, Globe } from 'lucide-react';
import { useFinancial, TRANSACTION_TYPES } from '../../context/FinancialContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotification } from '../../context/NotificationContext';
import './SimpleTransactionForm.css';

// Lista de moedas suportadas
const CURRENCIES = [
  { code: 'BRL', name: 'Real', symbol: 'R$', locale: 'pt-BR' },
  { code: 'USD', name: 'Dólar Americano', symbol: '$', locale: 'en-US' },
  { code: 'EUR', name: 'Euro', symbol: '€', locale: 'de-DE' },
  { code: 'GBP', name: 'Libra Esterlina', symbol: '£', locale: 'en-GB' },
  { code: 'JPY', name: 'Iene Japonês', symbol: '¥', locale: 'ja-JP' },
  { code: 'CAD', name: 'Dólar Canadense', symbol: 'C$', locale: 'en-CA' },
  { code: 'AUD', name: 'Dólar Australiano', symbol: 'A$', locale: 'en-AU' },
  { code: 'CHF', name: 'Franco Suíço', symbol: 'CHF', locale: 'de-CH' },
  { code: 'CNY', name: 'Yuan Chinês', symbol: '¥', locale: 'zh-CN' },
  { code: 'ARS', name: 'Peso Argentino', symbol: '$', locale: 'es-AR' }
];

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

  const [displayAmount, setDisplayAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0]); // BRL como padrão
  const [errors, setErrors] = useState({});
  const scrollPositionRef = useRef(0);

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
      setDisplayAmount('');
      setSelectedCurrency(CURRENCIES[0]); // Resetar para BRL
      setErrors({});
      
      // Salvar posição do scroll atual
      const currentScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      scrollPositionRef.current = currentScrollY;
      
      // Detectar iOS
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      
      // Prevenir scroll do body quando modal estiver aberto
      if (isIOS) {
        // Para iOS, NÃO usar position: fixed no body para não quebrar position: fixed dos filhos
        // Em vez disso, usar apenas overflow: hidden e prevenir scroll via eventos
        document.body.style.overflow = 'hidden';
        document.body.style.touchAction = 'none';
        // Salvar a posição do scroll no atributo data para restaurar depois
        document.body.setAttribute('data-scroll-y', currentScrollY.toString());
        
        // Também aplicar no html para iOS
        document.documentElement.style.overflow = 'hidden';
        document.documentElement.style.height = '100%';
      } else {
        // Para outros navegadores, usar a abordagem padrão com position: fixed
        document.body.style.overflow = 'hidden';
        document.body.style.touchAction = 'none';
        document.body.style.position = 'fixed';
        document.body.style.top = `-${currentScrollY}px`;
        document.body.style.width = '100%';
      }
      
      // Função para resetar zoom quando input perder foco (iOS Safari)
      const handleBlur = () => {
        // Aguardar o teclado fechar completamente
        setTimeout(() => {
          // Resetar zoom usando viewport meta tag
          const viewport = document.querySelector('meta[name="viewport"]');
          if (viewport && window.visualViewport) {
            const currentScale = window.visualViewport.scale;
            // Se houver zoom (scale > 1), resetar
            if (currentScale > 1) {
              const originalContent = viewport.getAttribute('content');
              // Forçar reset do zoom
              viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
              
              // Forçar reflow para aplicar a mudança
              void document.body.offsetHeight;
              
              // Restaurar configuração original após resetar
              requestAnimationFrame(() => {
                if (viewport) {
                  viewport.setAttribute('content', originalContent || 'width=device-width, initial-scale=1.0, viewport-fit=cover');
                }
              });
            }
          }
        }, 350);
      };
      
      // Adicionar listeners de blur em todos os inputs quando modal abrir
      const inputs = document.querySelectorAll('.simple-form input, .simple-form select, .simple-form textarea');
      inputs.forEach(input => {
        input.addEventListener('blur', handleBlur);
      });
      
      // Foco inicial no primeiro campo (acessibilidade)
      const firstSelect = document.querySelector('.simple-form select[name="categoryId"]');
      if (firstSelect) {
        setTimeout(() => firstSelect.focus(), 100);
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
          // Permitir scroll apenas dentro do conteúdo do modal
          const modalContent = e.target.closest('.simple-form');
          const isScrollable = modalContent && (
            modalContent.scrollHeight > modalContent.clientHeight ||
            e.target.closest('.form-content') ||
            e.target.closest('input') ||
            e.target.closest('select') ||
            e.target.closest('textarea')
          );
          
          // Se não estiver dentro do conteúdo scrollável do modal, prevenir scroll
          if (!isScrollable) {
            e.preventDefault();
            return false;
          }
        };
        
        // Adicionar listener para prevenir scroll no body (especialmente iOS)
        // Usar capture phase para interceptar antes que chegue aos elementos
        document.body.addEventListener('touchmove', preventScrollHandler, { passive: false, capture: true });
        document.body.addEventListener('wheel', preventScrollHandler, { passive: false, capture: true });
        // Também prevenir no document para garantir
        document.addEventListener('touchmove', preventScrollHandler, { passive: false, capture: true });
      }
      
      return () => {
        // Remover listeners
        inputs.forEach(input => {
          input.removeEventListener('blur', handleBlur);
        });
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
        // Restaurar estilos do body para iOS
        document.body.style.overflow = '';
        document.body.style.touchAction = '';
        document.body.removeAttribute('data-scroll-y');
        
        // Restaurar estilos do html para iOS
        document.documentElement.style.overflow = '';
        document.documentElement.style.height = '';
        
        // Restaurar posição do scroll no iOS
        // Usar um pequeno delay para garantir que os estilos foram aplicados
        setTimeout(() => {
          if (savedScrollY > 0) {
            window.scrollTo({
              top: savedScrollY,
              behavior: 'auto'
            });
          }
        }, 0);
      } else {
        // Restaurar estilos do body para outros navegadores
        document.body.style.overflow = '';
        document.body.style.touchAction = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        
        // Restaurar posição do scroll para outros navegadores
        if (savedScrollY > 0) {
          requestAnimationFrame(() => {
            window.scrollTo(0, savedScrollY);
          });
        }
      }
      
      // Resetar zoom quando modal fechar
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, viewport-fit=cover');
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

  const handleAmountChange = useCallback((e) => {
    const input = e.target;
    const value = input.value;
    
    // Remove tudo exceto números (incluindo o símbolo da moeda se presente)
    const numbers = value.replace(/\D/g, '');
    
    if (!numbers) {
      setDisplayAmount('');
      setFormData(prev => ({ ...prev, amount: '' }));
      if (errors.amount) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.amount;
          return newErrors;
        });
      }
      return;
    }
    
    // Converte para número (divide por 100 para tratar como centavos)
    // Isso permite que "500" vire "5,00" e "50000" vire "500,00"
    const amount = parseFloat(numbers) / 100;
    
    // Formata usando o locale da moeda selecionada
    const formatted = new Intl.NumberFormat(selectedCurrency.locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
    
    // Salva o valor numérico
    setDisplayAmount(formatted);
    setFormData(prev => ({
      ...prev,
      amount: amount.toString()
    }));
    
    // Limpar erro se existir
    if (errors.amount) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.amount;
        return newErrors;
      });
    }
  }, [errors.amount, selectedCurrency]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Tratamento especial para o campo de valor
    if (name === 'amount') {
      handleAmountChange(e);
      return;
    }
    
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
        description: formData.description || '',
        amount: parseFloat(formData.amount),
        type: formData.type,
        categoryId: parseInt(formData.categoryId),
        date: formData.date,
        notes: ''
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
              <Globe size={16} />
              Moeda *
            </label>
            <select
              name="currency"
              value={selectedCurrency.code}
              onChange={(e) => {
                const currency = CURRENCIES.find(c => c.code === e.target.value);
                if (currency) {
                  setSelectedCurrency(currency);
                  // Limpar e reformatar o valor quando mudar a moeda
                  if (displayAmount) {
                    const numbers = displayAmount.replace(/\D/g, '');
                    if (numbers) {
                      const amount = parseFloat(numbers) / 100;
                      const formatted = new Intl.NumberFormat(currency.locale, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      }).format(amount);
                      setDisplayAmount(formatted);
                    }
                  }
                }
              }}
            >
              {CURRENCIES.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.name} ({currency.code})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              <DollarSign size={16} />
              Valor em {selectedCurrency.name} ({selectedCurrency.code}) *
            </label>
            <div className="amount-input-wrapper">
              <span className="currency-symbol">{selectedCurrency.symbol}</span>
              <input
                type="text"
                name="amount"
                value={displayAmount}
                onChange={handleAmountChange}
                placeholder="0,00"
                inputMode="numeric"
                className={`amount-input ${errors.amount ? 'error' : ''}`}
                aria-describedby={errors.amount ? 'amount-error' : undefined}
                autoComplete="off"
              />
            </div>
            {errors.amount && <span id="amount-error" className="error" role="alert">{errors.amount}</span>}
          </div>

          <div className="form-group date-input-group">
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
              Descrição
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Ex: Supermercado, Salário..."
              rows={3}
              className={errors.description ? 'error' : ''}
              aria-describedby={errors.description ? 'description-error' : undefined}
            />
            {errors.description && <span id="description-error" className="error" role="alert">{errors.description}</span>}
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
