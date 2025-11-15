import React, { useState, useEffect } from 'react';
import { useCalendar } from '../../../context/CalendarContext';
import { useNotification } from '../../../context/NotificationContext';
import CalendarNav from '../../../components/Calendar/CalendarNav/CalendarNav';
import MonthView from '../../../components/Calendar/MonthView/MonthView';
import WeekView from '../../../components/Calendar/WeekView/WeekView';
import DayView from '../../../components/Calendar/DayView/DayView';
import EventForm from '../../../components/Calendar/EventForm/EventForm';
import TaskForm from '../../../components/Calendar/TaskForm/TaskForm';
import ReminderForm from '../../../components/Calendar/ReminderForm/ReminderForm';
import NoteForm from '../../../components/Calendar/NoteForm/NoteForm';
import EventDetailModal from '../../../components/Calendar/EventDetailModal/EventDetailModal';
import { Plus } from 'lucide-react';
import './Calendar.css';

const VIEW_TYPES = {
  MONTH: 'month',
  WEEK: 'week',
  DAY: 'day'
};

const ITEM_TYPES = {
  EVENT: 'event',
  TASK: 'task',
  REMINDER: 'reminder',
  NOTE: 'note'
};

const Calendar = () => {
  const { getUpcomingReminders, updateReminder } = useCalendar();
  const { info } = useNotification();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState(VIEW_TYPES.MONTH);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  // Verificar lembretes pendentes a cada minuto
  useEffect(() => {
    const checkReminders = () => {
      const upcomingReminders = getUpcomingReminders();
      
      upcomingReminders.forEach(reminder => {
        if (!reminder.notified) {
          info(`🔔 ${reminder.title}${reminder.description ? ': ' + reminder.description : ''}`);
          
          // Marcar como notificado
          updateReminder({
            ...reminder,
            notified: true
          });
        }
      });
    };

    // Verificar imediatamente
    checkReminders();

    // Verificar a cada minuto
    const interval = setInterval(checkReminders, 60000);

    return () => clearInterval(interval);
  }, [getUpcomingReminders, updateReminder, info]);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCreateMenu && !event.target.closest('.calendar-fab-mobile')) {
        setShowCreateMenu(false);
      }
    };

    if (showCreateMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showCreateMenu]);

  const handleCreateNew = (type) => {
    setFormType(type);
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setFormType(item.type);
    setIsFormOpen(true);
    setDetailModalOpen(false);
  };

  const handleViewItem = (item) => {
    setSelectedItem(item);
    setDetailModalOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setFormType(null);
    setEditingItem(null);
  };

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedItem(null);
  };

  const handleDateChange = (date) => {
    setCurrentDate(new Date(date));
    setSelectedDate(new Date(date));
  };

  const handleViewChange = (view) => {
    setViewType(view);
  };

  const handleShowMoreClick = (date) => {
    setSelectedDate(date);
    setViewType(VIEW_TYPES.DAY);
  };

  const renderForm = () => {
    if (!isFormOpen || !formType) return null;

    const commonProps = {
      isOpen: isFormOpen,
      onClose: handleCloseForm,
      editingItem: editingItem
    };

    switch (formType) {
      case ITEM_TYPES.EVENT:
        return <EventForm {...commonProps} />;
      case ITEM_TYPES.TASK:
        return <TaskForm {...commonProps} />;
      case ITEM_TYPES.REMINDER:
        return <ReminderForm {...commonProps} />;
      case ITEM_TYPES.NOTE:
        return <NoteForm {...commonProps} />;
      default:
        return null;
    }
  };

  const renderView = () => {
    switch (viewType) {
      case VIEW_TYPES.MONTH:
        return (
          <MonthView
            currentDate={currentDate}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            onItemClick={handleViewItem}
            onShowMoreClick={handleShowMoreClick}
          />
        );
      case VIEW_TYPES.WEEK:
        return (
          <WeekView
            currentDate={currentDate}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            onItemClick={handleViewItem}
          />
        );
      case VIEW_TYPES.DAY:
        return (
          <DayView
            currentDate={selectedDate}
            onItemClick={handleViewItem}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="calendar-page">
      <div className="calendar-header">
        <h1 className="calendar-title">Calendário</h1>
        <CalendarNav
          currentDate={currentDate}
          viewType={viewType}
          onDateChange={handleDateChange}
          onViewChange={handleViewChange}
        />
      </div>

      <div className="calendar-content">
        {renderView()}
      </div>

      {/* Menu de criação rápida - Desktop */}
      <div className="calendar-quick-actions">
        <button
          className="quick-action-btn"
          onClick={() => handleCreateNew(ITEM_TYPES.EVENT)}
          title="Novo Evento"
        >
          <Plus size={16} />
          Evento
        </button>
        <button
          className="quick-action-btn"
          onClick={() => handleCreateNew(ITEM_TYPES.TASK)}
          title="Nova Tarefa"
        >
          <Plus size={16} />
          Tarefa
        </button>
        <button
          className="quick-action-btn"
          onClick={() => handleCreateNew(ITEM_TYPES.REMINDER)}
          title="Novo Lembrete"
        >
          <Plus size={16} />
          Lembrete
        </button>
        <button
          className="quick-action-btn"
          onClick={() => handleCreateNew(ITEM_TYPES.NOTE)}
          title="Nova Nota"
        >
          <Plus size={16} />
          Nota
        </button>
      </div>

      {/* FAB Mobile */}
      <div className="calendar-fab-mobile">
        {showCreateMenu && (
          <div className="fab-menu">
            <button
              className="fab-menu-item"
              onClick={() => {
                handleCreateNew(ITEM_TYPES.EVENT);
                setShowCreateMenu(false);
              }}
            >
              Evento
            </button>
            <button
              className="fab-menu-item"
              onClick={() => {
                handleCreateNew(ITEM_TYPES.TASK);
                setShowCreateMenu(false);
              }}
            >
              Tarefa
            </button>
            <button
              className="fab-menu-item"
              onClick={() => {
                handleCreateNew(ITEM_TYPES.REMINDER);
                setShowCreateMenu(false);
              }}
            >
              Lembrete
            </button>
            <button
              className="fab-menu-item"
              onClick={() => {
                handleCreateNew(ITEM_TYPES.NOTE);
                setShowCreateMenu(false);
              }}
            >
              Nota
            </button>
          </div>
        )}
        <button
          className="fab-button"
          onClick={() => setShowCreateMenu(!showCreateMenu)}
          aria-label="Criar novo item"
        >
          <Plus size={24} />
        </button>
      </div>

      {renderForm()}
      
      {detailModalOpen && selectedItem && (
        <EventDetailModal
          item={selectedItem}
          isOpen={detailModalOpen}
          onClose={handleCloseDetailModal}
          onEdit={handleEditItem}
        />
      )}
    </div>
  );
};

export default Calendar;

