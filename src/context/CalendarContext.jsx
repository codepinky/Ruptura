import React, { createContext, useContext, useReducer, useEffect, useState, useMemo, useCallback } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

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
        events: action.payload.events !== undefined ? action.payload.events : state.events,
        tasks: action.payload.tasks !== undefined ? action.payload.tasks : state.tasks,
        reminders: action.payload.reminders !== undefined ? action.payload.reminders : state.reminders,
        notes: action.payload.notes !== undefined ? action.payload.notes : state.notes,
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
  const { currentUser } = useAuth();

  // Carregar dados do Firestore quando usuário estiver autenticado
  useEffect(() => {
    if (!currentUser) {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      setIsInitialized(true);
      return;
    }

    const userId = currentUser.uid;
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });

    // Sincronizar eventos
    const eventsRef = collection(db, 'users', userId, 'events');
    // Remover orderBy temporariamente para evitar problemas com índices
    const unsubscribeEvents = onSnapshot(
      eventsRef,
      (snapshot) => {
        const events = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        // Ordenar localmente
        events.sort((a, b) => {
          const dateA = a.startDate ? new Date(a.startDate) : new Date(0);
          const dateB = b.startDate ? new Date(b.startDate) : new Date(0);
          return dateB - dateA; // Descendente
        });
        console.log('📅 Eventos carregados:', events.length);
        dispatch({ type: ACTIONS.LOAD_DATA, payload: { events } });
      },
      (error) => {
        console.error('❌ Erro ao carregar eventos:', error);
        dispatch({ type: ACTIONS.SET_ERROR, payload: 'Erro ao carregar eventos' });
      }
    );

    // Sincronizar tarefas
    const tasksRef = collection(db, 'users', userId, 'tasks');
    const unsubscribeTasks = onSnapshot(
      tasksRef,
      (snapshot) => {
        const tasks = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        // Ordenar localmente
        tasks.sort((a, b) => {
          const dateA = a.dueDate ? new Date(a.dueDate) : new Date(0);
          const dateB = b.dueDate ? new Date(b.dueDate) : new Date(0);
          return dateB - dateA; // Descendente
        });
        console.log('✅ Tarefas carregadas:', tasks.length);
        dispatch({ type: ACTIONS.LOAD_DATA, payload: { tasks } });
      },
      (error) => {
        console.error('❌ Erro ao carregar tarefas:', error);
        dispatch({ type: ACTIONS.SET_ERROR, payload: 'Erro ao carregar tarefas' });
      }
    );

    // Sincronizar lembretes
    const remindersRef = collection(db, 'users', userId, 'reminders');
    const unsubscribeReminders = onSnapshot(
      remindersRef,
      (snapshot) => {
        const reminders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        // Ordenar localmente
        reminders.sort((a, b) => {
          const dateA = a.date ? new Date(a.date) : new Date(0);
          const dateB = b.date ? new Date(b.date) : new Date(0);
          return dateB - dateA; // Descendente
        });
        console.log('🔔 Lembretes carregados:', reminders.length);
        dispatch({ type: ACTIONS.LOAD_DATA, payload: { reminders } });
      },
      (error) => {
        console.error('❌ Erro ao carregar lembretes:', error);
        dispatch({ type: ACTIONS.SET_ERROR, payload: 'Erro ao carregar lembretes' });
      }
    );

    // Sincronizar notas
    const notesRef = collection(db, 'users', userId, 'notes');
    const unsubscribeNotes = onSnapshot(
      notesRef,
      (snapshot) => {
        const notes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        // Ordenar localmente
        notes.sort((a, b) => {
          const dateA = a.date ? new Date(a.date) : new Date(0);
          const dateB = b.date ? new Date(b.date) : new Date(0);
          return dateB - dateA; // Descendente
        });
        console.log('📝 Notas carregadas:', notes.length);
        dispatch({ type: ACTIONS.LOAD_DATA, payload: { notes } });
        setIsInitialized(true);
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      },
      (error) => {
        console.error('❌ Erro ao carregar notas:', error);
        dispatch({ type: ACTIONS.SET_ERROR, payload: 'Erro ao carregar notas' });
        setIsInitialized(true);
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      }
    );

    // Cleanup
    return () => {
      unsubscribeEvents();
      unsubscribeTasks();
      unsubscribeReminders();
      unsubscribeNotes();
    };
  }, [currentUser]);

  // Actions - Memoizadas
  // Função auxiliar para remover campos undefined
  const removeUndefinedFields = (obj) => {
    const cleaned = {};
    Object.keys(obj).forEach(key => {
      if (obj[key] !== undefined) {
        cleaned[key] = obj[key];
      }
    });
    return cleaned;
  };

  const addEvent = useCallback(async (event) => {
    if (!currentUser) {
      console.error('❌ Usuário não autenticado');
      return;
    }
    
    try {
      console.log('🔵 Adicionando evento:', event);
      const eventsRef = collection(db, 'users', currentUser.uid, 'events');
      // Remover campos undefined antes de salvar
      const cleanedEvent = removeUndefinedFields({
        ...event,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      const docRef = await addDoc(eventsRef, cleanedEvent);
      console.log('✅ Evento adicionado com ID:', docRef.id);
    } catch (error) {
      console.error('❌ Erro ao adicionar evento:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Erro ao adicionar evento' });
    }
  }, [currentUser]);

  const updateEvent = useCallback(async (event) => {
    if (!currentUser || !event.id) return;
    
    try {
      const eventRef = doc(db, 'users', currentUser.uid, 'events', event.id);
      const { id, ...eventData } = event;
      await updateDoc(eventRef, {
        ...eventData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Erro ao atualizar evento' });
    }
  }, [currentUser]);

  const deleteEvent = useCallback(async (id) => {
    if (!currentUser) return;
    
    try {
      const eventRef = doc(db, 'users', currentUser.uid, 'events', id);
      await deleteDoc(eventRef);
    } catch (error) {
      console.error('Erro ao deletar evento:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Erro ao deletar evento' });
    }
  }, [currentUser]);

  const addTask = useCallback(async (task) => {
    if (!currentUser) return;
    
    try {
      const tasksRef = collection(db, 'users', currentUser.uid, 'tasks');
      const cleanedTask = removeUndefinedFields({
        ...task,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      await addDoc(tasksRef, cleanedTask);
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Erro ao adicionar tarefa' });
    }
  }, [currentUser]);

  const updateTask = useCallback(async (task) => {
    if (!currentUser || !task.id) return;
    
    try {
      const taskRef = doc(db, 'users', currentUser.uid, 'tasks', task.id);
      const { id, ...taskData } = task;
      await updateDoc(taskRef, {
        ...taskData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Erro ao atualizar tarefa' });
    }
  }, [currentUser]);

  const deleteTask = useCallback(async (id) => {
    if (!currentUser) return;
    
    try {
      const taskRef = doc(db, 'users', currentUser.uid, 'tasks', id);
      await deleteDoc(taskRef);
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Erro ao deletar tarefa' });
    }
  }, [currentUser]);

  const addReminder = useCallback(async (reminder) => {
    if (!currentUser) return;
    
    try {
      const remindersRef = collection(db, 'users', currentUser.uid, 'reminders');
      const cleanedReminder = removeUndefinedFields({
        ...reminder,
        notified: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      await addDoc(remindersRef, cleanedReminder);
    } catch (error) {
      console.error('Erro ao adicionar lembrete:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Erro ao adicionar lembrete' });
    }
  }, [currentUser]);

  const updateReminder = useCallback(async (reminder) => {
    if (!currentUser || !reminder.id) return;
    
    try {
      const reminderRef = doc(db, 'users', currentUser.uid, 'reminders', reminder.id);
      const { id, ...reminderData } = reminder;
      await updateDoc(reminderRef, {
        ...reminderData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao atualizar lembrete:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Erro ao atualizar lembrete' });
    }
  }, [currentUser]);

  const deleteReminder = useCallback(async (id) => {
    if (!currentUser) return;
    
    try {
      const reminderRef = doc(db, 'users', currentUser.uid, 'reminders', id);
      await deleteDoc(reminderRef);
    } catch (error) {
      console.error('Erro ao deletar lembrete:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Erro ao deletar lembrete' });
    }
  }, [currentUser]);

  const addNote = useCallback(async (note) => {
    if (!currentUser) return;
    
    try {
      const notesRef = collection(db, 'users', currentUser.uid, 'notes');
      const cleanedNote = removeUndefinedFields({
        ...note,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      await addDoc(notesRef, cleanedNote);
    } catch (error) {
      console.error('Erro ao adicionar nota:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Erro ao adicionar nota' });
    }
  }, [currentUser]);

  const updateNote = useCallback(async (note) => {
    if (!currentUser || !note.id) return;
    
    try {
      const noteRef = doc(db, 'users', currentUser.uid, 'notes', note.id);
      const { id, ...noteData } = note;
      await updateDoc(noteRef, {
        ...noteData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao atualizar nota:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Erro ao atualizar nota' });
    }
  }, [currentUser]);

  const deleteNote = useCallback(async (id) => {
    if (!currentUser) return;
    
    try {
      const noteRef = doc(db, 'users', currentUser.uid, 'notes', id);
      await deleteDoc(noteRef);
    } catch (error) {
      console.error('Erro ao deletar nota:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Erro ao deletar nota' });
    }
  }, [currentUser]);

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

  // Funções de compatibilidade para componentes que usam getEventsByDate e getNotesByDate
  const getEventsByDate = useCallback((date) => {
    return getItemsByDate(date).events;
  }, [getItemsByDate]);

  const getNotesByDate = useCallback((date) => {
    return getItemsByDate(date).notes;
  }, [getItemsByDate]);

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
    getEventsByDate,
    getNotesByDate,
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
    getPendingTasks,
    getEventsByDate,
    getNotesByDate
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

