import React, { useMemo } from 'react';
import { useCalendar } from '../../../context/CalendarContext';
import { Calendar, Clock, MapPin, Tag, CheckCircle, Flag, Bell, FileText } from 'lucide-react';
import './DayView.css';

const DayView = ({ currentDate, onItemClick }) => {
  const { getItemsByDate } = useCalendar();

  const dayItems = useMemo(() => {
    const items = getItemsByDate(currentDate);
    
    // Combinar todos os itens e ordenar por data/hora
    const allItems = [
      ...items.events.map(item => ({ ...item, sortDate: new Date(item.startDate) })),
      ...items.tasks.map(item => ({ ...item, sortDate: new Date(item.dueDate || item.date || 0) })),
      ...items.reminders.map(item => ({ ...item, sortDate: new Date(item.date) })),
      ...items.notes.map(item => ({ ...item, sortDate: new Date(item.date || 0) }))
    ];

    return allItems.sort((a, b) => a.sortDate - b.sortDate);
  }, [currentDate, getItemsByDate]);

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'event':
        return <Calendar size={18} />;
      case 'task':
        return <CheckCircle size={18} />;
      case 'reminder':
        return <Bell size={18} />;
      case 'note':
        return <FileText size={18} />;
      default:
        return <Calendar size={18} />;
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      event: 'Evento',
      task: 'Tarefa',
      reminder: 'Lembrete',
      note: 'Nota'
    };
    return labels[type] || type;
  };

  const totalItems = dayItems.length;
  
  // Mostrar todos os itens
  const displayedItems = dayItems;

  if (totalItems === 0) {
    return (
      <div className="day-view">
        <div className="day-view-header">
          <h3>{formatDate(currentDate)}</h3>
        </div>
        <div className="day-view-empty">
          <p>Nenhum evento, tarefa ou lembrete para este dia.</p>
        </div>
      </div>
    );
  }

  const renderItem = (item) => (
    <div
      key={item.id}
      className={`day-item day-item-${item.type}`}
      onClick={() => onItemClick(item)}
      style={{ borderLeftColor: item.color || '#3B82F6' }}
    >
      <div className="item-icon">
        {getTypeIcon(item.type)}
      </div>
      <div className="item-content">
        <div className={`item-header ${item.type === 'task' ? 'task-header' : ''}`}>
          {item.type === 'task' ? (
            <>
              <span className="item-type">{getTypeLabel(item.type)}</span>
              <h4 className="item-title">{item.title}</h4>
            </>
          ) : (
            <>
              <h4 className="item-title">{item.title}</h4>
              <span className="item-type">{getTypeLabel(item.type)}</span>
            </>
          )}
        </div>
        
        {item.type !== 'task' && item.description && (
          <p className="item-description">{item.description}</p>
        )}

        {item.type === 'note' && item.content && (
          <p className="item-content-text">{item.content}</p>
        )}

        {item.type !== 'task' && (
          <div className="item-meta">
            {item.type === 'event' && (
              <>
                <div className="meta-item">
                  <Clock size={14} />
                  <span>{formatTime(item.startDate)} - {formatTime(item.endDate)}</span>
                </div>
                {item.location && (
                  <div className="meta-item">
                    <MapPin size={14} />
                    <span>{item.location}</span>
                  </div>
                )}
              </>
            )}

            {item.type === 'reminder' && (
              <div className="meta-item">
                <Clock size={14} />
                <span>{formatTime(item.date)}</span>
              </div>
            )}

            {item.type === 'note' && item.tags && item.tags.length > 0 && (
              <div className="meta-item">
                <Tag size={14} />
                <div className="tags">
                  {item.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="day-view">
      <div className="day-view-header">
        <h3>{formatDate(currentDate)}</h3>
        <span className="items-count">{totalItems} {totalItems === 1 ? 'item' : 'itens'}</span>
      </div>

      <div className="day-view-list">
        {/* Mostrar até 3 itens */}
        {displayedItems.map(renderItem)}
      </div>
    </div>
  );
};

export default DayView;

