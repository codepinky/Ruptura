import React, { useMemo } from 'react';
import { useCalendar } from '../../../context/CalendarContext';
import './WeekView.css';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const WeekView = ({ currentDate, selectedDate, onDateSelect, onItemClick }) => {
  const { getItemsByDateRange } = useCalendar();

  const weekData = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);
    startOfWeek.setHours(0, 0, 0, 0);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push({
        date,
        dateStr: date.toISOString().split('T')[0],
        dayName: DAYS_OF_WEEK[i],
        dayNumber: date.getDate(),
        isToday: date.toDateString() === new Date().toDateString(),
        isSelected: date.toDateString() === selectedDate.toDateString()
      });
    }

    const endOfWeek = new Date(days[6].date);
    endOfWeek.setHours(23, 59, 59, 999);

    const items = getItemsByDateRange(startOfWeek, endOfWeek);

    return { days, items };
  }, [currentDate, selectedDate, getItemsByDateRange]);

  const getEventsForDayAndHour = (day, hour) => {
    const dayItems = weekData.items.events.filter(event => {
      const eventDate = new Date(event.startDate);
      const eventDay = eventDate.toDateString();
      const eventHour = eventDate.getHours();
      return eventDay === day.date.toDateString() && eventHour === hour;
    });

    return dayItems;
  };

  const handleItemClick = (e, item) => {
    e.stopPropagation();
    onItemClick(item);
  };

  const handleDayClick = (day) => {
    onDateSelect(day.date);
  };

  return (
    <div className="week-view-container">
      <div className="week-view">
        <div className="week-view-header">
          <div className="time-column-header"></div>
          {weekData.days.map((day, index) => (
            <div
              key={index}
              className={`day-header ${day.isToday ? 'today' : ''} ${day.isSelected ? 'selected' : ''}`}
              onClick={() => handleDayClick(day)}
            >
              <div className="day-name">{day.dayName}</div>
              <div className="day-number">{day.dayNumber}</div>
            </div>
          ))}
        </div>

        <div className="week-view-grid">
          <div className="time-column">
            {HOURS.map((hour) => (
              <div key={hour} className="time-slot">
                {hour.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>

          <div className="days-columns">
            {weekData.days.map((day, dayIndex) => (
              <div key={dayIndex} className="day-column">
                {HOURS.map((hour) => {
                  const events = getEventsForDayAndHour(day, hour);
                  return (
                    <div key={hour} className="hour-slot">
                      {events.map((event) => {
                        const startTime = new Date(event.startDate);
                        const endTime = new Date(event.endDate);
                        const duration = (endTime - startTime) / (1000 * 60); // minutos
                        const topOffset = startTime.getMinutes();
                        
                        return (
                          <div
                            key={event.id}
                            className="week-event"
                            style={{
                              backgroundColor: event.color || '#3B82F6',
                              height: `${Math.max(20, (duration / 60) * 100)}px`,
                              top: `${(topOffset / 60) * 100}%`
                            }}
                            onClick={(e) => handleItemClick(e, event)}
                            title={event.title}
                          >
                            <div className="event-time">
                              {startTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="event-title">{event.title}</div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeekView;

