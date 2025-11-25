import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Bell } from 'lucide-react';
import { useCalendar, CALENDAR_ITEM_TYPES } from '../../../context/CalendarContext';
import { useNotification } from '../../../context/NotificationContext';
import { useTheme } from '../../../context/ThemeContext';
import './ReminderForm.css';

const ADVANCE_OPTIONS = [
  { value: 0, label: 'No momento' },
  { value: 5, label: '5 minutos antes' },
  { value: 15, label: '15 minutos antes' },
  { value: 30, label: '30 minutos antes' },
  { value: 60, label: '1 hora antes' },
  { value: 1440, label: '1 dia antes' }
];

const ReminderForm = ({ isOpen, onClose, editingItem = null }) => {
  const { addReminder, updateReminder } = useCalendar();
  const { success, error } = useNotification();
  const { currentTheme } = useTheme();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    advanceTime: 15
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        const reminderDate = new Date(editingItem.date);
        setFormData({
          title: editingItem.title || '',
          description: editingItem.description || '',
          date: reminderDate.toISOString().split('T')[0],
          time: reminderDate.toTimeString().slice(0, 5),
          advanceTime: editingItem.advanceTime || 15
        });
      } else {
        const now = new Date();
        setFormData({
          title: '',
          description: '',
          date: now.toISOString().split('T')[0],
          time: now.toTimeString().slice(0, 5),
          advanceTime: 15
        });
      }
      setFormErrors({});
    }
  }, [isOpen, editingItem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = 'Título é obrigatório';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const reminderDateTime = new Date(`${formData.date}T${formData.time}`);

      const reminderData = {
        type: CALENDAR_ITEM_TYPES.REMINDER,
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: reminderDateTime.toISOString(),
        advanceTime: parseInt(formData.advanceTime),
        notified: false
      };

      if (editingItem) {
        await updateReminder({ ...reminderData, id: editingItem.id });
        success('Lembrete atualizado com sucesso!');
      } else {
        await addReminder(reminderData);
        success('Lembrete criado com sucesso!');
      }

      onClose();
    } catch (err) {
      error('Erro ao salvar lembrete: ' + err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className={`reminder-form-modal ${currentTheme === 'dark' ? 'dark-theme' : 'light-theme'}`} onClick={(e) => e.stopPropagation()}>
        <div className="form-header">
          <h2>{editingItem ? 'Editar Lembrete' : 'Novo Lembrete'}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="reminder-form">
          <div className="form-group">
            <label htmlFor="title">
              Título <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="O que você precisa lembrar?"
              className={formErrors.title ? 'error' : ''}
            />
            {formErrors.title && <span className="error-message">{formErrors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Descrição</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detalhes adicionais"
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group date-input-group">
              <label htmlFor="date">
                <Calendar size={16} />
                Data <span className="required">*</span>
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={formErrors.date ? 'error' : ''}
              />
            </div>

            <div className="form-group date-input-group">
              <label htmlFor="time">
                <Clock size={16} />
                Hora <span className="required">*</span>
              </label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className={formErrors.time ? 'error' : ''}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="advanceTime">
              <Bell size={16} />
              Notificar
            </label>
            <select
              id="advanceTime"
              name="advanceTime"
              value={formData.advanceTime}
              onChange={handleChange}
            >
              {ADVANCE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {editingItem ? 'Atualizar' : 'Criar'} Lembrete
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReminderForm;

