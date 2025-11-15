import React, { createContext, useContext, useReducer, useEffect, useState, useMemo, useCallback } from 'react';
import { useFinancial } from './FinancialContext';

// Cores padrão para calendários
export const DEFAULT_CALENDAR_COLORS = [
  '#3B82F6', // Azul
  '#10B981', // Verde
  '#F59E0B', // Laranja
  '#EF4444', // Vermelho
  '#8B5CF6', // Roxo
  '#EC4899', // Rosa
  '#14B8A6', // Ciano
  '#F97316', // Laranja escuro
];

// Estado inicial
const initialState = {
  events: [],
  notes: [],
  calendars: [],
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
  ADD_NOTE: 'ADD_NOTE',
  UPDATE_NOTE: 'UPDATE_NOTE',
  DELETE_NOTE: 'DELETE_NOTE',
  ADD_CALENDAR: 'ADD_CALENDAR',
  UPDATE_CALENDAR: 'UPDATE_CALENDAR',
  DELETE_CALENDAR: 'DELETE_CALENDAR',
  TOGGLE_CALENDAR_VISIBILITY: 'TOGGLE_CALENDAR_VISIBILITY',
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
    
    case ACTIONS.ADD_NOTE:
      const newNoteId = Date.now() + Math.random();
      const now = new Date().toISOString();
      return {
        ...state,
        notes: [...state.notes, { 
          ...action.payload, 
          id: newNoteId,
          createdAt: now,
          updatedAt: now
        }]
      };
    
    case ACTIONS.UPDATE_NOTE:
      return {
        ...state,
        notes: state.notes.map(n => 
          n.id === action.payload.id 
            ? { ...action.payload, updatedAt: new Date().toISOString() }
            : n
        )
      };
    
    case ACTIONS.DELETE_NOTE:
      return {
        ...state,
        notes: state.notes.filter(n => n.id !== action.payload)
      };
    
    case ACTIONS.ADD_CALENDAR:
      const newCalendarId = Date.now() + Math.random();
      return {
        ...state,
        calendars: [...state.calendars, { ...action.payload, id: newCalendarId, visible: true }]
      };
    
    case ACTIONS.UPDATE_CALENDAR:
      return {
        ...state,
        calendars: state.calendars.map(c => 
          c.id === action.payload.id ? action.payload : c
        )
      };
    
    case ACTIONS.DELETE_CALENDAR:
      return {
        ...state,
        calendars: state.calendars.filter(c => c.id !== action.payload),
        events: state.events.filter(e => e.calendarId !== action.payload)
      };
    
    case ACTIONS.TOGGLE_CALENDAR_VISIBILITY:
      return {
        ...state,
        calendars: state.calendars.map(c => 
          c.id === action.payload 
            ? { ...c, visible: !c.visible }
            : c
        )
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
  const { transactions, categories } = useFinancial();

  // Inicializar calendário de transações
  useEffect(() => {
    if (!isInitialized) {
      const savedData = localStorage.getItem('calendar-data');
      
      if (savedData) {
        try {
          const data = JSON.parse(savedData);
          // Verificar se já existe calendário de transações
          const hasTransactionsCalendar = data.calendars?.some(c => c.type === 'transactions');
          if (!hasTransactionsCalendar) {
            const transactionsCalendar = {
              id: 'transactions-calendar',
              name: 'Transações',
              color: '#3B82F6',
              visible: true,
              type: 'transactions'
            };
            data.calendars = [...(data.calendars || []), transactionsCalendar];
          }
          dispatch({ type: ACTIONS.LOAD_DATA, payload: data });
        } catch (error) {
          console.error('Erro ao carregar dados do calendário:', error);
          // Criar calendário padrão de transações em caso de erro
          const transactionsCalendar = {
            id: 'transactions-calendar',
            name: 'Transações',
            color: '#3B82F6',
            visible: true,
            type: 'transactions'
          };
          dispatch({ type: ACTIONS.ADD_CALENDAR, payload: transactionsCalendar });
        }
      } else {
        // Criar calendário padrão de transações
        const transactionsCalendar = {
          id: 'transactions-calendar',
          name: 'Transações',
          color: '#3B82F6',
          visible: true,
          type: 'transactions'
        };
        dispatch({ type: ACTIONS.ADD_CALENDAR, payload: transactionsCalendar });
      }
      
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Salvar dados no localStorage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('calendar-data', JSON.stringify({
        events: state.events,
        notes: state.notes,
        calendars: state.calendars
      }));
    }
  }, [state.events, state.notes, state.calendars, isInitialized]);

  // Actions
  const addEvent = useCallback((event) => {
    dispatch({ type: ACTIONS.ADD_EVENT, payload: event });
  }, []);

  const updateEvent = useCallback((event) => {
    dispatch({ type: ACTIONS.UPDATE_EVENT, payload: event });
  }, []);

  const deleteEvent = useCallback((id) => {
    dispatch({ type: ACTIONS.DELETE_EVENT, payload: id });
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

  const addCalendar = useCallback((calendar) => {
    dispatch({ type: ACTIONS.ADD_CALENDAR, payload: calendar });
  }, []);

  const updateCalendar = useCallback((calendar) => {
    dispatch({ type: ACTIONS.UPDATE_CALENDAR, payload: calendar });
  }, []);

  const deleteCalendar = useCallback((id) => {
    dispatch({ type: ACTIONS.DELETE_CALENDAR, payload: id });
  }, []);

  const toggleCalendarVisibility = useCallback((id) => {
    dispatch({ type: ACTIONS.TOGGLE_CALENDAR_VISIBILITY, payload: id });
  }, []);

  // Funções utilitárias
  const getEventsByDate = useCallback((date) => {
    const dateStr = new Date(date).toDateString();
    return state.events.filter(event => {
      const eventDate = new Date(event.start).toDateString();
      return eventDate === dateStr;
    });
  }, [state.events]);

  const getNotesByDate = useCallback((date) => {
    const dateStr = new Date(date).toDateString();
    return state.notes.filter(note => {
      const noteDate = new Date(note.date).toDateString();
      return noteDate === dateStr;
    });
  }, [state.notes]);

  const getEventsByDateRange = useCallback((startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    
    return state.events.filter(event => {
      const eventStart = new Date(event.start);
      return eventStart >= start && eventStart <= end;
    });
  }, [state.events]);

  const getNotesByDateRange = useCallback((startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    
    return state.notes.filter(note => {
      const noteDate = new Date(note.date);
      return noteDate >= start && noteDate <= end;
    });
  }, [state.notes]);

  // Integração com transações - converter transações em eventos
  const transactionEvents = useMemo(() => {
    const transactionsCalendar = state.calendars.find(c => c.type === 'transactions');
    if (!transactionsCalendar || !transactionsCalendar.visible) {
      return [];
    }

    return transactions.map(transaction => {
      let categoryColor = '#64748B';
      
      if (transaction.categoryId) {
        const category = categories.find(c => c.id === transaction.categoryId);
        if (category) {
          categoryColor = category.color;
        } else {
          categoryColor = transaction.type === 'income' ? '#10B981' : '#EF4444';
        }
      } else {
        categoryColor = transaction.type === 'income' ? '#10B981' : '#EF4444';
      }

      return {
        id: `transaction-${transaction.id}`,
        title: transaction.description || 'Transação',
        start: new Date(transaction.date),
        end: new Date(transaction.date),
        allDay: true,
        description: `Valor: R$ ${transaction.amount?.toFixed(2) || '0.00'}`,
        calendarId: transactionsCalendar.id,
        color: categoryColor,
        transactionId: transaction.id
      };
    });
  }, [transactions, state.calendars, categories]);

  // Combinar eventos customizados com eventos de transações
  const allEvents = useMemo(() => {
    const customEvents = state.events.filter(e => {
      const calendar = state.calendars.find(c => c.id === e.calendarId);
      return calendar && calendar.visible;
    });
      return [...customEvents, ...transactionEvents];
  }, [state.events, state.calendars, transactionEvents]);

  const value = useMemo(() => ({
    ...state,
    events: allEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    addNote,
    updateNote,
    deleteNote,
    addCalendar,
    updateCalendar,
    deleteCalendar,
    toggleCalendarVisibility,
    getEventsByDate,
    getNotesByDate,
    getEventsByDateRange,
    getNotesByDateRange,
    DEFAULT_CALENDAR_COLORS
  }), [
    state,
    allEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    addNote,
    updateNote,
    deleteNote,
    addCalendar,
    updateCalendar,
    deleteCalendar,
    toggleCalendarVisibility,
    getEventsByDate,
    getNotesByDate,
    getEventsByDateRange,
    getNotesByDateRange
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

