import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useCalendar, DEFAULT_CALENDAR_COLORS } from '../../../context/CalendarContext';
import { useTheme } from '../../../context/ThemeContext';
import './CalendarForm.css';

const CalendarForm = ({ onClose }) => {
  const { addCalendar } = useCalendar();
  const { currentTheme } = useTheme();
  const [name, setName] = useState('');
  const [color, setColor] = useState(DEFAULT_CALENDAR_COLORS[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name.trim()) return;

    addCalendar({
      name: name.trim(),
      color,
      type: 'custom'
    });

    onClose();
  };

  return (
    <div className="calendar-form-overlay">
      <div className={`calendar-form-modal ${currentTheme === 'dark' ? 'dark-theme' : 'light-theme'}`} onClick={(e) => e.stopPropagation()}>
        <div className="calendar-form-header">
          <h2>Novo Calendário</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="calendar-form">
          <div className="form-group">
            <label>Nome *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ex: Trabalho, Pessoal..."
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Cor</label>
            <div className="color-picker">
              {DEFAULT_CALENDAR_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  className={`color-option ${color === c ? 'selected' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-save">
              Criar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CalendarForm;









