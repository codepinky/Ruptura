import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, MoreVertical } from 'lucide-react';
import './CalendarHeader.css';

const CalendarHeader = ({ 
  currentDate, 
  view, 
  onPrevious, 
  onNext, 
  onToday, 
  onViewChange,
  onCreateEvent,
  onCreateNote
}) => {
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  const formatDate = (date, viewType) => {
    if (viewType === 'month') {
      return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    } else if (viewType === 'week') {
      const startOfWeek = new Date(date);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day;
      startOfWeek.setDate(diff);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      return `${startOfWeek.getDate()}/${startOfWeek.getMonth() + 1} - ${endOfWeek.getDate()}/${endOfWeek.getMonth() + 1} ${endOfWeek.getFullYear()}`;
    } else {
      return date.toLocaleDateString('pt-BR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
      });
    }
  };

  return (
    <div className="calendar-header">
      <div className="calendar-header-left">
        <button className="header-btn today-btn" onClick={onToday}>
          Hoje
        </button>
        <div className="nav-buttons">
          <button className="header-btn nav-btn" onClick={onPrevious}>
            <ChevronLeft size={20} />
          </button>
          <button className="header-btn nav-btn" onClick={onNext}>
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="current-date">
          <CalendarIcon size={18} />
          <span>{formatDate(currentDate, view)}</span>
        </div>
      </div>

      <div className="calendar-header-right">
        <div className="view-selector">
          <select value={view} onChange={(e) => onViewChange(e.target.value)}>
            <option value="month">Mês</option>
            <option value="week">Semana</option>
            <option value="day">Dia</option>
          </select>
        </div>
        <div className="create-menu-wrapper">
          <button 
            className="header-btn create-btn"
            onClick={() => setShowCreateMenu(!showCreateMenu)}
          >
            <Plus size={20} />
          </button>
          {showCreateMenu && (
            <>
              <div 
                className="create-menu-overlay"
                onClick={() => setShowCreateMenu(false)}
              />
              <div className="create-menu">
                <button 
                  className="create-menu-item"
                  onClick={() => {
                    onCreateEvent();
                    setShowCreateMenu(false);
                  }}
                >
                  <Plus size={18} />
                  <span>Novo Evento</span>
                </button>
                <button 
                  className="create-menu-item"
                  onClick={() => {
                    onCreateNote();
                    setShowCreateMenu(false);
                  }}
                >
                  <Plus size={18} />
                  <span>Nova Nota</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarHeader;


