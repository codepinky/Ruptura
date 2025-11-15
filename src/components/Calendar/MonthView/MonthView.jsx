import React, { useMemo } from 'react';
import { useCalendar } from '../../../context/CalendarContext';
import './MonthView.css';

const DAYS_OF_WEEK = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const MonthView = ({ currentDate, selectedDate, onDateSelect, onItemClick, onShowMoreClick }) => {
  const { getItemsByDate } = useCalendar();

  const monthData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Primeiro dia do mês
    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay();
    
    // Último dia do mês
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Dias do mês anterior para preencher a primeira semana
    const prevMonth = new Date(year, month - 1, 0);
    const daysInPrevMonth = prevMonth.getDate();
    
    const days = [];
    
    // Adicionar dias do mês anterior
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, daysInPrevMonth - i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false
      });
    }
    
    // Adicionar dias do mês atual
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const todayStr = today.toISOString().split('T')[0];
      const selectedStr = selectedDate.toISOString().split('T')[0];
      
      days.push({
        date,
        dateStr,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedStr
      });
    }
    
    // Adicionar dias do próximo mês para completar a última semana
    const remainingDays = 42 - days.length; // 6 semanas * 7 dias
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false
      });
    }
    
    return days;
  }, [currentDate, selectedDate]);

  const handleDayClick = (day) => {
    if (day.isCurrentMonth) {
      onDateSelect(day.date);
    }
  };

  const handleItemClick = (e, item) => {
    e.stopPropagation();
    onItemClick(item);
  };

  const handleMoreClick = (e, day) => {
    e.stopPropagation();
    if (onShowMoreClick) {
      onShowMoreClick(day.date);
    }
  };

  return (
    <div className="month-view">
      <div className="month-view-header">
        {DAYS_OF_WEEK.map((day, index) => (
          <div key={index} className="day-header">
            {day}
          </div>
        ))}
      </div>
      
      <div className="month-view-grid">
        {monthData.map((day, index) => {
          const items = getItemsByDate(day.date);
          const allItems = [
            ...items.events,
            ...items.tasks,
            ...items.reminders,
            ...items.notes
          ];
          
          return (
            <div
              key={index}
              className={`day-cell ${day.isCurrentMonth ? 'current-month' : 'other-month'} ${day.isToday ? 'today' : ''} ${day.isSelected ? 'selected' : ''}`}
              onClick={() => handleDayClick(day)}
            >
              <div className="day-number">{day.date.getDate()}</div>
              
              {day.isCurrentMonth && (
                <div className="day-items">
                  {allItems.slice(0, 3).map((item) => {
                    const truncatedTitle = item.title.length > 12 
                      ? item.title.substring(0, 12) + '...' 
                      : item.title;
                    
                    return (
                      <div
                        key={item.id}
                        className={`day-item day-item-${item.type}`}
                        style={{
                          backgroundColor: item.color || (item.type === 'event' ? '#3B82F6' : item.type === 'task' ? '#10B981' : item.type === 'reminder' ? '#F59E0B' : '#8B5CF6')
                        }}
                        onClick={(e) => handleItemClick(e, item)}
                        title={item.title}
                      >
                        {truncatedTitle}
                      </div>
                    );
                  })}
                  {allItems.length > 3 && (
                    <div 
                      key="more-items"
                      className="day-item-more clickable"
                      onClick={(e) => handleMoreClick(e, day)}
                      title={`Ver todos os ${allItems.length} itens deste dia`}
                    >
                      ...
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthView;

