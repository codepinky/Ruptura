import React, { createContext, useContext, useReducer, useEffect, useState, useMemo, useCallback } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import { initializeUserData, DEFAULT_CATEGORIES } from '../utils/firebaseUtils';

// Tipos de transação
export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense'
};

// Categorias padrão serão carregadas do Firestore

// Estado inicial
const initialState = {
  transactions: [],
  categories: [],
  budgets: [],
  goals: [],
  savings: [],
  loading: false,
  error: null
};

// Actions
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  ADD_TRANSACTION: 'ADD_TRANSACTION',
  UPDATE_TRANSACTION: 'UPDATE_TRANSACTION',
  DELETE_TRANSACTION: 'DELETE_TRANSACTION',
  ADD_CATEGORY: 'ADD_CATEGORY',
  UPDATE_CATEGORY: 'UPDATE_CATEGORY',
  DELETE_CATEGORY: 'DELETE_CATEGORY',
  ADD_BUDGET: 'ADD_BUDGET',
  UPDATE_BUDGET: 'UPDATE_BUDGET',
  DELETE_BUDGET: 'DELETE_BUDGET',
  ADD_GOAL: 'ADD_GOAL',
  UPDATE_GOAL: 'UPDATE_GOAL',
  DELETE_GOAL: 'DELETE_GOAL',
  ADD_SAVING: 'ADD_SAVING',
  UPDATE_SAVING: 'UPDATE_SAVING',
  DELETE_SAVING: 'DELETE_SAVING',
  UPDATE_GOAL_PROGRESS: 'UPDATE_GOAL_PROGRESS',
  LOAD_DATA: 'LOAD_DATA'
};

// Reducer
function financialReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case ACTIONS.ADD_TRANSACTION:
      const newTransactionId = Date.now() + Math.random();
      return {
        ...state,
        transactions: [...state.transactions, { ...action.payload, id: newTransactionId }]
      };
    
    case ACTIONS.UPDATE_TRANSACTION:
      return {
        ...state,
        transactions: state.transactions.map(t => 
          t.id === action.payload.id ? action.payload : t
        )
      };
    
    case ACTIONS.DELETE_TRANSACTION:
      return {
        ...state,
        transactions: state.transactions.filter(t => t.id !== action.payload)
      };
    
    case ACTIONS.ADD_CATEGORY:
      return {
        ...state,
        categories: [...state.categories, { ...action.payload, id: Date.now() }]
      };
    
    case ACTIONS.UPDATE_CATEGORY:
      return {
        ...state,
        categories: state.categories.map(c => 
          c.id === action.payload.id ? action.payload : c
        )
      };
    
    case ACTIONS.DELETE_CATEGORY:
      return {
        ...state,
        categories: state.categories.filter(c => c.id !== action.payload)
      };
    
    case ACTIONS.ADD_BUDGET:
      // Gerar ID único usando timestamp + número aleatório para evitar duplicatas
      const uniqueId = Date.now() + Math.random();
      return {
        ...state,
        budgets: [...state.budgets, { ...action.payload, id: uniqueId }]
      };
    
    case ACTIONS.UPDATE_BUDGET:
      return {
        ...state,
        budgets: state.budgets.map(b => 
          b.id === action.payload.id ? action.payload : b
        )
      };
    
    case ACTIONS.DELETE_BUDGET:
      return {
        ...state,
        budgets: state.budgets.filter(b => b.id !== action.payload)
      };
    
    case ACTIONS.ADD_GOAL:
      return {
        ...state,
        goals: [...state.goals, { ...action.payload, id: Date.now() }]
      };
    
    case ACTIONS.UPDATE_GOAL:
      return {
        ...state,
        goals: state.goals.map(g => 
          g.id === action.payload.id ? action.payload : g
        )
      };
    
    case ACTIONS.DELETE_GOAL:
      return {
        ...state,
        goals: state.goals.filter(g => g.id !== action.payload)
      };
    
    case ACTIONS.ADD_SAVING:
      return {
        ...state,
        savings: [...state.savings, { ...action.payload, id: Date.now() }]
      };
    
    case ACTIONS.UPDATE_SAVING:
      return {
        ...state,
        savings: state.savings.map(s => 
          s.id === action.payload.id ? action.payload : s
        )
      };
    
    case ACTIONS.DELETE_SAVING:
      return {
        ...state,
        savings: state.savings.filter(s => s.id !== action.payload)
      };
    
    case ACTIONS.UPDATE_GOAL_PROGRESS:
      return {
        ...state,
        goals: state.goals.map(g => 
          g.id === action.payload.goalId 
            ? { ...g, currentAmount: action.payload.amount }
            : g
        )
      };
    
    case ACTIONS.LOAD_DATA:
      return {
        ...state,
        transactions: action.payload.transactions !== undefined ? action.payload.transactions : state.transactions,
        categories: action.payload.categories !== undefined ? action.payload.categories : state.categories,
        budgets: action.payload.budgets !== undefined ? action.payload.budgets : state.budgets,
        goals: action.payload.goals !== undefined ? action.payload.goals : state.goals,
        savings: action.payload.savings !== undefined ? action.payload.savings : state.savings,
        loading: false,
        error: null
      };
    
    default:
      return state;
  }
}

// Context
const FinancialContext = createContext();

// Provider
export function FinancialProvider({ children }) {
  const [state, dispatch] = useReducer(financialReducer, initialState);
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

    // Inicializar dados padrão se necessário
    initializeUserData(userId).catch(console.error);

    // Sincronizar transações
    const transactionsRef = collection(db, 'users', userId, 'transactions');
    const transactionsQuery = query(transactionsRef, orderBy('date', 'desc'));
    const unsubscribeTransactions = onSnapshot(
      transactionsQuery,
      (snapshot) => {
        const transactions = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        dispatch({ type: ACTIONS.LOAD_DATA, payload: { transactions } });
      },
      (error) => {
        console.error('Erro ao carregar transações:', error);
        dispatch({ type: ACTIONS.SET_ERROR, payload: 'Erro ao carregar transações' });
      }
    );

    // Sincronizar categorias
    const categoriesRef = collection(db, 'users', userId, 'categories');
    const unsubscribeCategories = onSnapshot(
      categoriesRef,
      (snapshot) => {
        const categories = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        dispatch({ type: ACTIONS.LOAD_DATA, payload: { categories } });
      },
      (error) => {
        console.error('Erro ao carregar categorias:', error);
        dispatch({ type: ACTIONS.SET_ERROR, payload: 'Erro ao carregar categorias' });
      }
    );

    // Sincronizar orçamentos
    const budgetsRef = collection(db, 'users', userId, 'budgets');
    const unsubscribeBudgets = onSnapshot(
      budgetsRef,
      (snapshot) => {
        const budgets = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        dispatch({ type: ACTIONS.LOAD_DATA, payload: { budgets } });
      },
      (error) => {
        console.error('Erro ao carregar orçamentos:', error);
        dispatch({ type: ACTIONS.SET_ERROR, payload: 'Erro ao carregar orçamentos' });
      }
    );

    // Sincronizar metas
    const goalsRef = collection(db, 'users', userId, 'goals');
    const unsubscribeGoals = onSnapshot(
      goalsRef,
      (snapshot) => {
        const goals = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        dispatch({ type: ACTIONS.LOAD_DATA, payload: { goals } });
      },
      (error) => {
        console.error('Erro ao carregar metas:', error);
        dispatch({ type: ACTIONS.SET_ERROR, payload: 'Erro ao carregar metas' });
      }
    );

    // Sincronizar economias
    const savingsRef = collection(db, 'users', userId, 'savings');
    const unsubscribeSavings = onSnapshot(
      savingsRef,
      (snapshot) => {
        const savings = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        dispatch({ type: ACTIONS.LOAD_DATA, payload: { savings } });
        setIsInitialized(true);
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      },
      (error) => {
        console.error('Erro ao carregar economias:', error);
        dispatch({ type: ACTIONS.SET_ERROR, payload: 'Erro ao carregar economias' });
        setIsInitialized(true);
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      }
    );

    // Cleanup
    return () => {
      unsubscribeTransactions();
      unsubscribeCategories();
      unsubscribeBudgets();
      unsubscribeGoals();
      unsubscribeSavings();
    };
  }, [currentUser]);

  // Actions - Memoizadas para evitar re-renderizações desnecessárias
  const addTransaction = useCallback(async (transaction) => {
    if (!currentUser) return;
    
    try {
      const transactionsRef = collection(db, 'users', currentUser.uid, 'transactions');
      await addDoc(transactionsRef, {
        ...transaction,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Erro ao adicionar transação' });
    }
  }, [currentUser]);

  const updateTransaction = useCallback(async (transaction) => {
    if (!currentUser || !transaction.id) return;
    
    try {
      const transactionRef = doc(db, 'users', currentUser.uid, 'transactions', transaction.id);
      const { id, ...transactionData } = transaction;
      await updateDoc(transactionRef, {
        ...transactionData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Erro ao atualizar transação' });
    }
  }, [currentUser]);

  const deleteTransaction = useCallback(async (id) => {
    if (!currentUser) return;
    
    try {
      const transactionRef = doc(db, 'users', currentUser.uid, 'transactions', id);
      await deleteDoc(transactionRef);
    } catch (error) {
      console.error('Erro ao deletar transação:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Erro ao deletar transação' });
    }
  }, [currentUser]);

  const duplicateTransaction = useCallback(async (transaction) => {
    if (!currentUser) return;
    
    const { id, ...transactionData } = transaction;
    const duplicatedTransaction = {
      ...transactionData,
      date: new Date().toISOString().split('T')[0]
    };
    await addTransaction(duplicatedTransaction);
  }, [currentUser, addTransaction]);

  const addCategory = useCallback(async (category) => {
    if (!currentUser) return;
    
    try {
      const categoriesRef = collection(db, 'users', currentUser.uid, 'categories');
      await addDoc(categoriesRef, {
        ...category,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Erro ao adicionar categoria' });
    }
  }, [currentUser]);

  const updateCategory = useCallback(async (category) => {
    if (!currentUser || !category.id) return;
    
    try {
      const categoryRef = doc(db, 'users', currentUser.uid, 'categories', category.id);
      const { id, ...categoryData } = category;
      await updateDoc(categoryRef, categoryData);
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Erro ao atualizar categoria' });
    }
  }, [currentUser]);

  const deleteCategory = useCallback(async (id) => {
    if (!currentUser) return;
    
    try {
      const categoryRef = doc(db, 'users', currentUser.uid, 'categories', id);
      await deleteDoc(categoryRef);
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Erro ao deletar categoria' });
    }
  }, [currentUser]);

  const addBudget = useCallback(async (budget) => {
    if (!currentUser) return;
    
    try {
      const budgetsRef = collection(db, 'users', currentUser.uid, 'budgets');
      await addDoc(budgetsRef, {
        ...budget,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao adicionar orçamento:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Erro ao adicionar orçamento' });
    }
  }, [currentUser]);

  const updateBudget = useCallback(async (budget) => {
    if (!currentUser || !budget.id) return;
    
    try {
      const budgetRef = doc(db, 'users', currentUser.uid, 'budgets', budget.id);
      const { id, ...budgetData } = budget;
      await updateDoc(budgetRef, {
        ...budgetData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao atualizar orçamento:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Erro ao atualizar orçamento' });
    }
  }, [currentUser]);

  const deleteBudget = useCallback(async (id) => {
    if (!currentUser) return;
    
    try {
      const budgetRef = doc(db, 'users', currentUser.uid, 'budgets', id);
      await deleteDoc(budgetRef);
    } catch (error) {
      console.error('Erro ao deletar orçamento:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Erro ao deletar orçamento' });
    }
  }, [currentUser]);

  const addGoal = useCallback(async (goal) => {
    if (!currentUser) return;
    
    try {
      const goalsRef = collection(db, 'users', currentUser.uid, 'goals');
      await addDoc(goalsRef, {
        ...goal,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao adicionar meta:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Erro ao adicionar meta' });
    }
  }, [currentUser]);

  const updateGoal = useCallback(async (goal) => {
    if (!currentUser || !goal.id) return;
    
    try {
      const goalRef = doc(db, 'users', currentUser.uid, 'goals', goal.id);
      const { id, ...goalData } = goal;
      await updateDoc(goalRef, {
        ...goalData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao atualizar meta:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Erro ao atualizar meta' });
    }
  }, [currentUser]);

  const deleteGoal = useCallback(async (id) => {
    if (!currentUser) return;
    
    try {
      const goalRef = doc(db, 'users', currentUser.uid, 'goals', id);
      await deleteDoc(goalRef);
    } catch (error) {
      console.error('Erro ao deletar meta:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Erro ao deletar meta' });
    }
  }, [currentUser]);

  const addSaving = useCallback(async (saving) => {
    if (!currentUser) return;
    
    try {
      const savingsRef = collection(db, 'users', currentUser.uid, 'savings');
      await addDoc(savingsRef, {
        ...saving,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao adicionar economia:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Erro ao adicionar economia' });
    }
  }, [currentUser]);

  const updateSaving = useCallback(async (saving) => {
    if (!currentUser || !saving.id) return;
    
    try {
      const savingRef = doc(db, 'users', currentUser.uid, 'savings', saving.id);
      const { id, ...savingData } = saving;
      await updateDoc(savingRef, {
        ...savingData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao atualizar economia:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Erro ao atualizar economia' });
    }
  }, [currentUser]);

  const deleteSaving = useCallback(async (id) => {
    if (!currentUser) return;
    
    try {
      const savingRef = doc(db, 'users', currentUser.uid, 'savings', id);
      await deleteDoc(savingRef);
    } catch (error) {
      console.error('Erro ao deletar economia:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Erro ao deletar economia' });
    }
  }, [currentUser]);

  const updateGoalProgress = useCallback(async (goalId, amount) => {
    if (!currentUser) return;
    
    try {
      const goalRef = doc(db, 'users', currentUser.uid, 'goals', goalId);
      await updateDoc(goalRef, {
        currentAmount: amount,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao atualizar progresso da meta:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Erro ao atualizar progresso da meta' });
    }
  }, [currentUser]);

  // Funções utilitárias
  const getTransactionsByMonth = (year, month) => {
    return state.transactions.filter(t => {
      const date = new Date(t.date);
      return date.getFullYear() === year && date.getMonth() === month;
    });
  };

  const getTransactionsByCategory = (categoryId) => {
    return state.transactions.filter(t => t.categoryId === categoryId);
  };

  const getTotalIncome = (transactions = state.transactions) => {
    if (!transactions || !Array.isArray(transactions)) return 0;
    return transactions
      .filter(t => t && t.type === TRANSACTION_TYPES.INCOME && typeof t.amount === 'number')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalExpense = (transactions = state.transactions) => {
    if (!transactions || !Array.isArray(transactions)) return 0;
    return transactions
      .filter(t => t && t.type === TRANSACTION_TYPES.EXPENSE && typeof t.amount === 'number')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getBalance = (transactions = state.transactions) => {
    return getTotalIncome(transactions) - getTotalExpense(transactions);
  };

  const getGoalsProgress = () => {
    return state.goals.map(goal => {
      const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
      const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
      const daysRemaining = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
      
      return {
        ...goal,
        progress: Math.min(100, Math.max(0, progress)), // Limitar entre 0 e 100%
        remaining,
        daysRemaining: Math.max(0, daysRemaining) // Não permitir dias negativos
      };
    });
  };

  const getTotalSavings = () => {
    if (!state.savings || !Array.isArray(state.savings)) return 0;
    return state.savings
      .filter(s => s && typeof s.currentAmount === 'number')
      .reduce((sum, s) => sum + (s.currentAmount || 0), 0);
  };

  const getMonthlySavings = () => {
    // Retorna o total de economias (mantido para compatibilidade, mas pode ser removido se não for usado)
    return getTotalSavings();
  };

  const getExpenseAnalysis = (year = new Date().getFullYear(), month = new Date().getMonth()) => {
    const monthlyExpenses = state.transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === month && 
             date.getFullYear() === year && 
             t.type === TRANSACTION_TYPES.EXPENSE;
    });

    const categoryTotals = {};
    monthlyExpenses.forEach(transaction => {
      const category = state.categories.find(c => c.id === transaction.categoryId);
      if (category) {
        if (!categoryTotals[category.name]) {
          categoryTotals[category.name] = 0;
        }
        categoryTotals[category.name] += transaction.amount;
      }
    });

    const totalExpenses = getTotalExpense(monthlyExpenses);
    
    return Object.entries(categoryTotals)
      .map(([name, amount]) => ({
        category: name,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);
  };

  // Funções de projeção conforme documentação @financeiro
  const getMonthlyProjection = (months = 1) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyIncome = getTotalIncome(getTransactionsByMonth(currentYear, currentMonth));
    const monthlyExpense = getTotalExpense(getTransactionsByMonth(currentYear, currentMonth));
    const monthlyBalance = monthlyIncome - monthlyExpense;
    
    return {
      projectedIncome: monthlyIncome * months,
      projectedExpense: monthlyExpense * months,
      projectedBalance: monthlyBalance * months,
      monthlyAverage: {
        income: monthlyIncome,
        expense: monthlyExpense,
        balance: monthlyBalance
      }
    };
  };

  const getYearlyProjection = () => {
    const currentYear = new Date().getFullYear();
    const yearTransactions = state.transactions.filter(t => {
      const date = new Date(t.date);
      return date.getFullYear() === currentYear;
    });
    
    const yearlyIncome = getTotalIncome(yearTransactions);
    const yearlyExpense = getTotalExpense(yearTransactions);
    const yearlyBalance = yearlyIncome - yearlyExpense;
    
    const monthsPassed = new Date().getMonth() + 1;
    const monthsRemaining = 12 - monthsPassed;
    
    return {
      currentYear: {
        income: yearlyIncome,
        expense: yearlyExpense,
        balance: yearlyBalance
      },
      projection: {
        income: monthsPassed > 0 ? (yearlyIncome / monthsPassed) * 12 : 0,
        expense: monthsPassed > 0 ? (yearlyExpense / monthsPassed) * 12 : 0,
        balance: monthsPassed > 0 ? (yearlyBalance / monthsPassed) * 12 : 0
      },
      remaining: {
        months: monthsRemaining,
        projectedIncome: monthsPassed > 0 ? (yearlyIncome / monthsPassed) * monthsRemaining : 0,
        projectedExpense: monthsPassed > 0 ? (yearlyExpense / monthsPassed) * monthsRemaining : 0,
        projectedBalance: monthsPassed > 0 ? (yearlyBalance / monthsPassed) * monthsRemaining : 0
      }
    };
  };

  const getCategoryTrends = (categoryId, months = 6) => {
    const trends = [];
    const currentDate = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthTransactions = getTransactionsByMonth(targetDate.getFullYear(), targetDate.getMonth())
        .filter(t => t.categoryId === categoryId);
      
      const income = getTotalIncome(monthTransactions);
      const expense = getTotalExpense(monthTransactions);
      
      trends.push({
        month: targetDate.getMonth(),
        year: targetDate.getFullYear(),
        monthName: targetDate.toLocaleDateString('pt-BR', { month: 'short' }),
        income,
        expense,
        balance: income - expense
      });
    }
    
    return trends;
  };

  const value = useMemo(() => ({
    ...state,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    duplicateTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    addBudget,
    updateBudget,
    deleteBudget,
    addGoal,
    updateGoal,
    deleteGoal,
    addSaving,
    updateSaving,
    deleteSaving,
    updateGoalProgress,
    getTransactionsByMonth,
    getTransactionsByCategory,
    getTotalIncome,
    getTotalExpense,
    getBalance,
    getGoalsProgress,
    getTotalSavings,
    getMonthlySavings,
    getExpenseAnalysis,
    getMonthlyProjection,
    getYearlyProjection,
    getCategoryTrends,
    TRANSACTION_TYPES
  }), [
    state,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    duplicateTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    addBudget,
    updateBudget,
    deleteBudget,
    addGoal,
    updateGoal,
    deleteGoal,
    addSaving,
    updateSaving,
    deleteSaving,
    updateGoalProgress
  ]);

  return (
    <FinancialContext.Provider value={value}>
      {children}
    </FinancialContext.Provider>
  );
}

// Hook personalizado
export function useFinancial() {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancial deve ser usado dentro de um FinancialProvider');
  }
  return context;
}
