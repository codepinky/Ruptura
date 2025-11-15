import React from 'react';
import './EventCard.css';

const EventCard = ({ event, onClick, compact = false }) => {
  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const getEventStyle = () => {
    return {
      borderLeftColor: event.color || '#3B82F6',
      backgroundColor: `${event.color || '#3B82F6'}15`
    };
  };

  return (
    <div 
      className={`event-card ${compact ? 'compact' : ''}`}
      style={getEventStyle()}
      onClick={onClick}
    >
      {!event.allDay && !compact && (
        <div className="event-time">{formatTime(event.start)}</div>
      )}
      <div className="event-title">{event.title}</div>
      {event.description && !compact && (
        <div className="event-description">{event.description}</div>
      )}
    </div>
  );
};

export default EventCard;


