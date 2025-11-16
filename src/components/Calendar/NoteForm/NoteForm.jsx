import React, { useState, useEffect } from 'react';
import { X, Calendar, FileText, Tag, Palette } from 'lucide-react';
import { useCalendar, CALENDAR_ITEM_TYPES, DEFAULT_COLORS } from '../../../context/CalendarContext';
import { useNotification } from '../../../context/NotificationContext';
import './NoteForm.css';

const NoteForm = ({ isOpen, onClose, editingItem = null }) => {
  const { addNote, updateNote } = useCalendar();
  const { success, error } = useNotification();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    tags: '',
    color: DEFAULT_COLORS[4] // Roxo por padrão para notas
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        setFormData({
          title: editingItem.title || '',
          content: editingItem.content || '',
          date: editingItem.date ? new Date(editingItem.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          tags: editingItem.tags ? editingItem.tags.join(', ') : '',
          color: editingItem.color || DEFAULT_COLORS[4]
        });
      } else {
        setFormData({
          title: '',
          content: '',
          date: new Date().toISOString().split('T')[0],
          tags: '',
          color: DEFAULT_COLORS[4]
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

    if (!formData.title.trim() && !formData.content.trim()) {
      errors.title = 'Título ou conteúdo é obrigatório';
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
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const noteData = {
        type: CALENDAR_ITEM_TYPES.NOTE,
        title: formData.title.trim() || 'Sem título',
        content: formData.content.trim(),
        date: formData.date ? new Date(formData.date + 'T00:00:00').toISOString() : undefined,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
        color: formData.color
      };

      if (editingItem) {
        updateNote({ ...noteData, id: editingItem.id });
        success('Nota atualizada com sucesso!');
      } else {
        addNote(noteData);
        success('Nota criada com sucesso!');
      }

      onClose();
    } catch (err) {
      error('Erro ao salvar nota: ' + err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="note-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="form-header">
          <h2>{editingItem ? 'Editar Nota' : 'Nova Nota'}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="note-form">
          <div className="form-group">
            <label htmlFor="title">Título</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Título da nota (opcional)"
              className={formErrors.title ? 'error' : ''}
            />
            {formErrors.title && <span className="error-message">{formErrors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="content">
              Conteúdo <span className="required">*</span>
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Escreva sua nota aqui..."
              rows="6"
              className={formErrors.content ? 'error' : ''}
            />
            {formErrors.content && <span className="error-message">{formErrors.content}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="date">
              <Calendar size={16} />
              Data Associada
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="tags">
                <Tag size={16} />
                Tags
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="tag1, tag2, tag3"
              />
              <small className="form-hint">Separe as tags por vírgula</small>
            </div>

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
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {editingItem ? 'Atualizar' : 'Criar'} Nota
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteForm;



