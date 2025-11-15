import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import CalendarHeader from './CalendarHeader';
import CalendarSidebar from './CalendarSidebar';
import MonthView from './MonthView';
import WeekView from './WeekView';
import DayView from './DayView';
import EventForm from '../../../components/Calendar/EventForm/EventForm';
import NoteForm from '../../../components/Calendar/NoteForm/NoteForm';
import './Calendar.css';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setShowEventForm(true);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowEventForm(true);
  };

  const handleNoteClick = (note) => {
    setSelectedNote(note);
    setShowNoteForm(true);
  };

  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setSelectedDate(currentDate);
    setShowEventForm(true);
  };

  const handleCreateNote = () => {
    setSelectedNote(null);
    setSelectedDate(currentDate);
    setShowNoteForm(true);
  };

  const handleCloseEventForm = () => {
    setShowEventForm(false);
    setSelectedEvent(null);
    setSelectedDate(null);
  };

  const handleCloseNoteForm = () => {
    setShowNoteForm(false);
    setSelectedNote(null);
    setSelectedDate(null);
  };

  return (
    <div className="calendar-page">
      <div className="calendar-toolbar">
        <button 
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={20} />
        </button>
      </div>

      <CalendarHeader
        currentDate={currentDate}
        view={view}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToday={handleToday}
        onViewChange={setView}
        onCreateEvent={handleCreateEvent}
        onCreateNote={handleCreateNote}
      />

      <div className="calendar-content">
        {view === 'month' && (
          <MonthView
            currentDate={currentDate}
            onDateClick={handleDateClick}
            onEventClick={handleEventClick}
            onNoteClick={handleNoteClick}
          />
        )}
        {view === 'week' && (
          <WeekView
            currentDate={currentDate}
            onDateClick={handleDateClick}
            onEventClick={handleEventClick}
            onNoteClick={handleNoteClick}
          />
        )}
        {view === 'day' && (
          <DayView
            currentDate={currentDate}
            onEventClick={handleEventClick}
            onNoteClick={handleNoteClick}
            onDateClick={handleDateClick}
          />
        )}
      </div>

      <CalendarSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {showEventForm && (
        <EventForm
          event={selectedEvent}
          date={selectedDate || currentDate}
          onClose={handleCloseEventForm}
        />
      )}

      {showNoteForm && (
        <NoteForm
          note={selectedNote}
          date={selectedDate || currentDate}
          onClose={handleCloseNoteForm}
        />
      )}
    </div>
  );
};

export default Calendar;

