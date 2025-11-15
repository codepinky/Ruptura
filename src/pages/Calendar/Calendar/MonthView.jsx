import React from 'react';
import { useCalendar } from '../../../context/CalendarContext';
import EventCard from '../../../components/Calendar/EventCard/EventCard';
import NoteCard from '../../../components/Calendar/NoteCard/NoteCard';
import './MonthView.css';

const MonthView = ({ currentDate, onDateClick, onEventClick, onNoteClick }) => {
  const { getEventsByDate, getNotesByDate } = useCalendar();

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Dias do mês anterior para preencher a primeira semana
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonth.getDate() - i),
        isCurrentMonth: false
      });
    }
    
    // Dias do mês atual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }
    
    // Dias do próximo mês para completar a última semana
    const remainingDays = 42 - days.length; // 6 semanas * 7 dias
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }
    
    return days;
  };

  const days = getDaysInMonth(currentDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isToday = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  };

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="month-view">
      <div className="month-view-header">
        {weekDays.map(day => (
          <div key={day} className="week-day-header">
            {day}
          </div>
        ))}
      </div>
      <div className="month-view-grid">
        {days.map((day, index) => {
          const dayEvents = getEventsByDate(day.date);
          const dayNotes = getNotesByDate(day.date);
          const dayIsToday = isToday(day.date);

          return (
            <div
              key={index}
              className={`month-day ${!day.isCurrentMonth ? 'other-month' : ''} ${dayIsToday ? 'today' : ''}`}
              onClick={() => onDateClick(day.date)}
            >
              <div className="day-number">{day.date.getDate()}</div>
              <div className="day-content">
                {dayEvents.slice(0, 2).map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    compact
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                  />
                ))}
                {dayEvents.length > 2 && (
                  <div className="more-events">
                    +{dayEvents.length - 2} mais
                  </div>
                )}
                {dayNotes.slice(0, 1).map(note => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    compact
                    onClick={(e) => {
                      e.stopPropagation();
                      onNoteClick(note);
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthView;


