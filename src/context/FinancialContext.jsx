import React, { createContext, useContext, useReducer, useEffect, useState, useMemo, useCallback } from 'react';

// Tipos de transação
export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense'
};

// Categorias padrão
const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Salário', type: TRANSACTION_TYPES.INCOME, color: '#10B981' },
  { id: 2, name: 'Freelance', type: TRANSACTION_TYPES.INCOME, color: '#3B82F6' },
  { id: 3, name: 'Investimentos', type: TRANSACTION_TYPES.INCOME, color: '#8B5CF6' },
  { id: 4, name: 'Alimentação', type: TRANSACTION_TYPES.EXPENSE, color: '#F59E0B' },
  { id: 5, name: 'Transporte', type: TRANSACTION_TYPES.EXPENSE, color: '#EF4444' },
  { id: 6, name: 'Moradia', type: TRANSACTION_TYPES.EXPENSE, color: '#6B7280' },
  { id: 7, name: 'Saúde', type: TRANSACTION_TYPES.EXPENSE, color: '#EC4899' },
  { id: 8, name: 'Educação', type: TRANSACTION_TYPES.EXPENSE, color: '#14B8A6' },
  { id: 9, name: 'Lazer', type: TRANSACTION_TYPES.EXPENSE, color: '#F97316' },
  { id: 10, name: 'Outros', type: TRANSACTION_TYPES.EXPENSE, color: '#64748B' },
  { id: 11, name: 'Roupas', type: TRANSACTION_TYPES.EXPENSE, color: '#F43F5E' },
  { id: 12, name: 'Tecnologia', type: TRANSACTION_TYPES.EXPENSE, color: '#06B6D4' },
  { id: 13, name: 'Academia', type: TRANSACTION_TYPES.EXPENSE, color: '#84CC16' },
  { id: 14, name: 'Streaming', type: TRANSACTION_TYPES.EXPENSE, color: '#8B5CF6' },
  { id: 15, name: 'Combustível', type: TRANSACTION_TYPES.EXPENSE, color: '#F97316' },
  { id: 16, name: 'Presentes', type: TRANSACTION_TYPES.EXPENSE, color: '#EC4899' },
  { id: 17, name: 'Farmácia', type: TRANSACTION_TYPES.EXPENSE, color: '#14B8A6' },
  { id: 18, name: 'Viagem', type: TRANSACTION_TYPES.EXPENSE, color: '#3B82F6' },
  { id: 19, name: 'Café', type: TRANSACTION_TYPES.EXPENSE, color: '#F59E0B' },
  { id: 20, name: 'Bônus', type: TRANSACTION_TYPES.INCOME, color: '#10B981' }
];

// Estado inicial
const initialState = {
  transactions: [],
  categories: DEFAULT_CATEGORIES,
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
        ...action.payload,
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


  // Carregar dados do localStorage apenas uma vez na montagem
  useEffect(() => {
    const savedData = localStorage.getItem('financial-data');
    
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        // Carregar dados salvos
        dispatch({ type: ACTIONS.LOAD_DATA, payload: data });
      } catch (error) {
        console.error('Erro ao carregar dados do localStorage:', error);
      }
    }
    
    setIsInitialized(true);
  }, []);

  // Salvar dados no localStorage apenas após inicialização
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('financial-data', JSON.stringify({
        transactions: state.transactions,
        categories: state.categories,
        budgets: state.budgets,
        goals: state.goals,
        savings: state.savings
      }));
    }
  }, [state.transactions, state.categories, state.budgets, state.goals, state.savings, isInitialized]);

  // Actions - Memoizadas para evitar re-renderizações desnecessárias
  const addTransaction = useCallback((transaction) => {
    dispatch({ type: ACTIONS.ADD_TRANSACTION, payload: transaction });
  }, []);

  const updateTransaction = useCallback((transaction) => {
    dispatch({ type: ACTIONS.UPDATE_TRANSACTION, payload: transaction });
  }, []);

  const deleteTransaction = useCallback((id) => {
    dispatch({ type: ACTIONS.DELETE_TRANSACTION, payload: id });
  }, []);

  const duplicateTransaction = useCallback((transaction) => {
    const { id, ...transactionData } = transaction;
    const duplicatedTransaction = {
      ...transactionData,
      date: new Date().toISOString().split('T')[0], // Data atual
    };
    dispatch({ type: ACTIONS.ADD_TRANSACTION, payload: duplicatedTransaction });
  }, []);

  const addCategory = useCallback((category) => {
    dispatch({ type: ACTIONS.ADD_CATEGORY, payload: category });
  }, []);

  const updateCategory = useCallback((category) => {
    dispatch({ type: ACTIONS.UPDATE_CATEGORY, payload: category });
  }, []);

  const deleteCategory = useCallback((id) => {
    dispatch({ type: ACTIONS.DELETE_CATEGORY, payload: id });
  }, []);

  const addBudget = useCallback((budget) => {
    dispatch({ type: ACTIONS.ADD_BUDGET, payload: budget });
  }, []);

  const updateBudget = useCallback((budget) => {
    dispatch({ type: ACTIONS.UPDATE_BUDGET, payload: budget });
  }, []);

  const deleteBudget = useCallback((id) => {
    dispatch({ type: ACTIONS.DELETE_BUDGET, payload: id });
  }, []);

  const addGoal = useCallback((goal) => {
    dispatch({ type: ACTIONS.ADD_GOAL, payload: goal });
  }, []);

  const updateGoal = useCallback((goal) => {
    dispatch({ type: ACTIONS.UPDATE_GOAL, payload: goal });
  }, []);

  const deleteGoal = useCallback((id) => {
    dispatch({ type: ACTIONS.DELETE_GOAL, payload: id });
  }, []);

  const addSaving = useCallback((saving) => {
    dispatch({ type: ACTIONS.ADD_SAVING, payload: saving });
  }, []);

  const updateSaving = useCallback((saving) => {
    dispatch({ type: ACTIONS.UPDATE_SAVING, payload: saving });
  }, []);

  const deleteSaving = useCallback((id) => {
    dispatch({ type: ACTIONS.DELETE_SAVING, payload: id });
  }, []);

  const updateGoalProgress = useCallback((goalId, amount) => {
    dispatch({ type: ACTIONS.UPDATE_GOAL_PROGRESS, payload: { goalId, amount } });
  }, []);

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
      .filter(s => s && s.active && typeof s.amount === 'number')
      .reduce((sum, s) => sum + s.amount, 0);
  };

  const getMonthlySavings = () => {
    if (!state.savings || !Array.isArray(state.savings)) return 0;
    return state.savings
      .filter(s => s && s.active && s.frequency === 'monthly' && typeof s.amount === 'number')
      .reduce((sum, s) => sum + s.amount, 0);
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
