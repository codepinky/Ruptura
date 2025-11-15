import React from 'react';
import { useCalendar } from '../../../context/CalendarContext';
import EventCard from '../../../components/Calendar/EventCard/EventCard';
import NoteCard from '../../../components/Calendar/NoteCard/NoteCard';
import './WeekView.css';

const WeekView = ({ currentDate, onDateClick, onEventClick, onNoteClick }) => {
  const { getEventsByDate, getNotesByDate } = useCalendar();

  const getWeekDays = (date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }

    return week;
  };

  const weekDays = getWeekDays(currentDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isToday = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  };

  const formatDayName = (date) => {
    return date.toLocaleDateString('pt-BR', { weekday: 'short' });
  };

  const formatDayNumber = (date) => {
    return date.getDate();
  };

  return (
    <div className="week-view">
      <div className="week-view-header">
        {weekDays.map((day, index) => (
          <div
            key={index}
            className={`week-day-header ${isToday(day) ? 'today' : ''}`}
            onClick={() => onDateClick(day)}
          >
            <div className="day-name">{formatDayName(day)}</div>
            <div className="day-number">{formatDayNumber(day)}</div>
          </div>
        ))}
      </div>
      <div className="week-view-content">
        {weekDays.map((day, index) => {
          const dayEvents = getEventsByDate(day);
          const dayNotes = getNotesByDate(day);

          return (
            <div key={index} className="week-day-column">
              <div className="day-events">
                {dayEvents.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onClick={() => onEventClick(event)}
                  />
                ))}
                {dayNotes.map(note => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onClick={() => onNoteClick(note)}
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

export default WeekView;


