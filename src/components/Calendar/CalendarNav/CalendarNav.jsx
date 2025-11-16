import React, { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import './CalendarNav.css';

const VIEW_TYPES = {
  MONTH: 'month',
  WEEK: 'week',
  DAY: 'day'
};

const MONTHS_ABBR = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];

const CalendarNav = ({ currentDate, viewType, onDateChange, onViewChange }) => {
  const monthScrollRef = useRef(null);

  const formatDate = (date) => {
    const options = { 
      year: 'numeric', 
      month: 'long',
      ...(viewType === VIEW_TYPES.WEEK && { day: 'numeric' })
    };
    return date.toLocaleDateString('pt-BR', options);
  };

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewType === VIEW_TYPES.MONTH) {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (viewType === VIEW_TYPES.WEEK) {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    onDateChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewType === VIEW_TYPES.MONTH) {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (viewType === VIEW_TYPES.WEEK) {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    onDateChange(newDate);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const handleMonthClick = (monthIndex, year) => {
    const newDate = new Date(year, monthIndex, 1);
    onDateChange(newDate);
  };

  // Gerar lista de meses para navegação horizontal
  const getMonthList = () => {
    const months = [];
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    // Adicionar meses anteriores
    for (let i = -2; i <= 0; i++) {
      const date = new Date(currentYear, currentMonth + i, 1);
      months.push({
        month: date.getMonth(),
        year: date.getFullYear(),
        label: MONTHS_ABBR[date.getMonth()],
        isCurrent: i === 0
      });
    }
    
    // Adicionar ano atual
    months.push({
      month: null,
      year: currentYear,
      label: currentYear.toString(),
      isCurrent: false,
      isYear: true
    });
    
    // Adicionar meses seguintes
    for (let i = 1; i <= 3; i++) {
      const date = new Date(currentYear, currentMonth + i, 1);
      months.push({
        month: date.getMonth(),
        year: date.getFullYear(),
        label: MONTHS_ABBR[date.getMonth()],
        isCurrent: false
      });
    }
    
    return months;
  };

  // Scroll para o mês atual quando mudar
  useEffect(() => {
    if (monthScrollRef.current && viewType === VIEW_TYPES.MONTH) {
      const scrollContainer = monthScrollRef.current;
      const activeButton = scrollContainer.querySelector('.month-chip.active');
      if (activeButton) {
        activeButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentDate, viewType]);

  if (viewType === VIEW_TYPES.MONTH) {
    return (
      <div className="calendar-nav-mobile">
        <div className="calendar-nav-top">
          <h2 className="calendar-nav-month">
            {formatDate(currentDate)}
            <ChevronDown size={18} className="month-dropdown-icon" />
          </h2>
          <div className="view-selector">
            <button
              className={`view-btn ${viewType === VIEW_TYPES.MONTH ? 'active' : ''}`}
              onClick={() => onViewChange(VIEW_TYPES.MONTH)}
            >
              Mês
            </button>
            <button
              className={`view-btn ${viewType === VIEW_TYPES.WEEK ? 'active' : ''}`}
              onClick={() => onViewChange(VIEW_TYPES.WEEK)}
            >
              Semana
            </button>
            <button
              className={`view-btn ${viewType === VIEW_TYPES.DAY ? 'active' : ''}`}
              onClick={() => onViewChange(VIEW_TYPES.DAY)}
            >
              Dia
            </button>
          </div>
        </div>
        
        <div className="month-scroll-container" ref={monthScrollRef}>
          <div className="month-scroll">
            {getMonthList().map((item, index) => (
              <button
                key={index}
                className={`month-chip ${item.isCurrent ? 'active' : ''} ${item.isYear ? 'year-chip' : ''}`}
                onClick={() => !item.isYear && handleMonthClick(item.month, item.year)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="calendar-nav">
      <div className="calendar-nav-left">
        <button className="nav-btn today-btn" onClick={handleToday}>
          <CalendarIcon size={16} />
          Hoje
        </button>
        <div className="nav-arrows">
          <button className="nav-btn" onClick={handlePrevious} aria-label="Anterior">
            <ChevronLeft size={20} />
          </button>
          <button className="nav-btn" onClick={handleNext} aria-label="Próximo">
            <ChevronRight size={20} />
          </button>
        </div>
        <h2 className="calendar-nav-date">{formatDate(currentDate)}</h2>
      </div>
      
      <div className="calendar-nav-right">
        <div className="view-selector">
          <button
            className={`view-btn ${viewType === VIEW_TYPES.MONTH ? 'active' : ''}`}
            onClick={() => onViewChange(VIEW_TYPES.MONTH)}
          >
            Mês
          </button>
          <button
            className={`view-btn ${viewType === VIEW_TYPES.WEEK ? 'active' : ''}`}
            onClick={() => onViewChange(VIEW_TYPES.WEEK)}
          >
            Semana
          </button>
          <button
            className={`view-btn ${viewType === VIEW_TYPES.DAY ? 'active' : ''}`}
            onClick={() => onViewChange(VIEW_TYPES.DAY)}
          >
            Dia
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarNav;

