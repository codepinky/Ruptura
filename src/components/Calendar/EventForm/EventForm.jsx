import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Palette, Repeat } from 'lucide-react';
import { useCalendar, CALENDAR_ITEM_TYPES, DEFAULT_COLORS } from '../../../context/CalendarContext';
import { useNotification } from '../../../context/NotificationContext';
import './EventForm.css';

const EventForm = ({ isOpen, onClose, editingItem = null }) => {
  const { addEvent, updateEvent } = useCalendar();
  const { success, error } = useNotification();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endDate: new Date().toISOString().split('T')[0],
    endTime: '10:00',
    color: DEFAULT_COLORS[0],
    location: '',
    recurrence: 'none'
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        const startDateTime = new Date(editingItem.startDate);
        const endDateTime = new Date(editingItem.endDate);
        
        setFormData({
          title: editingItem.title || '',
          description: editingItem.description || '',
          startDate: startDateTime.toISOString().split('T')[0],
          startTime: startDateTime.toTimeString().slice(0, 5),
          endDate: endDateTime.toISOString().split('T')[0],
          endTime: endDateTime.toTimeString().slice(0, 5),
          color: editingItem.color || DEFAULT_COLORS[0],
          location: editingItem.location || '',
          recurrence: editingItem.recurrence || 'none'
        });
      } else {
        const now = new Date();
        const endTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hora depois
        
        setFormData({
          title: '',
          description: '',
          startDate: now.toISOString().split('T')[0],
          startTime: now.toTimeString().slice(0, 5),
          endDate: now.toISOString().split('T')[0],
          endTime: endTime.toTimeString().slice(0, 5),
          color: DEFAULT_COLORS[0],
          location: '',
          recurrence: 'none'
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

    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

    if (endDateTime <= startDateTime) {
      errors.endTime = 'Data/hora de término deve ser após o início';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

      const eventData = {
        type: CALENDAR_ITEM_TYPES.EVENT,
        title: formData.title.trim(),
        description: formData.description.trim(),
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        color: formData.color,
        location: formData.location.trim(),
        recurrence: formData.recurrence !== 'none' ? formData.recurrence : undefined
      };

      if (editingItem) {
        updateEvent({ ...eventData, id: editingItem.id });
        success('Evento atualizado com sucesso!');
      } else {
        addEvent(eventData);
        success('Evento criado com sucesso!');
      }

      onClose();
    } catch (err) {
      error('Erro ao salvar evento: ' + err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="event-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="form-header">
          <h2>{editingItem ? 'Editar Evento' : 'Novo Evento'}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="event-form">
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
              placeholder="Nome do evento"
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
              placeholder="Detalhes do evento"
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">
                <Calendar size={16} />
                Data de Início <span className="required">*</span>
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={formErrors.startDate ? 'error' : ''}
              />
            </div>

            <div className="form-group">
              <label htmlFor="startTime">
                <Clock size={16} />
                Hora de Início
              </label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="endDate">
                <Calendar size={16} />
                Data de Término <span className="required">*</span>
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className={formErrors.endDate ? 'error' : ''}
              />
            </div>

            <div className="form-group">
              <label htmlFor="endTime">
                <Clock size={16} />
                Hora de Término
              </label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className={formErrors.endTime ? 'error' : ''}
              />
              {formErrors.endTime && <span className="error-message">{formErrors.endTime}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="location">
              <MapPin size={16} />
              Localização
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Onde será o evento?"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="color">
                <Palette size={16} />
                Cor
              </label>
              <div className="color-picker">
                {DEFAULT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`color-option ${formData.color === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                  />
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="recurrence">
                <Repeat size={16} />
                Repetição
              </label>
              <select
                id="recurrence"
                name="recurrence"
                value={formData.recurrence}
                onChange={handleChange}
              >
                <option value="none">Não repetir</option>
                <option value="daily">Diariamente</option>
                <option value="weekly">Semanalmente</option>
                <option value="monthly">Mensalmente</option>
                <option value="yearly">Anualmente</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {editingItem ? 'Atualizar' : 'Criar'} Evento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;

