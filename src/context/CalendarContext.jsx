import React, { createContext, useContext, useReducer, useEffect, useState, useMemo, useCallback } from 'react';

// Tipos de itens do calendário
export const CALENDAR_ITEM_TYPES = {
  EVENT: 'event',
  TASK: 'task',
  REMINDER: 'reminder',
  NOTE: 'note'
};

// Status de tarefas
export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed'
};

// Prioridades
export const PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

// Cores padrão para eventos
export const DEFAULT_COLORS = [
  '#3B82F6', // Azul
  '#10B981', // Verde
  '#F59E0B', // Amarelo
  '#EF4444', // Vermelho
  '#8B5CF6', // Roxo
  '#EC4899', // Rosa
  '#14B8A6', // Ciano
  '#F97316'  // Laranja
];

// Estado inicial
const initialState = {
  events: [],
  tasks: [],
  reminders: [],
  notes: [],
  loading: false,
  error: null
};

// Actions
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  ADD_EVENT: 'ADD_EVENT',
  UPDATE_EVENT: 'UPDATE_EVENT',
  DELETE_EVENT: 'DELETE_EVENT',
  ADD_TASK: 'ADD_TASK',
  UPDATE_TASK: 'UPDATE_TASK',
  DELETE_TASK: 'DELETE_TASK',
  ADD_REMINDER: 'ADD_REMINDER',
  UPDATE_REMINDER: 'UPDATE_REMINDER',
  DELETE_REMINDER: 'DELETE_REMINDER',
  ADD_NOTE: 'ADD_NOTE',
  UPDATE_NOTE: 'UPDATE_NOTE',
  DELETE_NOTE: 'DELETE_NOTE',
  LOAD_DATA: 'LOAD_DATA'
};

// Reducer
function calendarReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case ACTIONS.ADD_EVENT:
      const newEventId = Date.now() + Math.random();
      return {
        ...state,
        events: [...state.events, { ...action.payload, id: newEventId }]
      };
    
    case ACTIONS.UPDATE_EVENT:
      return {
        ...state,
        events: state.events.map(e => 
          e.id === action.payload.id ? action.payload : e
        )
      };
    
    case ACTIONS.DELETE_EVENT:
      return {
        ...state,
        events: state.events.filter(e => e.id !== action.payload)
      };
    
    case ACTIONS.ADD_TASK:
      const newTaskId = Date.now() + Math.random();
      return {
        ...state,
        tasks: [...state.tasks, { ...action.payload, id: newTaskId }]
      };
    
    case ACTIONS.UPDATE_TASK:
      return {
        ...state,
        tasks: state.tasks.map(t => 
          t.id === action.payload.id ? action.payload : t
        )
      };
    
    case ACTIONS.DELETE_TASK:
      return {
        ...state,
        tasks: state.tasks.filter(t => t.id !== action.payload)
      };
    
    case ACTIONS.ADD_REMINDER:
      const newReminderId = Date.now() + Math.random();
      return {
        ...state,
        reminders: [...state.reminders, { ...action.payload, id: newReminderId, notified: false }]
      };
    
    case ACTIONS.UPDATE_REMINDER:
      return {
        ...state,
        reminders: state.reminders.map(r => 
          r.id === action.payload.id ? action.payload : r
        )
      };
    
    case ACTIONS.DELETE_REMINDER:
      return {
        ...state,
        reminders: state.reminders.filter(r => r.id !== action.payload)
      };
    
    case ACTIONS.ADD_NOTE:
      const newNoteId = Date.now() + Math.random();
      return {
        ...state,
        notes: [...state.notes, { ...action.payload, id: newNoteId }]
      };
    
    case ACTIONS.UPDATE_NOTE:
      return {
        ...state,
        notes: state.notes.map(n => 
          n.id === action.payload.id ? action.payload : n
        )
      };
    
    case ACTIONS.DELETE_NOTE:
      return {
        ...state,
        notes: state.notes.filter(n => n.id !== action.payload)
      };
    
    case ACTIONS.LOAD_DATA:
      return {
        ...state,
        ...action.payload,
        loading: false,
        error: null
      };
    
    default:
      return state;
  }
}

// Context
const CalendarContext = createContext();

// Provider
export function CalendarProvider({ children }) {
  const [state, dispatch] = useReducer(calendarReducer, initialState);
  const [isInitialized, setIsInitialized] = useState(false);

  // Carregar dados do localStorage apenas uma vez na montagem
  useEffect(() => {
    const savedData = localStorage.getItem('calendar-data');
    
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        dispatch({ type: ACTIONS.LOAD_DATA, payload: data });
      } catch (error) {
        console.error('Erro ao carregar dados do calendário do localStorage:', error);
      }
    }
    
    setIsInitialized(true);
  }, []);

  // Salvar dados no localStorage apenas após inicialização
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('calendar-data', JSON.stringify({
        events: state.events,
        tasks: state.tasks,
        reminders: state.reminders,
        notes: state.notes
      }));
    }
  }, [state.events, state.tasks, state.reminders, state.notes, isInitialized]);

  // Actions - Memoizadas
  const addEvent = useCallback((event) => {
    dispatch({ type: ACTIONS.ADD_EVENT, payload: event });
  }, []);

  const updateEvent = useCallback((event) => {
    dispatch({ type: ACTIONS.UPDATE_EVENT, payload: event });
  }, []);

  const deleteEvent = useCallback((id) => {
    dispatch({ type: ACTIONS.DELETE_EVENT, payload: id });
  }, []);

  const addTask = useCallback((task) => {
    dispatch({ type: ACTIONS.ADD_TASK, payload: task });
  }, []);

  const updateTask = useCallback((task) => {
    dispatch({ type: ACTIONS.UPDATE_TASK, payload: task });
  }, []);

  const deleteTask = useCallback((id) => {
    dispatch({ type: ACTIONS.DELETE_TASK, payload: id });
  }, []);

  const addReminder = useCallback((reminder) => {
    dispatch({ type: ACTIONS.ADD_REMINDER, payload: reminder });
  }, []);

  const updateReminder = useCallback((reminder) => {
    dispatch({ type: ACTIONS.UPDATE_REMINDER, payload: reminder });
  }, []);

  const deleteReminder = useCallback((id) => {
    dispatch({ type: ACTIONS.DELETE_REMINDER, payload: id });
  }, []);

  const addNote = useCallback((note) => {
    dispatch({ type: ACTIONS.ADD_NOTE, payload: note });
  }, []);

  const updateNote = useCallback((note) => {
    dispatch({ type: ACTIONS.UPDATE_NOTE, payload: note });
  }, []);

  const deleteNote = useCallback((id) => {
    dispatch({ type: ACTIONS.DELETE_NOTE, payload: id });
  }, []);

  // Funções utilitárias
  const getItemsByDate = useCallback((date) => {
    // Normalizar a data para string YYYY-MM-DD
    let dateStr;
    if (typeof date === 'string') {
      dateStr = date.split('T')[0];
    } else if (date instanceof Date) {
      // Usar métodos locais para evitar problemas de timezone
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      dateStr = `${year}-${month}-${day}`;
    } else {
      dateStr = new Date(date).toISOString().split('T')[0];
    }
    
    return {
      events: state.events.filter(e => {
        if (!e.startDate) return false;
        const startDate = e.startDate.split('T')[0];
        const endDate = e.endDate ? e.endDate.split('T')[0] : startDate;
        return dateStr >= startDate && dateStr <= endDate;
      }),
      tasks: state.tasks.filter(t => {
        if (!t.dueDate) return false;
        const taskDate = t.dueDate.split('T')[0];
        return taskDate === dateStr;
      }),
      reminders: state.reminders.filter(r => {
        if (!r.date) return false;
        const reminderDate = r.date.split('T')[0];
        return reminderDate === dateStr;
      }),
      notes: state.notes.filter(n => {
        if (!n.date) return false;
        const noteDate = n.date.split('T')[0];
        return noteDate === dateStr;
      })
    };
  }, [state.events, state.tasks, state.reminders, state.notes]);

  const getItemsByDateRange = useCallback((startDate, endDate) => {
    const start = typeof startDate === 'string' ? startDate : startDate.toISOString().split('T')[0];
    const end = typeof endDate === 'string' ? endDate : endDate.toISOString().split('T')[0];
    
    return {
      events: state.events.filter(e => {
        if (!e.startDate) return false;
        const eventStart = e.startDate.split('T')[0];
        const eventEnd = e.endDate ? e.endDate.split('T')[0] : eventStart;
        return (eventStart >= start && eventStart <= end) || 
               (eventEnd >= start && eventEnd <= end) ||
               (eventStart <= start && eventEnd >= end);
      }),
      tasks: state.tasks.filter(t => {
        if (!t.dueDate) return false;
        const taskDate = t.dueDate.split('T')[0];
        return taskDate >= start && taskDate <= end;
      }),
      reminders: state.reminders.filter(r => {
        if (!r.date) return false;
        const reminderDate = r.date.split('T')[0];
        return reminderDate >= start && reminderDate <= end;
      }),
      notes: state.notes.filter(n => {
        if (!n.date) return false;
        const noteDate = n.date.split('T')[0];
        return noteDate >= start && noteDate <= end;
      })
    };
  }, [state.events, state.tasks, state.reminders, state.notes]);

  const getItemsByMonth = useCallback((year, month) => {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    return getItemsByDateRange(startDate, endDate);
  }, [getItemsByDateRange]);

  const getUpcomingReminders = useCallback(() => {
    const now = new Date();
    return state.reminders
      .filter(r => {
        const reminderDate = new Date(r.date);
        const advanceTime = r.advanceTime || 0;
        const notificationTime = new Date(reminderDate.getTime() - advanceTime * 60000);
        return notificationTime <= now && !r.notified;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [state.reminders]);

  const getPendingTasks = useCallback(() => {
    return state.tasks
      .filter(t => t.status !== TASK_STATUS.COMPLETED)
      .sort((a, b) => {
        const priorityOrder = { [PRIORITY.HIGH]: 3, [PRIORITY.MEDIUM]: 2, [PRIORITY.LOW]: 1 };
        const aPriority = priorityOrder[a.priority] || 0;
        const bPriority = priorityOrder[b.priority] || 0;
        if (aPriority !== bPriority) return bPriority - aPriority;
        return new Date(a.dueDate || 0) - new Date(b.dueDate || 0);
      });
  }, [state.tasks]);

  const value = useMemo(() => ({
    ...state,
    addEvent,
    updateEvent,
    deleteEvent,
    addTask,
    updateTask,
    deleteTask,
    addReminder,
    updateReminder,
    deleteReminder,
    addNote,
    updateNote,
    deleteNote,
    getItemsByDate,
    getItemsByDateRange,
    getItemsByMonth,
    getUpcomingReminders,
    getPendingTasks,
    CALENDAR_ITEM_TYPES,
    TASK_STATUS,
    PRIORITY,
    DEFAULT_COLORS
  }), [
    state,
    addEvent,
    updateEvent,
    deleteEvent,
    addTask,
    updateTask,
    deleteTask,
    addReminder,
    updateReminder,
    deleteReminder,
    addNote,
    updateNote,
    deleteNote,
    getItemsByDate,
    getItemsByDateRange,
    getItemsByMonth,
    getUpcomingReminders,
    getPendingTasks
  ]);

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
}

// Hook personalizado
export function useCalendar() {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendar deve ser usado dentro de um CalendarProvider');
  }
  return context;
}

