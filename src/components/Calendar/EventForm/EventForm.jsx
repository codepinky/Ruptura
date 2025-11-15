import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useCalendar } from '../../../context/CalendarContext';
import './EventForm.css';

const EventForm = ({ event, date, onClose }) => {
  const { addEvent, updateEvent, calendars } = useCalendar();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [allDay, setAllDay] = useState(true);
  const [calendarId, setCalendarId] = useState('');
  const [color, setColor] = useState('#3B82F6');

  useEffect(() => {
    if (event) {
      setTitle(event.title || '');
      setDescription(event.description || '');
      const start = new Date(event.start);
      const end = new Date(event.end);
      setStartDate(start.toISOString().split('T')[0]);
      setStartTime(start.toTimeString().slice(0, 5));
      setEndDate(end.toISOString().split('T')[0]);
      setEndTime(end.toTimeString().slice(0, 5));
      setAllDay(event.allDay || false);
      setCalendarId(event.calendarId || '');
      setColor(event.color || '#3B82F6');
    } else if (date) {
      const d = new Date(date);
      setStartDate(d.toISOString().split('T')[0]);
      setEndDate(d.toISOString().split('T')[0]);
      if (calendars.length > 0) {
        setCalendarId(calendars[0].id);
        setColor(calendars[0].color);
      }
    }
  }, [event, date, calendars]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const start = allDay 
      ? new Date(startDate)
      : new Date(`${startDate}T${startTime}`);
    const end = allDay
      ? new Date(endDate)
      : new Date(`${endDate}T${endTime}`);

    const eventData = {
      title,
      description,
      start: start.toISOString(),
      end: end.toISOString(),
      allDay,
      calendarId: calendarId || calendars[0]?.id,
      color
    };

    if (event) {
      updateEvent({ ...eventData, id: event.id });
    } else {
      addEvent(eventData);
    }

    onClose();
  };

  const selectedCalendar = calendars.find(c => c.id === calendarId);

  return (
    <div className="event-form-overlay" onClick={onClose}>
      <div className="event-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="event-form-header">
          <h2>{event ? 'Editar Evento' : 'Novo Evento'}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-group">
            <label>Título *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Nome do evento"
            />
          </div>

          <div className="form-group">
            <label>Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Adicione detalhes..."
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
              />
              <span>Dia inteiro</span>
            </label>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Data de início *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            {!allDay && (
              <div className="form-group">
                <label>Hora de início</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Data de término *</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
            {!allDay && (
              <div className="form-group">
                <label>Hora de término</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Calendário</label>
            <select
              value={calendarId}
              onChange={(e) => {
                setCalendarId(e.target.value);
                const cal = calendars.find(c => c.id === e.target.value);
                if (cal) setColor(cal.color);
              }}
            >
              {calendars.map(cal => (
                <option key={cal.id} value={cal.id}>{cal.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Cor</label>
            <div className="color-picker">
              {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'].map(c => (
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
              {event ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;


