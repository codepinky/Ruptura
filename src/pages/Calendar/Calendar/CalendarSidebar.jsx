import React, { useState } from 'react';
import { Plus, Eye, EyeOff } from 'lucide-react';
import { useCalendar } from '../../../context/CalendarContext';
import CalendarForm from '../../../components/Calendar/CalendarForm/CalendarForm';
import './CalendarSidebar.css';

const CalendarSidebar = ({ isOpen, onClose }) => {
  const { calendars, toggleCalendarVisibility, deleteCalendar } = useCalendar();
  const [showCalendarForm, setShowCalendarForm] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      <div className="calendar-sidebar-overlay" onClick={onClose} />
      <div className="calendar-sidebar">
        <div className="sidebar-header">
          <h3>Calendários</h3>
          <button className="close-sidebar-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="sidebar-content">
          <button 
            className="add-calendar-btn"
            onClick={() => setShowCalendarForm(true)}
          >
            <Plus size={18} />
            <span>Criar calendário</span>
          </button>

          <div className="calendars-list">
            {calendars.map(calendar => (
              <div key={calendar.id} className="calendar-item">
                <button
                  className="calendar-toggle"
                  onClick={() => toggleCalendarVisibility(calendar.id)}
                >
                  <div 
                    className="calendar-color"
                    style={{ backgroundColor: calendar.color }}
                  />
                  <span className="calendar-name">{calendar.name}</span>
                  {calendar.visible ? (
                    <Eye size={16} className="visibility-icon" />
                  ) : (
                    <EyeOff size={16} className="visibility-icon" />
                  )}
                </button>
                {calendar.type !== 'transactions' && (
                  <button
                    className="delete-calendar-btn"
                    onClick={() => {
                      if (window.confirm(`Deseja excluir o calendário "${calendar.name}"?`)) {
                        deleteCalendar(calendar.id);
                      }
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showCalendarForm && (
        <CalendarForm onClose={() => setShowCalendarForm(false)} />
      )}
    </>
  );
};

export default CalendarSidebar;


