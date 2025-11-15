import React from 'react';
import { useCalendar } from '../../../context/CalendarContext';
import EventCard from '../../../components/Calendar/EventCard/EventCard';
import NoteCard from '../../../components/Calendar/NoteCard/NoteCard';
import './DayView.css';

const DayView = ({ currentDate, onEventClick, onNoteClick, onDateClick }) => {
  const { getEventsByDate, getNotesByDate } = useCalendar();

  const dayEvents = getEventsByDate(currentDate);
  const dayNotes = getNotesByDate(currentDate);

  const formatDate = (date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Ordenar eventos por hora
  const sortedEvents = [...dayEvents].sort((a, b) => {
    if (a.allDay && !b.allDay) return -1;
    if (!a.allDay && b.allDay) return 1;
    if (a.allDay && b.allDay) return 0;
    return new Date(a.start) - new Date(b.start);
  });

  return (
    <div className="day-view">
      <div className="day-view-header">
        <h2 className="day-view-title">{formatDate(currentDate)}</h2>
        <div className="day-view-stats">
          {dayEvents.length > 0 && (
            <span className="stat-badge">{dayEvents.length} evento{dayEvents.length !== 1 ? 's' : ''}</span>
          )}
          {dayNotes.length > 0 && (
            <span className="stat-badge">{dayNotes.length} nota{dayNotes.length !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>

      <div className="day-view-content">
        {sortedEvents.length === 0 && dayNotes.length === 0 ? (
          <div className="empty-day">
            <p>Nenhum evento ou nota para este dia</p>
            {onDateClick && (
              <button 
                className="add-to-day-btn"
                onClick={() => onDateClick(currentDate)}
              >
                Adicionar evento ou nota
              </button>
            )}
          </div>
        ) : (
          <>
            {sortedEvents.length > 0 && (
              <div className="day-section">
                <h3 className="section-title">Eventos</h3>
                <div className="events-list">
                  {sortedEvents.map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onClick={() => onEventClick(event)}
                    />
                  ))}
                </div>
              </div>
            )}

            {dayNotes.length > 0 && (
              <div className="day-section">
                <h3 className="section-title">Notas</h3>
                <div className="notes-list">
                  {dayNotes.map(note => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onClick={() => onNoteClick(note)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DayView;

